import { appState } from '../app-state/state'
import { makeDirtyFlag } from './utils/dirty'
import { getDeviceMonitor } from './utils/device-monitor'
import logger from '@core-logger'
import type { PathType } from '@shared/core/shared-types'
import { handleUpdate } from './handleUpdate'
import { nativeImage, Notification } from 'electron'
import erroricon from '@resources/error_icon.png?asset'
import trayManager from '../menu'

export type FetchTask = (dirtyPaths: PathType) => Promise<void> | void

function normalizeToMountPoint(path: string): string {
  if (!path) return '/'
  const parts = path.split('/').filter(Boolean)
  if (parts[0] === 'Volumes' && parts[1]) {
    return `/Volumes/${parts[1]}`
  }
  return '/'
}

function getVolumeNameFromMountPoint(mountPoint: string): string {
  if (mountPoint.startsWith('/Volumes/')) {
    const parts = mountPoint.split('/').filter(Boolean)
    return parts.length > 1 ? parts[1] : mountPoint
  }
  // For root path, default to Macintosh HD (common macOS system volume name)
  return 'Macintosh HD'
}

type TypeEnum = 'ocf' | 'sound' | 'proxy'

type WatcherInfo = {
  path: string
  pathType: TypeEnum
  mountPoint: string
  volumeName: string
  dirtyFlag: ReturnType<typeof makeDirtyFlag>
}

let controller: {
  watchers: WatcherInfo[]
  debounceTimer: NodeJS.Timeout | null
  monitorUnsubscribe: (() => void) | null
  task: FetchTask
  dirtyCheckInterval: NodeJS.Timeout | null
  previousDirtyState: { ocf: boolean; sound: boolean; proxy: boolean } | null
} | null = null

const DEBOUNCE_MS = 2000

function checkAndProcessDirtyPaths(): void {
  if (!controller) return

  const dirtyWatchers = controller.watchers.filter((w) => w.dirtyFlag.isDirty())

  if (dirtyWatchers.length === 0) {
    // No dirty paths, check if we should stop diskio
    const monitor = getDeviceMonitor()
    if (monitor.isRunning()) {
      const allVolumes = controller.watchers.map((w) => w.volumeName)
      const uniqueVolumes = [...new Set(allVolumes)]
      if (monitor.areVolumesIdle(uniqueVolumes)) {
        logger.debug('[autoupdate] All volumes idle and no dirty paths, stopping diskio')
        monitor.stop()
      }
    }
    return
  }

  // Get unique volumes for dirty paths
  const dirtyVolumes = [...new Set(dirtyWatchers.map((w) => w.volumeName))]
  const monitor = getDeviceMonitor()

  // Check if all dirty volumes are idle
  const areDirtyVolumesIdle = monitor.areVolumesIdle(dirtyVolumes)

  if (areDirtyVolumesIdle) {
    // Map dirty paths back to original structure using pathType
    const dirtyOcf = dirtyWatchers.filter((w) => w.pathType === 'ocf').map((w) => w.path)
    const dirtySound = dirtyWatchers.filter((w) => w.pathType === 'sound').map((w) => w.path)
    const dirtyProxy = dirtyWatchers.filter((w) => w.pathType === 'proxy').map((w) => w.path)

    const dirtyPaths: PathType = {
      ocf: dirtyOcf.length > 0 ? dirtyOcf : null,
      sound: dirtySound.length > 0 ? dirtySound : null,
      proxy: dirtyProxy.length > 0 ? dirtyProxy : null
    }

    logger.debug(`[autoupdate] Processing dirty paths:`, dirtyPaths)

    // Execute action with mapped dirty paths
    Promise.resolve(controller.task(dirtyPaths)).catch((err) => {
      logger.error('[autoupdate]:', err)
    })

    // Clear all dirty flags
    dirtyWatchers.forEach((w) => w.dirtyFlag.clear())

    // Update menu after clearing dirty flags
    if (controller) {
      const currentDirtyState = getDirtyPathsByType()
      controller.previousDirtyState = currentDirtyState
      trayManager.createOrUpdateTray()
    }

    // Check if we should stop diskio
    const allVolumes = controller.watchers.map((w) => w.volumeName)
    const uniqueVolumes = [...new Set(allVolumes)]
    if (monitor.areVolumesIdle(uniqueVolumes)) {
      logger.debug('[autoupdate] All volumes idle, stopping deviceIdle monitor')
      monitor.stop()
    }
  }
}

function onDeviceIdleUpdate(): void {
  if (!controller) return

  // Check if we have dirty paths
  const dirtyWatchers = controller.watchers.filter((w) => w.dirtyFlag.isDirty())
  const hasDirtyPaths = dirtyWatchers.length > 0

  if (!hasDirtyPaths) {
    // No dirty paths, check if we should stop diskio
    const monitor = getDeviceMonitor()
    if (monitor.isRunning()) {
      const allVolumes = controller.watchers.map((w) => w.volumeName)
      const uniqueVolumes = [...new Set(allVolumes)]
      if (monitor.areVolumesIdle(uniqueVolumes)) {
        logger.debug('[autoupdate] All volumes idle and no dirty paths, stopping diskio')
        monitor.stop()
      }
    }
    return
  }

  // We have dirty paths - check if volumes are already idle
  const dirtyVolumes = [...new Set(dirtyWatchers.map((w) => w.volumeName))]
  const monitor = getDeviceMonitor()
  const areDirtyVolumesIdle = monitor.areVolumesIdle(dirtyVolumes)

  // If volumes are already idle, process after debounce (don't reset timer if already set)
  // If volumes are not idle, clear timer and wait for them to become idle
  if (areDirtyVolumesIdle) {
    // Volumes are idle - set timer if not already set, otherwise let existing timer fire
    if (!controller.debounceTimer) {
      controller.debounceTimer = setTimeout(() => {
        if (controller) {
          controller.debounceTimer = null
          checkAndProcessDirtyPaths()
        }
      }, DEBOUNCE_MS)
    }
  } else {
    // Volumes not idle yet - clear timer and wait for next update
    if (controller.debounceTimer) {
      clearTimeout(controller.debounceTimer)
      controller.debounceTimer = null
    }
  }
}

function onPathBecameDirty(): void {
  if (!controller) return

  const monitor = getDeviceMonitor()

  // Start deviceIdle if not running
  if (!monitor.isRunning()) {
    logger.debug('[autoupdate] Path became dirty, starting deviceIdle monitor')
    monitor.start()

    // Subscribe to deviceIdle updates
    if (!controller.monitorUnsubscribe) {
      controller.monitorUnsubscribe = monitor.onUpdate(() => {
        onDeviceIdleUpdate()
      })
    }
  }

  // Trigger debounced check
  onDeviceIdleUpdate()
}

export const startAutoUpdate = (
  task: FetchTask = async (dirtyPaths: PathType) => {
    logger.debug('[autoupdate] Auto update running for paths:', dirtyPaths)
    const res = await handleUpdate(dirtyPaths)
    if (!res.success) {
      logger.warn('[autoupdate] Update failed, stopping autoupdater')
      const errornotification = new Notification({
        title: 'Autoupdate failed, stopping autoupdater',
        body: res.error,
        icon: nativeImage.createFromPath(erroricon)
      })
      errornotification.show()
      stopAutoUpdate()
    }
  }
) => {
  if (controller) {
    logger.info('[autoupdate] Already running')
    return
  }

  const ocfPaths = appState.project?.activeLog?.paths?.ocf || []
  const soundPaths = appState.project?.activeLog?.paths?.sound || []
  const proxyPath = appState.project?.activeLog?.paths?.proxy || []

  // Flatten all paths with their types
  const pathsWithTypes: Array<{ path: string; pathType: TypeEnum }> = [
    ...ocfPaths.map((path) => ({ path, pathType: 'ocf' as const })),
    ...soundPaths.map((path) => ({ path, pathType: 'sound' as const })),
    ...proxyPath.map((path) => ({ path, pathType: 'proxy' as const }))
  ]

  if (pathsWithTypes.length === 0) {
    logger.info('[autoupdate] No paths to watch')
    return
  }

  logger.info(
    `[autoupdate] Creating watchers for paths: ${pathsWithTypes.map((p) => p.path).join(', ')}`
  )

  const watchers: WatcherInfo[] = pathsWithTypes.map(({ path, pathType }) => {
    const mountPoint = normalizeToMountPoint(path)
    const volumeName = getVolumeNameFromMountPoint(mountPoint)
    const dirtyFlag = makeDirtyFlag(path)
    return {
      path,
      pathType,
      mountPoint,
      volumeName,
      dirtyFlag
    }
  })

  controller = {
    watchers,
    debounceTimer: null,
    monitorUnsubscribe: null,
    task,
    dirtyCheckInterval: null,
    previousDirtyState: { ocf: false, sound: false, proxy: false }
  }

  // Poll dirty flags periodically to detect when paths become dirty
  // fsevents sets the flag but doesn't provide a callback mechanism
  const checkDirtyFlags = () => {
    if (!controller) return

    const hasDirty = controller.watchers.some((w) => w.dirtyFlag.isDirty())
    if (hasDirty && !getDeviceMonitor().isRunning()) {
      onPathBecameDirty()
    }

    // Check if dirty state has changed and update menu if needed
    const currentDirtyState = getDirtyPathsByType()
    const previousState = controller.previousDirtyState
    const stateChanged =
      !previousState ||
      previousState.ocf !== currentDirtyState.ocf ||
      previousState.sound !== currentDirtyState.sound ||
      previousState.proxy !== currentDirtyState.proxy

    if (stateChanged) {
      controller.previousDirtyState = currentDirtyState
      trayManager.createOrUpdateTray()
    }

    // Check every second
    controller.dirtyCheckInterval = setTimeout(checkDirtyFlags, 1000)
  }

  checkDirtyFlags()

  logger.info('[autoupdate] Started')
}

export const stopAutoUpdate = () => {
  if (!controller) return

  // Clear debounce timer
  if (controller.debounceTimer) {
    clearTimeout(controller.debounceTimer)
    controller.debounceTimer = null
  }

  // Clear dirty check interval
  if (controller.dirtyCheckInterval) {
    clearTimeout(controller.dirtyCheckInterval)
    controller.dirtyCheckInterval = null
  }

  // Unsubscribe from diskio updates
  if (controller.monitorUnsubscribe) {
    controller.monitorUnsubscribe()
    controller.monitorUnsubscribe = null
  }

  // Stop all dirty flags
  controller.watchers.forEach((w) => w.dirtyFlag.stop())

  // Stop diskio monitor
  const monitor = getDeviceMonitor()
  if (monitor.isRunning()) {
    monitor.stop()
  }

  controller = null
  logger.info('[autoupdate] Stopped')
}

export const isAutoUpdateRunning = (): boolean => controller !== null

export const getDirtyPathsByType = (): { ocf: boolean; sound: boolean; proxy: boolean } => {
  if (!controller) {
    return { ocf: false, sound: false, proxy: false }
  }

  const dirtyWatchers = controller.watchers.filter((w) => w.dirtyFlag.isDirty())

  return {
    ocf: dirtyWatchers.some((w) => w.pathType === 'ocf'),
    sound: dirtyWatchers.some((w) => w.pathType === 'sound'),
    proxy: dirtyWatchers.some((w) => w.pathType === 'proxy')
  }
}

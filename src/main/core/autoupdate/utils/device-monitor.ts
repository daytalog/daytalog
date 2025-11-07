import { spawn, ChildProcess } from 'child_process'
import { getDeviceVolumeMap } from './device-volume-map'
import deviceIdlePath from '@resources/deviceidle?asset&asarUnpack'
import logger from '@core-logger'

type DeviceIdleStatus = {
  device: string
  idle: boolean
}

type VolumeIdleState = {
  [volumeName: string]: boolean
}

type DeviceMonitor = {
  start: () => void
  stop: () => void
  isVolumeIdle: (volumeName: string) => boolean
  areVolumesIdle: (volumeNames: string[]) => boolean
  getVolumeIdleState: () => VolumeIdleState
  onUpdate: (callback: (volumeIdleState: VolumeIdleState) => void) => () => void
  isRunning: () => boolean
}

function createDeviceMonitor(): DeviceMonitor {
  let process: ChildProcess | null = null
  const deviceIdleMap = new Map<string, boolean>()
  const deviceVolumeMap: Record<string, string[]> = getDeviceVolumeMap()
  let volumeIdleState: VolumeIdleState = {}
  const listeners = new Set<(volumeIdleState: VolumeIdleState) => void>()

  function updateDeviceStates(data: DeviceIdleStatus[]): void {
    // Update device idle states
    for (const item of data) {
      deviceIdleMap.set(item.device, item.idle)
    }

    // Map devices to volumes and update volume idle states
    const newVolumeIdleState: VolumeIdleState = {}

    for (const [device, isIdle] of deviceIdleMap.entries()) {
      const volumes = deviceVolumeMap[device] || []
      for (const volume of volumes) {
        // Volume is idle if ALL its devices are idle
        if (newVolumeIdleState[volume] === undefined) {
          newVolumeIdleState[volume] = isIdle
        } else {
          newVolumeIdleState[volume] = newVolumeIdleState[volume] && isIdle
        }
      }
    }

    volumeIdleState = newVolumeIdleState

    // Notify listeners
    for (const listener of listeners) {
      listener(volumeIdleState)
    }
  }

  function start(): void {
    if (process) {
      return
    }

    logger.debug('[device-monitor] Starting deviceIdle binary')
    process = spawn(deviceIdlePath, [], {
      stdio: ['ignore', 'pipe', 'pipe']
    })

    if (!process.stdout || !process.stderr) {
      logger.error('[device-monitor] Failed to spawn process with piped stdio')
      process = null
      return
    }

    let buffer = ''

    process.stdout.setEncoding('utf8')
    process.stdout.on('data', (chunk: string) => {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const data: DeviceIdleStatus[] = JSON.parse(line.trim())
          updateDeviceStates(data)
        } catch (err) {
          logger.error('[device-monitor] Failed to parse JSON:', err, 'Line:', line)
        }
      }
    })

    process.stderr.on('data', (data: Buffer) => {
      logger.warn('[device-monitor] stderr:', data.toString())
    })

    process.on('error', (err) => {
      logger.error('[device-monitor] Process error:', err)
      process = null
    })

    process.on('exit', () => {
      process = null
      deviceIdleMap.clear()
      volumeIdleState = {}
    })
  }

  function stop(): void {
    if (process) {
      logger.debug('[device-monitor] Stopping device binary')
      process.kill()
      process = null
      deviceIdleMap.clear()
      volumeIdleState = {}
    }
  }

  function isVolumeIdle(volumeName: string): boolean {
    return volumeIdleState[volumeName] === true
  }

  function areVolumesIdle(volumeNames: string[]): boolean {
    if (volumeNames.length === 0) {
      return true
    }
    return volumeNames.every((vol) => isVolumeIdle(vol))
  }

  function getVolumeIdleState(): VolumeIdleState {
    return { ...volumeIdleState }
  }

  function onUpdate(callback: (volumeIdleState: VolumeIdleState) => void): () => void {
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  }

  function isRunning(): boolean {
    return process !== null
  }

  return {
    start,
    stop,
    isVolumeIdle,
    areVolumesIdle,
    getVolumeIdleState,
    onUpdate,
    isRunning
  }
}

// Singleton instance
let monitorInstance: DeviceMonitor | null = null

export function getDeviceMonitor(): DeviceMonitor {
  if (!monitorInstance) {
    monitorInstance = createDeviceMonitor()
  }
  return monitorInstance
}

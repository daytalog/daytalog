import type { PathType } from '@shared/core/shared-types'
import addDefaults from '../daytalog/builder/add-defaults'
import logger from '@core-logger'
import { appState, daytalogs } from '../app-state/state'
import { Response } from '@shared/core/shared-types'
import updateDaytalog from '../daytalog/updater'

export const handleUpdate = async (dirtyPaths: PathType): Promise<Response> => {
  const projectPath = appState.config.activeProject
  if (!projectPath) {
    logger.error('[autoupdate] No project path')
    return { success: false, error: 'No project path' }
  }
  const activeLogId = appState.project?.activeLog?.id
  const paths = appState.project?.activeLog?.paths
  if (!activeLogId || !paths) {
    logger.error('[autoupdate] No active log id or paths')
    return { success: false, error: 'No active log id or paths' }
  }
  const activeLog = daytalogs().get(`${projectPath}/logs/${activeLogId}.dayta`)
  if (!activeLog) {
    logger.error('[autoupdate] No active log')
    return { success: false, error: 'No active log' }
  }
  const ocf = activeLog.ocf?.clips ?? null
  const sound = activeLog.sound?.clips ?? null
  const res = await addDefaults(dirtyPaths, { ocf, sound })
  if (res.success) {
    const updates: Partial<typeof activeLog> = {}

    if (Array.isArray(res.clips.ocf) && res.clips.ocf.length > 0) {
      updates.ocf = {
        ...(activeLog.ocf ?? {}),
        clips: res.clips.ocf
      }
    }

    if (Array.isArray(res.clips.sound) && res.clips.sound.length > 0) {
      updates.sound = {
        ...(activeLog.sound ?? {}),
        clips: res.clips.sound
      }
    }

    if (Array.isArray(res.clips.proxy) && res.clips.proxy.length > 0) {
      updates.proxy = {
        ...(activeLog.proxy ?? {}),
        clips: res.clips.proxy
      }
    }

    // Only write if there is something to update
    if (Object.keys(updates).length === 0) {
      return { success: true }
    }

    const newLog = { ...activeLog, ...updates }
    const saveRes = await updateDaytalog(newLog, paths, activeLog)
    if (!saveRes.success) {
      if (saveRes.cancelled) {
        logger.warn('[autoupdate] Update cancelled by user.')
      } else {
        logger.error('[autoupdate] Failed to update log:', saveRes.error)
      }
      return {
        success: false,
        error: saveRes.error ?? 'Failed to update log'
      }
    }
    return { success: true }
  } else {
    logger.error('[autoupdate] Error adding defaults:', res.error)
    return { success: false, error: res.error }
  }
}

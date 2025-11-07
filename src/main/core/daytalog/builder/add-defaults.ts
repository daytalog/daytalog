import { spawnWorker } from './workers/workerManager'
import { ResponseWithClips, PathType } from '@shared/core/shared-types'
import logger from '../../utils/logger'
import type { OcfClipType, SoundClipType } from 'daytalog'

const addDefaults = async (
  paths: PathType,
  storedClips?: { ocf: OcfClipType[] | null; sound: SoundClipType[] | null }
): Promise<ResponseWithClips> => {
  let ocfResult: ResponseWithClips | undefined
  let soundResult: ResponseWithClips | undefined
  let proxyResult: ResponseWithClips | undefined

  try {
    const promises: Promise<void>[] = []
    // OCF worker
    if (paths.ocf?.length) {
      const { promise } = spawnWorker('addOCFWorker', {
        paths: paths.ocf,
        storedClips: storedClips?.ocf ?? [],
        customSchema: null
      })
      promises.push(
        promise.then((res: ResponseWithClips) => {
          ocfResult = res
        })
      )
    }

    // Sound worker
    if (paths.sound?.length) {
      const { promise } = spawnWorker('addSoundWorker', {
        paths: paths.sound,
        storedClips: storedClips?.sound ?? [],
        customSchema: null
      })
      promises.push(
        promise.then((res: ResponseWithClips) => {
          soundResult = res
        })
      )
    }

    if (promises.length > 0) await Promise.all(promises)

    if (paths.ocf?.length && ocfResult && !ocfResult.success) {
      throw new Error(ocfResult.error ?? 'OCF error')
    }
    // Safely check Sound (if used)

    if (paths.sound?.length && soundResult && !soundResult.success) {
      throw new Error(soundResult.error ?? 'Sound error')
    }
    if (paths.proxy?.length) {
      // Use fresh OCF clips if available, otherwise use stored clips from active log
      const ocfClipsForProxy =
        ocfResult?.success && ocfResult.clips?.ocf ? ocfResult.clips.ocf : (storedClips?.ocf ?? [])

      const { promise } = spawnWorker('addProxyWorker', {
        paths: paths.proxy,
        storedClips: ocfClipsForProxy,
        customSchema: null
      })
      proxyResult = await promise
      if (!proxyResult.success) throw new Error(proxyResult.error)
    }

    const clips: Record<string, any> = {}

    if (ocfResult && ocfResult.success && ocfResult.clips.ocf) {
      clips.ocf = ocfResult.clips.ocf
    }
    if (soundResult && soundResult.success && soundResult.clips.sound) {
      clips.sound = soundResult.clips.sound
    }
    if (proxyResult && proxyResult.success && proxyResult.clips.proxy) {
      clips.proxy = proxyResult.clips.proxy
    }

    return {
      success: true,
      clips
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown'
    logger.error(error)
    return { success: false, error: message }
  }
}

export default addDefaults

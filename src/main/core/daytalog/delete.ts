import path from 'path'
import { appState } from '../app-state/state'
import type { LogType } from 'daytalog'
import { Response } from '@shared/core/shared-types'
import { moveFileToTrash } from '../utils/crud'
import Errorhandler from '../utils/errorhandler'
import { updateActiveLog } from './updater'

const deleteDaytalog = async (log: LogType): Promise<Response> => {
  try {
    const projectpath = appState.config.activeProject
    if (!projectpath) throw new Error('No project')
    const filepath = path.join(projectpath, 'logs', `${log.id}.dayta`)
    if (log.id === appState.config.activeLog?.id) {
      await updateActiveLog(null)
    }
    return moveFileToTrash(filepath)
  } catch (error) {
    return Errorhandler(error)
  }
}

export default deleteDaytalog

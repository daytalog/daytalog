import { loadProject } from './loader'
import { updateState } from '../app-state/updater'
import { appState } from '../app-state/state'
import { getDaytalogWindow } from '@core-windows/dashboard/dashboardWindow'
import trayManager from '../menu'
import logger from '@core-logger'
import { unloadProject } from './unload'

export const handleChangeProject = async (selectedProjectPath: string): Promise<void> => {
  logger.debug('handleChangeProject, selected project: ', selectedProjectPath)
  try {
    await unloadProject()
    await updateState({ activeProject: selectedProjectPath, activeLog: null })
    await loadProject()
    const projectsInRootPath = appState.projectsInRootPath || []
    const updatedProjects = projectsInRootPath?.map((project) => ({
      ...project,
      active: project.path === selectedProjectPath
    }))
    appState.projectsInRootPath = updatedProjects
    // Watchers are already initialized inside loadProject
    trayManager.createOrUpdateTray()
    getDaytalogWindow({ update: true })
    logger.debug('handleChangeProject completed successfully')
  } catch (error) {
    logger.error('handleChangeProject error:', error)
  }
}

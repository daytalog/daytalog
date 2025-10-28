import { ProjectToUpdate, UpdateProjectResult } from '@shared/core/project-types'
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import { appState } from '../app-state/state'
import { loadProject } from './loader'
import { updateState } from '../app-state/updater'
import { closeProjectWatchers } from '../app-state/watchers/projectWatchers/manager'
import logger from '@core-logger'
import { getDaytalogWindow } from '@core-windows/dashboard/dashboardWindow'
import { writeObjectToKeychain } from '@adapter'

const getFileName = (filePath: string): string => {
  return filePath.split('/').pop() || filePath
}

let renamingInProgress = false
let savingInProgress = false

export const updateProjectNameFromFolderRename = async (projectPath: string) => {
  logger.debug('updateProjectNameFromFolderRename started')
  if (renamingInProgress) {
    logger.debug('renamingInProgress is true')
    return
  }
  let project = appState.project
  logger.debug(project ? project.toString() : 'no project!')
  if (!project) return
  const newprojectname = path.basename(projectPath)
  project.settings.project.project_name = newprojectname
  const projectYaml = YAML.stringify({ ...project.settings.project, version: 1 })
  await updateState({ activeProject: projectPath, activeLog: null })
  try {
    const projectSettingsPath = path.join(projectPath, 'config.yaml')
    fs.writeFileSync(projectSettingsPath, projectYaml, 'utf-8')
    const result = await loadProject()
    if (result.success) {
      return
    }
    logger.error('updateProjectNameFromFolderRename error')
    return
  } catch (error) {
    logger.error('updateProjectNameFromFolderRename catched error')
    return
  }
}

export const updateProjectFromFile = async () => {
  if (savingInProgress || renamingInProgress) return
  await loadProject()
  const loadedProject = appState.project

  const mainWindow = await getDaytalogWindow()
  if (mainWindow?.webContents.isLoading()) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow?.webContents.send('project-loaded', loadedProject)
    })
  } else {
    mainWindow?.webContents.send('project-loaded', loadedProject)
  }
}

export const updateProjectFolder = async (newprojectname: string) => {
  const newpath = path.join(appState.projectsPath, newprojectname)
  renamingInProgress = true
  if (!appState.config.activeProject) throw new Error('No active project')
  try {
    // stop project watchers
    await closeProjectWatchers()
    fs.renameSync(appState.config.activeProject, newpath)
    await updateState({ activeProject: newpath, activeLog: null })
    //reinitialize project watchers
  } finally {
    renamingInProgress = false
  }
}

export const updateProject = async ({
  update_settings,
  update_email_api
}: ProjectToUpdate): Promise<UpdateProjectResult> => {
  if (!appState.config.activeProject) throw new Error('No active project')
  try {
    if (update_email_api) {
      const jsonData = JSON.stringify(update_email_api)
      try {
        await writeObjectToKeychain('email_api', jsonData)
        logger.debug('email api config updated')
      } catch (error) {
        logger.error('email api config update failed')
      }
    }
    const projectYaml = YAML.stringify({ ...update_settings.project, version: 1 })
    const globalYaml = update_settings.global
      ? YAML.stringify({ ...update_settings.global, version: 1 })
      : null

    const newprojectname = update_settings.project.project_name
    const oldprojectname = getFileName(appState.config.activeProject)

    if (newprojectname !== oldprojectname && !renamingInProgress) {
      logger.debug('new project name, will update...')
      await updateProjectFolder(newprojectname)
    }
    const projectSettingsPath = path.join(appState.config.activeProject, 'config.yaml')
    const globalSettingsPath = path.join(appState.localSharedPath, 'config.yaml')
    savingInProgress = true
    try {
      fs.writeFileSync(projectSettingsPath, projectYaml, 'utf8')
      if (globalYaml) {
        fs.writeFileSync(globalSettingsPath, globalYaml, 'utf8')
      }
      const result = await loadProject()
      savingInProgress = false
      if (result.success) {
        return {
          success: true,
          project: result.data
        }
      } else {
        return { success: false, error: 'something went wrong' }
      }
    } finally {
      savingInProgress = false
    }
  } catch (error) {
    return { success: false, error: 'something went wrong' }
  }
}

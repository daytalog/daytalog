import { ipcMain } from 'electron'
import { closeOnboardWindow } from './onboardWindow'
import { getDaytalogWindow } from '../dashboard/dashboardWindow'
import logger from '@core-logger'

export function setupOnboardingIpcHandlers(): void {
  ipcMain.on('OnboardClose_NewProj', (_event) => {
    logger.debug('want to close onboarding and open new project')
    closeOnboardWindow()
    getDaytalogWindow({ navigate: 'new-project' })
  })
}

import { setuProjectIpcHandlers } from './core/project/ipcHandlers'
import { setupDaytalogIpcHandlers } from './core/daytalog/ipcHandlers'
import { setupExportIpcHandlers } from './core/export/ipcHandlers'
import { setupEditorIpcHandlers } from './core/windows/editor/ipcHandlers'
import { setupSendIpcHandlers } from './core/windows/send/ipcHandlers'
import { setupOnboardingIpcHandlers } from './core/windows/onboarding/ipcHandlers'
import { setupElectronIpcHandlers } from './core/electron/ipcHandler'
import { setupErrorIpcHandlers } from './core/windows/error/ipcHandlers'
import { setupIntIpcHandlers } from '@adapter'

export function setupIpcHandlers(): void {
  // Core handlers (always available)
  setuProjectIpcHandlers()
  setupDaytalogIpcHandlers()
  setupExportIpcHandlers()
  setupEditorIpcHandlers()
  setupSendIpcHandlers()
  setupOnboardingIpcHandlers()
  setupElectronIpcHandlers()
  setupErrorIpcHandlers()

  // Int handlers (conditional at build time via @int alias)
  setupIntIpcHandlers()
}

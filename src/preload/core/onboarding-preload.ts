import { contextBridge, ipcRenderer } from 'electron'
import { exposeExternal } from './apis/shared'

console.log('onboardingPreload loaded')
const onboardingApi = {
  finishOnboarding: (): void => ipcRenderer.send('OnboardClose_NewProj')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('onboardingApi', onboardingApi)
    exposeExternal()
  } catch (error) {
    console.error(error)
  }
}

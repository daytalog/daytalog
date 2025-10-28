import logger from '@core-logger'

const warn = () => logger.warn("Function isn't available in this build")

export const sendEmail = async (_email: any): Promise<void> => {
  warn()
}

export const deleteObjectInKeychain = async (_id: string): Promise<void> => {
  warn()
}

export const writeObjectToKeychain = async (_id: string, _obj: string): Promise<void> => {
  warn()
}

export const retrieveObjectFromKeychain = async (_id: string): Promise<string | null> => {
  warn()
  return null
}

export const checkObjectInKeychainExists = async (_id: string): Promise<boolean> => {
  warn()
  return false
}

export function createAboutWindow(): void {
  warn()
}

export function createReportWindow(): void {
  warn()
}

export function getUpdateWindow(): any {
  warn()
  return null
}

export function checkForUpdates(): void {
  warn()
}

export function setupIntIpcHandlers(): void {
  // No-op stub for builds without int features
}

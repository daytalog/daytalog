import { initSettingsWatcher, closeSettingsWatcher } from './settingsWatcher'
import { initDaytalogWatcher, closeDaytalogsWatcher } from './daytalogWatcher'
import { initTemplateWatcher, closeTemplatesWatcher } from './templatesWatcher'
import logger from '@core-logger'

export const initProjectWatchers = async () => {
  logger.debug('initProjectWatchers started')
  await Promise.all([initSettingsWatcher(), initTemplateWatcher(), initDaytalogWatcher()])
  logger.debug('ProjectWatchers initialized')
}

export const closeProjectWatchers = async () => {
  await Promise.allSettled([
    closeSettingsWatcher(),
    closeTemplatesWatcher(),
    closeDaytalogsWatcher()
  ])
}

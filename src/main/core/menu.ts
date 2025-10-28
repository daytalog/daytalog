import { Menu, Tray, nativeImage, shell, MenuItemConstructorOptions } from 'electron'
import { getDaytalogWindow } from '@core-windows/dashboard/dashboardWindow'
import { format, getDuration, getReels, getSize, getFiles } from 'daytalog'
import type { LogType, OcfClipType, SoundClipType } from 'daytalog'
import { appState, daytalogs } from './app-state/state'
import { handleChangeProject } from './project/manager'
import { createEditorWindow } from '@core-windows/editor/editorWindow'
import { createSendWindow } from '@core-windows/send/sendWindow'
import { exportPdf } from './export/exportPdf'
import trayIcon from '@resources/tray.png?asset'
import logger from '@core-logger'
import { supportsSubLabel } from './utils/supports'
import { createAboutWindow, createReportWindow } from '@adapter'
import { openOnboardWindow } from '@core-windows/onboarding/onboardWindow'

interface buildContextMenuProps {
  progress?: string
}

const baseMenu = (): Menu => {
  return Menu.buildFromTemplate([
    {
      label: 'Daytalog',
      role: 'appMenu',
      submenu: [
        { label: 'About', click: () => createAboutWindow() },
        { type: 'separator' },
        { label: 'Hide', role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
      ]
    }
  ])
}

const formatCopies = (clips?: OcfClipType[] | SoundClipType[]): string[] => {
  if (!clips) return []
  return format.formatCopiesFromClips(clips).map((c, i) => {
    const status = c.count[0] === c.count[1]
    const icon = status ? '✅' : '❌'
    return `${i === 0 ? '\n' : ''}${icon} Copy ${i + 1}: ${c.volumes.join(', ')} ${status ? '' : `- ${c.count[0]} of ${c.count[1]}`}`
  })
}

const StatsMenu = (activeLog: LogType | null): MenuItemConstructorOptions => {
  const isOverride = (value: any) => (value !== undefined ? '(override value)' : '')
  const ocf = () => {
    if (!activeLog?.ocf) return 'none'
    const { clips, duration, reels, size } = activeLog.ocf
    const hasClips = !!(clips && clips.length)
    const hasAny = hasClips || !!duration || !!reels || !!size
    if (!hasAny) return 'none'

    const durationLine =
      (hasClips || duration) &&
      `Duration: ${getDuration(activeLog.ocf, 'hms-string')} ${isOverride(duration)}`

    const reelsLine =
      (hasClips || reels) &&
      `Reels: ${getReels(activeLog.ocf, { mergeRanges: true }).join(', ')} ${isOverride(reels)}`

    const sizeLine =
      (hasClips || size) &&
      `Size: ${getSize(activeLog.ocf, { output: 'string' })} ${isOverride(size)}`

    const lines = [durationLine, reelsLine, sizeLine, ...formatCopies(clips)].filter(Boolean)

    return lines.join('\n')
  }

  const sound = () => {
    if (!activeLog?.sound) return 'none'
    const { files, size, clips } = activeLog.sound
    const hasClips = !!(clips && clips.length)
    const hasAny = hasClips || !!files || !!size
    if (!hasAny) return 'none'

    const filesLine =
      (hasClips || files) && `Files: ${getFiles(activeLog.sound)} ${isOverride(files)}`
    const sizeLine =
      (hasClips || size) &&
      `Size: ${getSize(activeLog.sound, { output: 'string' })} ${isOverride(size)}`
    const lines = [filesLine, sizeLine, ...formatCopies(clips)].filter(Boolean)

    return lines.join('\n')
  }

  const proxy = () => {
    if (!activeLog?.proxy) return 'none'
    const { clips: proxyClips, size, files } = activeLog.proxy

    const InfoLine = () => {
      const ocfClips = activeLog.ocf?.clips
      if (!ocfClips?.length || !proxyClips?.length) return ''
      const proxyNames = new Set(proxyClips?.map((c) => c.clip))
      const missingClips = ocfClips.filter((c) => !proxyNames.has(c.clip)).map((c) => c.clip)
      const missingClipsString =
        missingClips.length > 10
          ? `${missingClips[0]} \n→ ${missingClips[missingClips.length - 1]}`
          : missingClips.join('\n')

      const allGood = !missingClips.length
      return allGood
        ? `\n✅ All camera files have matching proxies`
        : `\n❌ Missing proxies: \n ${missingClipsString}`
    }

    const hasClips = !!(proxyClips && proxyClips.length)
    const hasAny = hasClips || !!size || !!files
    if (!hasAny) return 'none'

    const filesLine =
      (hasClips || files) && `Files: ${getFiles(activeLog.proxy)} ${isOverride(files)}`
    const sizeLine =
      (hasClips || size) &&
      `Size: ${getSize(activeLog.proxy, { output: 'string' })} ${isOverride(size)}`

    const lines = [filesLine, sizeLine, InfoLine()].filter(Boolean)
    return lines.join('\n')
  }

  return {
    label: 'Stats',
    enabled: !!activeLog,
    submenu: supportsSubLabel()
      ? [
          {
            label: 'Original Camera FIles',
            sublabel: ocf(),
            click: () => {
              getDaytalogWindow({ navigate: 'builder', builderId: activeLog?.id })
            }
          },
          { type: 'separator' },
          {
            label: 'Sound',
            sublabel: sound(),
            click: () => {
              getDaytalogWindow({ navigate: 'builder', builderId: activeLog?.id })
            }
          },
          { type: 'separator' },
          {
            label: 'Proxies',
            sublabel: proxy(),
            click: () => {
              getDaytalogWindow({ navigate: 'builder', builderId: activeLog?.id })
            }
          }
        ]
      : [
          {
            label: 'Upgrade to macOS 14.4 or later to see stats',
            enabled: false
          }
        ]
  }
}

const buildContextMenu = ({ progress }: buildContextMenuProps): Menu => {
  logger.debug('creating menu...')

  const projects = appState.projectsInRootPath
  const activeProject = appState.project

  const logs = daytalogs()
  const hasLogs = !!logs?.size
  const activeLogId = appState.project?.activeLog?.id
  // Add again later when implementing Autoupdate
  //const activeLogPaths = appState.project?.activeLog?.paths

  const selection: string[] | undefined = activeLogId ? [activeLogId] : undefined

  const activeLog =
    activeLogId && logs
      ? [...logs.entries()].find(([key]) => key.endsWith(`${activeLogId}.dayta`))?.[1] || null
      : null

  return Menu.buildFromTemplate([
    {
      id: 'active',
      label: `Project: ${activeProject ? activeProject.project_name : 'None'}`,
      sublabel: activeLogId ? `Log: ${activeLogId}` : '',
      enabled: false
    },
    ...(progress
      ? [
          {
            label: progress,
            enabled: false
          }
        ]
      : []),

    {
      label: 'Open Dashboard',
      click: () => getDaytalogWindow({ ensureOpen: true }),
      enabled: !!activeProject
    },
    StatsMenu(activeLog),
    { type: 'separator' },
    {
      label: 'Send',
      submenu: [
        ...(activeProject?.emails
          ?.filter((email) => email.enabled)
          .map((email, index) => ({
            id: index.toString(),
            label: email.label,
            enabled: hasLogs,
            click: (): void => createSendWindow(email, selection)
          })) || [{ label: 'No Presets Available', enabled: false }]),
        { type: 'separator' },
        {
          id: 'sendWindow',
          label: 'Open Send Window',
          click: (): void => createSendWindow(null, selection),
          enabled: hasLogs
        }
      ],
      enabled: !!activeProject
    },
    {
      label: 'Export',
      submenu: activeProject?.pdfs
        ?.filter((pdf) => pdf.enabled)
        .map((pdf) => ({
          id: pdf.id,
          label: pdf.label,
          enabled: hasLogs,
          click: () => exportPdf({ pdf, selection, hasDialog: true })
        })) || [{ label: 'No Presets Available', enabled: false }],
      enabled: !!activeProject
    },
    { type: 'separator' },
    {
      label: 'New Shooting Day',
      click: () => getDaytalogWindow({ navigate: 'builder' }),
      enabled: !!activeProject
    },
    {
      label: `Update ${activeLog?.id ?? ''}`,
      click: () => {
        getDaytalogWindow({ navigate: 'builder', builderId: activeLog?.id })
      },
      enabled: !!activeLog
    },
    { type: 'separator' },
    {
      label: 'Project',
      submenu: [
        {
          id: 'openProject',
          label: 'Switch Project',
          enabled: !!projects && projects.length > 0,
          submenu: projects
            ? projects.map((project) => ({
                id: project.path,
                label: project.label,
                enabled: !project.active,
                click: (): Promise<void> => handleChangeProject(project.path)
              }))
            : [{ label: 'No Projects in folder', enabled: false }]
        },
        { label: 'New Project', click: () => getDaytalogWindow({ navigate: 'new-project' }) },
        { type: 'separator' },
        { label: 'Open Folder', click: async () => await shell.openPath(appState.folderPath) }
      ]
    },

    {
      label: 'Code Editor',
      click: (): void => createEditorWindow(),
      enabled: !!activeProject
    }, // Opens code editor window.
    {
      label: 'Project Settings',
      click: () => getDaytalogWindow({ navigate: 'settings' }),
      enabled: !!activeProject
    }, // Opens main window and open settings modal.
    { type: 'separator' },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => shell.openExternal('https://docs.daytalog.com') },
        { label: 'Onboarding', click: () => openOnboardWindow() },
        { label: 'Bug Report', click: () => createReportWindow() }
      ]
    },
    { label: 'About', click: () => createAboutWindow() },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' }
  ])
}

class TrayManager {
  private tray: Electron.Tray | null = null

  createOrUpdateTray(progress?: string): void {
    const contextMenu = buildContextMenu({
      progress
    })
    if (!this.tray) {
      Menu.setApplicationMenu(baseMenu())
      const image = nativeImage.createFromPath(trayIcon)
      image.setTemplateImage(true)
      this.tray = new Tray(image) // Create the tray if it doesn't exist
      console.log('created new menu')
    }
    this.tray.setContextMenu(contextMenu) // Update the context menu
    console.log('updated menu')
  }

  updateTooltip(tooltip: string) {
    if (this.tray) {
      this.tray.setToolTip(tooltip)
    }
  }

  destroyTray() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}

const trayManager = new TrayManager()
export default trayManager

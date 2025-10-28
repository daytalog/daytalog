import { dialog, Notification, app, nativeImage, BrowserWindow, screen } from 'electron'
import fs from 'fs/promises'
import { renderPdf } from '../render/renderPdf'
import { PdfType } from 'daytalog'
import logger from '@core-logger'
import successicon from '@resources/success_icon.png?asset'
import erroricon from '@resources/error_icon.png?asset'
import { getPdfOutputName } from '../render/utils/getOutputName'

interface exportPdfProps {
  pdf: PdfType
  selection?: string[]
  hasDialog?: boolean
}

export const exportPdf = async ({ pdf, selection, hasDialog = false }: exportPdfProps) => {
  if (process.platform === 'darwin') {
    app.focus({ steal: true })
  } else {
    app.focus()
  }
  const outputName = getPdfOutputName(pdf, selection)

  try {
    if (hasDialog) {
      let filePath: string | undefined

      if (process.platform === 'darwin') {
        // macOS: no parent window; let the system center the dialog. Ensure app is frontmost.
        const result = await dialog.showSaveDialog({
          title: `Save ${pdf.label}`,
          defaultPath: outputName,
          filters: [
            { name: 'PDF Files', extensions: ['pdf'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        })
        filePath = result.filePath
      } else {
        // Create a tiny, hidden utility window to parent the native dialog so it stays on top
        const parent = new BrowserWindow({
          show: false,
          frame: false,
          transparent: true,
          width: 1,
          height: 1,
          skipTaskbar: true,
          alwaysOnTop: true
        })

        // Center the hidden parent on the display nearest the cursor so the OS dialog appears centered
        try {
          const point = screen.getCursorScreenPoint()
          const display = screen.getDisplayNearestPoint(point)
          const { x, y, width, height } = display.workArea
          const approxHalfW = 400
          const approxHalfH = 300
          const px = Math.floor(x + width / 2 - approxHalfW)
          const py = Math.floor(y + height / 2 - approxHalfH)
          parent.setBounds({ x: px, y: py, width: 1, height: 1 })
        } catch {}

        try {
          const result = await dialog.showSaveDialog(parent, {
            title: `Save ${pdf.label}`,
            defaultPath: outputName,
            filters: [
              { name: 'PDF Files', extensions: ['pdf'] },
              { name: 'All Files', extensions: ['*'] }
            ]
          })
          filePath = result.filePath
        } finally {
          // Ensure the temporary window is always destroyed
          if (!parent.isDestroyed()) parent.destroy()
        }
      }

      // If user cancels the save dialog, exit the function
      if (!filePath) {
        console.log('File save was canceled by the user.')
        return
      }
      const res = await renderPdf({ pdf, selection })
      if (!res) {
        throw new Error('Failed to render PDF')
      }

      await fs.writeFile(filePath, Buffer.from(res))

      const successotification = new Notification({
        title: 'Export Complete',
        body: 'Your PDF export was successful!',
        icon: nativeImage.createFromPath(successicon)
      })
      successotification.show()
      return { success: true }
    } else {
      const res = await renderPdf({ pdf, selection })
      if (!res) {
        throw new Error('Failed to render PDF')
      }

      const pdfBuffer = Buffer.from(res)
      const data = {
        filename: outputName,
        mimeType: 'application/pdf',
        base64: pdfBuffer.toString('base64')
      }
      return { success: true, data }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unexpected error while exporting PDF'
    logger.error(errorMessage)
    if (hasDialog) {
      const errornotification = new Notification({
        title: 'Export Failed',
        body: errorMessage,
        icon: nativeImage.createFromPath(erroricon)
      })
      errornotification.show()
    }
    return { success: false, error: 'Export Failed' }
  }
}

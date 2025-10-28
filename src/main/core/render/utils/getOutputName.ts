import { appState, daytalogs } from '../../app-state/state'
import { replaceTagsMultiple } from '@shared/core/utils/formatDynamicString'
import { PdfType } from 'daytalog'

export const getPdfOutputName = (pdf: PdfType, selection?: string[]) => {
  const project = appState.project
  if (!project) throw new Error('No project')
  const logs = Array.from(daytalogs().values())
  if (!logs) throw new Error('No logs')

  return replaceTagsMultiple({
    selection,
    logs,
    template: pdf.output_name,
    fallbackName: pdf.label,
    project
  })
}

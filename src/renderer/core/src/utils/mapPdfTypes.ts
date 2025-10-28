import type { PdfType } from 'daytalog'

interface Option {
  label: string
  value: string
}

export function mapPdfTypesToOptions(pdfs: PdfType[]): Option[] {
  return pdfs.map((pdf) => {
    return {
      label: pdf.label,
      value: pdf.id
    }
  })
}

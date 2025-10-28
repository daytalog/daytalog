import React, { useState } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { formSchemaType } from '../../types'
import { pdfEditType } from '../types'
import { TemplateDirectoryFile } from '@shared/core/project-types'
import { DropdownMenuItem, DropdownMenuSeparator } from '@components/ui/dropdown-menu'
import PdfTemplate from './PdfTemplate'
import FormRow from '@components/FormRow'
import WarningTooltip from '@components/WarningTooltip'
import { ToggleLeft, ToggleRight, Trash2, Pencil } from 'lucide-react'
import {
  SettingsAccordion,
  SettingsAccordionItem,
  SettingsAccordionTrigger,
  SettingsAccordionContent
} from '@components/SettingsAccordion'

interface PdfProps {
  scope: 'project' | 'global'
  templates: TemplateDirectoryFile[]
}

const Pdfs: React.FC<PdfProps> = ({ scope, templates }) => {
  const { control } = useFormContext<formSchemaType>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `${scope}_pdfs`,
    keyName: 'fieldId'
  })

  const [pdfEdit, setPdfEdit] = useState<pdfEditType | null>(null)

  return (
    <div key={`Pdf_${scope}`}>
      <FormRow label="PDF Presets">
        <SettingsAccordion collapse={!fields.length}>
          {fields.map((pdf, index) => (
            <SettingsAccordionItem key={index} value={`pdf-${index}`}>
              <SettingsAccordionTrigger
                label={pdf.label}
                active={pdf.enabled}
                warning={
                  templates.find((t) => t.name === pdf.react && t.type === 'pdf')
                    ? undefined
                    : 'Template file no longer exists'
                }
              >
                <>
                  <DropdownMenuItem
                    onClick={() => update(index, { ...pdf, enabled: !pdf.enabled })}
                  >
                    {pdf.enabled ? (
                      <>
                        <ToggleLeft />
                        Disable
                      </>
                    ) : (
                      <>
                        <ToggleRight />
                        Enable
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPdfEdit({ index, pdf })}>
                    <Pencil />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => remove(index)} variant="destructive">
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </>
              </SettingsAccordionTrigger>
              <SettingsAccordionContent>
                <>
                  <p>Output Name:</p>
                  <p>{pdf.output_name}</p>
                  <p>React template:</p>
                  <span className="flex items-center gap-1">
                    {templates.find((t) => t.name === pdf.react && t.type === 'pdf') ? (
                      pdf.react
                    ) : (
                      <>
                        <p className="text-red-800">{pdf.react}</p>{' '}
                        <WarningTooltip text="Template file no longer exists." />
                      </>
                    )}
                  </span>
                </>
              </SettingsAccordionContent>
            </SettingsAccordionItem>
          ))}
        </SettingsAccordion>
        <PdfTemplate
          append={append}
          update={update}
          emailEdit={pdfEdit}
          setEmailEdit={setPdfEdit}
          templates={templates}
          hasItems={!!fields.length}
        />
      </FormRow>
    </div>
  )
}

export default Pdfs

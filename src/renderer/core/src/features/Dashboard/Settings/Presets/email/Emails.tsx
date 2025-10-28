import React, { useEffect, useState } from 'react'
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form'
import { formSchemaType } from '../../types'
import { emailEditType } from '../types'
import { TemplateDirectoryFile } from '@shared/core/project-types'
import type { PdfType } from 'daytalog'
import {
  SettingsAccordion,
  SettingsAccordionItem,
  SettingsAccordionTrigger,
  SettingsAccordionContent
} from '@components/SettingsAccordion'
import { DropdownMenuItem, DropdownMenuSeparator } from '@components/ui/dropdown-menu'
import EmailTemplate from './EmailTemplate'
import { getPdfAttachments } from '@shared/core/utils/getAttachments'
import { mapPdfTypesToOptions } from '@renderer/utils/mapPdfTypes'
import FormRow from '@components/FormRow'
import WarningTooltip from '@components/WarningTooltip'
import { ToggleLeft, ToggleRight, Trash2, Pencil } from 'lucide-react'

interface EmailProps {
  scope: 'project' | 'global'
  templates: TemplateDirectoryFile[]
}

const Emails: React.FC<EmailProps> = ({ scope, templates }) => {
  const [pdfs, setPdfs] = useState<PdfType[]>([])
  const project_pdfs = useWatch({ name: 'project_pdfs' })
  const global_pdfs = useWatch({ name: 'global_pdfs' })

  useEffect(() => {
    setPdfs([...global_pdfs, ...project_pdfs])
  }, [project_pdfs, global_pdfs])

  const { control } = useFormContext<formSchemaType>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `${scope}_emails`,
    keyName: 'fieldId'
  })

  const [emailEdit, setEmailEdit] = useState<emailEditType | null>(null)

  return (
    <div key={`Email?_${scope}`}>
      <FormRow label="Email Presets">
        <SettingsAccordion collapse={!fields.length}>
          {fields.map((email, index) => (
            <SettingsAccordionItem key={index} value={`email-${index}`}>
              <SettingsAccordionTrigger
                label={email.label}
                active={email.enabled}
                warning={
                  templates.find((t) => t.name === email.react && t.type === 'email')
                    ? undefined
                    : 'Template file no longer exists'
                }
              >
                <>
                  <DropdownMenuItem
                    onClick={() => update(index, { ...email, enabled: !email.enabled })}
                  >
                    {email.enabled ? (
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
                  <DropdownMenuItem onClick={() => setEmailEdit({ index, email })}>
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
                  <p>To:</p>
                  <p>{email.recipients?.join(', ')}</p>
                  <p>Subject:</p>
                  <p>{email.subject}</p>
                  <p>Email Message:</p>
                  <p>{email.message}</p>
                  <p>Attachments:</p>
                  <p>
                    {email.attachments && email.attachments?.length > 0
                      ? (() => {
                          const pdfAttachments = mapPdfTypesToOptions(
                            getPdfAttachments(pdfs, email.attachments)
                          )
                          return pdfAttachments.map((o) => o.label).join(', ')
                        })()
                      : ''}
                  </p>
                  <p>React template:</p>
                  <p className="flex items-center gap-1">
                    {templates.find((t) => t.name === email.react && t.type === 'email') ? (
                      email.react
                    ) : (
                      <>
                        <p className="text-red-800">{email.react}</p>{' '}
                        <WarningTooltip text="Template file no longer exists." />
                      </>
                    )}
                  </p>
                </>
              </SettingsAccordionContent>
            </SettingsAccordionItem>
          ))}
        </SettingsAccordion>
        <EmailTemplate
          append={append}
          update={update}
          emailEdit={emailEdit}
          setEmailEdit={setEmailEdit}
          templates={templates}
          pdfs={pdfs}
          hasItems={!!fields.length}
        />
      </FormRow>
    </div>
  )
}

export default Emails

/*   <dt className="text-sm font-medium leading-6 text-white">Email API</dt>
        <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
          <ApiKeyDialog />
        </dd>
        <dt className="text-sm font-medium leading-6 text-white">FROM Address</dt>
        <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
          <Input />
        </dd>*/

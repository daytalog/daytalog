import React, { useState, useEffect } from 'react'
import { Input } from '@components/ui/input'
import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { TemplateDirectoryFile } from '@shared/core/project-types'
import type { PdfType, EmailType } from 'daytalog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import { Textarea } from '@components/ui/textarea'
import { SubmitHandler, useForm } from 'react-hook-form'
import { emailEditType, emailWithoutIDZod, emailWithoutIDType } from '../types'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@components/ui/sheet'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import MultiSelect from '@components/MultiSelect'
import { Button } from '@components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { getPdfAttachments } from '@shared/core/utils/getAttachments'
import { mapPdfTypesToOptions } from '@renderer/utils/mapPdfTypes'
import { nanoid } from 'nanoid/non-secure'
import { Plus } from 'lucide-react'

interface EmailTemplateProps {
  append: (email: EmailType) => void
  update: (index: number, email: EmailType) => void
  emailEdit: emailEditType | null
  setEmailEdit: (edit: emailEditType | null) => void
  templates: TemplateDirectoryFile[]
  pdfs: PdfType[]
  hasItems: boolean
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({
  append,
  update,
  emailEdit,
  setEmailEdit,
  templates,
  pdfs,
  hasItems
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const defaultValues = {
    label: '',
    recipients: [],
    subject: '',
    message: '',
    react: ''
  }
  const form = useForm<emailWithoutIDType>({
    defaultValues: defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(emailWithoutIDZod)
  })

  const { control, handleSubmit, reset } = form

  const onSubmit: SubmitHandler<emailWithoutIDType> = (data): void => {
    if (emailEdit !== null) {
      update(emailEdit.index, { id: emailEdit.email.id, enabled: emailEdit.email.enabled, ...data })
    } else {
      append({ id: nanoid(5), enabled: true, ...data })
    }
    onOpenChange(false)
  }
  useEffect(() => {
    if (emailEdit) {
      const { id, ...rest } = emailEdit.email
      reset(rest)
      setOpen(true)
    }
  }, [emailEdit])

  const onOpenChange = (open: boolean): void => {
    setOpen(open)
    if (open === false) {
      setEmailEdit(null)
      reset(defaultValues)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <div>
        <SheetTrigger asChild>
          <Button type="button" size="sm" className={`${hasItems && 'absolute right-0 -top-1'}`}>
            <Plus className="size-4" />
            Add Preset
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent side="right" className="p-2 w-full max-w-[800px]">
        <SheetHeader>
          <SheetTitle>
            {emailEdit ? `Edit ${emailEdit.email.label}` : 'New Email Template'}
          </SheetTitle>
          <SheetDescription>
            {`${emailEdit ? 'Edit the' : 'Create a new'} Email template that can be used from the UI`}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <div className="flex flex-col gap-8 px-4 overflox-y-auto">
            <FormField
              control={control}
              name={`label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preset Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-index={0} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`recipients`}
              render={({ field, fieldState }) => {
                console.log(fieldState.error)
                return (
                  <FormItem>
                    <FormLabel>Recipients</FormLabel>
                    <FormControl>
                      <MultiSelectTextInput
                        {...field}
                        dataIndex={1}
                        ariaInvalid={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage>
                      {fieldState.error &&
                        (Array.isArray(fieldState.error)
                          ? fieldState.error.map((e) => e.message)
                          : fieldState.error.message)}
                    </FormMessage>
                  </FormItem>
                )
              }}
            />
            <FormField
              control={control}
              name={`subject`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} data-index={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`attachments`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <MultiSelect
                      {...field}
                      dataIndex={3}
                      value={mapPdfTypesToOptions(getPdfAttachments(pdfs, field.value ?? []))}
                      onChange={(newValues) => {
                        // Map selected Option objects to pdfType objects
                        const updatedAttachments = newValues
                          .map((id) => {
                            const foundPdf = pdfs.find((pdf) => pdf.id === id)
                            console.log('Selected ID -> pdf:', id, foundPdf) // Debug mapping
                            return foundPdf?.id
                          })
                          .filter(Boolean) // Remove any undefined entries

                        field.onChange(updatedAttachments) // Update the form state with pdfType objects
                      }}
                      options={pdfs.map((pdf) => {
                        const option = { label: pdf.label, value: pdf.id }
                        return option
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`message`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-index={4} className="h-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`react`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>React Email Template</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {templates
                            .filter((template) => template.type === 'email')
                            .map((template) => (
                              <SelectItem key={template.path} value={template.name}>
                                {template.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <SheetFooter>
            <Button type="button" onClick={handleSubmit(onSubmit)}>
              Save
            </Button>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default EmailTemplate

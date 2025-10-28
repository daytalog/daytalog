'use client'
import React, { useState, useEffect } from 'react'
import { Input } from '@components/ui/input'
import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { TemplateDirectoryFile } from '@shared/core/project-types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import { SubmitHandler, useForm } from 'react-hook-form'
import { pdfEditType, pdfWithoutIDZod, pdfWitoutIDType } from '../types'
import type { PdfType } from 'daytalog'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@components/ui/sheet'
import { Button } from '@components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { nanoid } from 'nanoid/non-secure'
import { Plus } from 'lucide-react'

interface PdfTemplateProps {
  append: (email: PdfType) => void
  update: (index: number, email: PdfType) => void
  emailEdit: pdfEditType | null
  setEmailEdit: (edit: pdfEditType | null) => void
  templates: TemplateDirectoryFile[]
  hasItems: boolean
}

const PdfTemplate: React.FC<PdfTemplateProps> = ({
  append,
  update,
  emailEdit,
  setEmailEdit,
  templates,
  hasItems
}) => {
  const [open, setOpen] = useState<boolean>(false)

  const defaultValues = {
    label: '',
    output_name: '<log>.pdf',
    react: ''
  }
  const form = useForm<pdfWitoutIDType>({
    defaultValues: defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(pdfWithoutIDZod)
  })

  const { handleSubmit, reset } = form

  let currentIndex = 0 // Initialize the index counter

  const assignIndex = (): number => currentIndex++

  const onSubmit: SubmitHandler<pdfWitoutIDType> = (data): void => {
    if (emailEdit !== null) {
      update(emailEdit.index, { id: emailEdit.pdf.id, enabled: emailEdit.pdf.enabled, ...data })
    } else {
      append({ id: nanoid(5), enabled: true, ...data })
    }
    onOpenChange(false)
  }
  useEffect(() => {
    if (emailEdit) {
      const { id, ...rest } = emailEdit.pdf
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
          <SheetTitle>{emailEdit ? `Edit ${emailEdit.pdf.label}` : 'New PDF'}</SheetTitle>
          <SheetDescription>
            {`${emailEdit ? 'Edit the' : 'Create a new'} Pdf preset that can be used from the UI`}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <div className="flex flex-col gap-8 px-4 overflow-y-auto">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preset Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-index={assignIndex()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="output_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-index={assignIndex()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="react"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>React Pdf Template</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {templates
                            .filter((template) => template.type === 'pdf')
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

export default PdfTemplate

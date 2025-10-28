import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm, SubmitErrorHandler } from 'react-hook-form'
import type { CustomSchemaType } from 'daytalog'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@components/ui/sheet'
import { Input } from '@components/ui/input'
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  Form,
  FormDescription
} from '@components/ui/form'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import ParsingWrapper from './ParsingWrapper'
import { Switch } from '@components/ui/switch'
import type { SchemaEditType, SchemaFormType } from './types'
import { SchemaFormZod } from './types'
import { FieldSelectionProvider } from './FieldSelectionContext'

interface SchemaDialog {
  append: (schema: CustomSchemaType) => void
  update: (index: number, schema: CustomSchemaType) => void
  schemaEdit: SchemaEditType | null
  setSchemaEdit: (edit: SchemaEditType | null) => void
  schemasLength?: number
}

const SchemaDialog = ({
  append,
  update,
  schemaEdit,
  setSchemaEdit,
  schemasLength
}: SchemaDialog) => {
  const [open, setOpen] = useState<boolean>(false)

  const defaultValues = {
    id: '',
    csv_import: false,
    sync: 'clip' as 'clip',
    clip_col: '',
    tc_start_col: '',
    tc_end_col: '',
    log_fields: [],
    clip_fields: []
  }
  const form = useForm<SchemaFormType>({
    defaultValues: defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver: zodResolver(SchemaFormZod)
  })

  const { control, handleSubmit, reset } = form

  let currentIndex = 0 // Initialize the index counter

  const assignIndex = (): number => currentIndex++

  const onSubmit: SubmitHandler<SchemaFormType> = (data): void => {
    console.log(data)
    let clip_fields = [...(data.clip_fields || [])]
    if (clip_fields.length) {
      if (data.sync === 'clip' && data.clip_col) {
        clip_fields.push(
          data.csv_import ? { type: 'clip', column: data.clip_col } : { type: 'clip' }
        )
      }
      if (data.sync === 'tc' && data.tc_start_col) {
        clip_fields.push(
          data.csv_import ? { type: 'tc_start', column: data.tc_start_col } : { type: 'tc_start' }
        )
      }
      if (data.sync === 'tc' && data.tc_end_col) {
        clip_fields.push(
          data.csv_import ? { type: 'tc_end', column: data.tc_end_col } : { type: 'tc_end' }
        )
      }
    }
    if (!data.csv_import) {
      // Remove column properties when csv_import is false
      clip_fields = clip_fields.map(({ column, ...field }) => field)
      data.log_fields = data.log_fields?.map(({ column, ...field }) => field)
    }
    if (schemaEdit !== null) {
      update(schemaEdit.index, {
        ...data,
        active: schemaEdit.schema.active,
        order: schemaEdit.schema.order,
        clip_fields
      } as CustomSchemaType)
    } else {
      const order = schemasLength ? schemasLength + 1 : 1
      append({ ...data, active: true, order, clip_fields } as CustomSchemaType)
    }
    onOpenChange(false)
  }
  const onError: SubmitErrorHandler<SchemaFormType> = (formErrors) => {
    console.log('validation failed', formErrors)
  }

  useEffect(() => {
    if (schemaEdit) {
      const { order, active, clip_fields, ...rest } = schemaEdit.schema
      const val = {
        clip_col: clip_fields?.find((c) => c.type === 'clip')?.column ?? '',
        tc_start_col: clip_fields?.find((c) => c.type === 'tc_start')?.column ?? '',
        tc_end_col: clip_fields?.find((c) => c.type === 'tc_end')?.column ?? '',
        clip_fields: clip_fields?.filter(
          (c) => c.type !== 'clip' && c.type !== 'tc_start' && c.type !== 'tc_end'
        ),
        ...rest
      }
      reset(val)
      setOpen(true)
    }
  }, [schemaEdit])

  const onOpenChange = (open: boolean): void => {
    setOpen(open)
    if (open === false) {
      setSchemaEdit(null)
      reset(defaultValues)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <div>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="sm"
            className={`${schemasLength ? 'absolute right-0 -top-1' : ''}`}
          >
            <Plus className="size-4" />
            Add Schema
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent side="right" className="w-3/4 !min-w-[600px] py-2 ml-1 mr-2">
        <SheetHeader>
          <SheetTitle>
            {schemaEdit ? `Edit ${schemaEdit.schema.id}-schema` : 'New Schema'}
          </SheetTitle>
          <SheetDescription>
            {`${schemaEdit ? 'Edit the' : 'Create a new'} Schema`}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <FieldSelectionProvider>
            <div className="flex flex-col gap-8 h-full px-4 overflow-y-auto">
              <FormField
                control={control}
                name="id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-index={assignIndex()} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="csv_import"
                render={({ field }) => (
                  <FormItem className="flex gap-6 items-center justify-between py-2">
                    <div className="space-y-1">
                      <FormLabel>Import from File</FormLabel>
                      <FormDescription>Parse data from CSV files</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                <ParsingWrapper place="clip" desc="Extend Clips with these fields" />
                <ParsingWrapper place="log" desc="Extend the Log with these fields" />
              </div>
            </div>
            <SheetFooter>
              <Button type="button" onClick={handleSubmit(onSubmit, onError)}>
                Save
              </Button>
            </SheetFooter>
          </FieldSelectionProvider>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default SchemaDialog

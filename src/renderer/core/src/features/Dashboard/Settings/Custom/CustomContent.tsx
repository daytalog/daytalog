import { useState } from 'react'
import type { TabProps, formSchemaType } from '../types'
import type { SchemaEditType } from './types'
import type { CustomSchemaType } from 'daytalog'
import { useFormContext, useFieldArray } from 'react-hook-form'
import {
  SettingsAccordion,
  SettingsAccordionContent,
  SettingsAccordionTrigger,
  SettingsAccordionItem
} from '@components/SettingsAccordion'
import {
  DropdownMenuSub,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@components/ui/dropdown-menu'
import SchemaDialog from './SchemaDialog'
import FormRow from '@components/FormRow'
import { ToggleLeft, ToggleRight, Trash2, Pencil, ListOrdered } from 'lucide-react'

const CustomContent = ({ scope }: TabProps) => {
  const { control } = useFormContext<formSchemaType>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `${scope}_custom_schemas` as const,
    keyName: 'fieldId'
  })

  const [schemaEdit, setSchemaEdit] = useState<SchemaEditType | null>(null)

  return (
    <FormRow label="Schemas">
      <SettingsAccordion collapse={!fields.length}>
        {fields.map((field, index) => {
          const schema = field as unknown as CustomSchemaType
          return (
            <SettingsAccordionItem key={index} value={`schema-${index}`}>
              <SettingsAccordionTrigger
                label={schema.id}
                active={schema.active}
                order={fields.length > 1 ? schema.order : undefined}
              >
                <>
                  <DropdownMenuItem
                    onClick={() => update(index, { ...schema, active: !schema.active })}
                  >
                    {schema.active ? (
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
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ListOrdered /> Priority
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                          value={schema.order.toString()}
                          onValueChange={(value) =>
                            update(index, { ...schema, order: parseInt(value) })
                          }
                        >
                          <DropdownMenuRadioItem value="1">
                            <span>1</span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="2">
                            <span>2</span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="3">
                            <span>3</span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="4">
                            <span>4</span>
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="5">
                            <span>5</span>
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={() => setSchemaEdit({ index, schema })}>
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
                  {schema.clip_fields?.length ? (
                    <>
                      <p>Sync method:</p>
                      <p>{schema.sync}</p>
                      <p>Clip Fields:</p>
                      <p>
                        {schema.clip_fields
                          ?.map((f) => ('key_name' in f ? f.key_name : f.type))
                          .join(', ')}
                      </p>
                    </>
                  ) : null}
                  {schema.log_fields?.length ? (
                    <>
                      <p>Log Fields:</p>
                      <p>{schema.log_fields?.map((f) => f.key_name).join(', ')}</p>
                    </>
                  ) : null}
                  <p>CSV parsing:</p>
                  <p>{schema.csv_import ? 'true' : 'false'}</p>
                </>
              </SettingsAccordionContent>
            </SettingsAccordionItem>
          )
        })}
      </SettingsAccordion>
      <SchemaDialog
        append={append}
        update={update}
        schemaEdit={schemaEdit}
        setSchemaEdit={setSchemaEdit}
        schemasLength={fields.length}
      />
    </FormRow>
  )
}

export default CustomContent

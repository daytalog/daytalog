import { useFieldArray, useFormContext } from 'react-hook-form'
import type { SchemaFormType } from './types'
import type { CameraMetadataEnumType, FieldEnumType } from 'daytalog'
import { FormField, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface SubfieldArrayProps {
  type: FieldEnumType | CameraMetadataEnumType
  place: 'log' | 'clip'
  parentIndex: number
}

const SubfieldArray: React.FC<SubfieldArrayProps> = ({ type, place, parentIndex }) => {
  const { control } = useFormContext<SchemaFormType>()
  const { fields, append, remove } = useFieldArray({
    control, // control prop comes from useForm or FormProvider
    name: `${place}_fields.${parentIndex}.subfields`, // unique name for your Field Array
    keyName: 'rhfId'
  })

  /*const subfieldErrors: FieldError | undefined =
    errors.project_custom_fields?.fields?.[parentIndex] &&
    'subfields' in errors.project_custom_fields?.fields?.[parentIndex]
      ? (errors.project_custom_fields?.fields?.[parentIndex].subfields as FieldError)
      : undefined*/

  useEffect(() => {
    if (type !== 'kv_map_list') {
      remove()
    } else if (fields.length === 0) {
      append({ key_name: '' })
    }
  }, [type])

  if (type === 'kv_map_list') {
    return (
      <div className="space-y-3">
        <div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
          {fields.map((field, index) => (
            <div
              key={field.rhfId}
              className={`flex items-center gap-4 p-4 ${
                index !== fields.length - 1 ? 'border-b border-border/30' : ''
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <FormField
                  control={control}
                  name={`${place}_fields.${parentIndex}.subfields.${index}.key_name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter key name"
                          className="bg-background/50 border-border/50 focus:border-primary/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length < 2}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {fields.length} key{fields.length !== 1 ? 's' : ''} defined
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ key_name: '' })}
            className="gap-2"
          >
            <Plus className="size-4" />
            Add Key
          </Button>
        </div>
      </div>
    )
  } else return null
}

export default SubfieldArray

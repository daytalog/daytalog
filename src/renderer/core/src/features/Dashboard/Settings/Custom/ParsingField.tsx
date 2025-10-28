import React, { useMemo } from 'react'
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { UseFieldArrayRemove, useFormContext, useWatch } from 'react-hook-form'
import { SchemaFormType, FieldType } from './types'
import type { FieldEnumType, CameraMetadataEnumType } from 'daytalog'
import { CameraMetadataEnumZod } from 'daytalog'
import SubfieldArray from './SubfieldArray'
import { Badge } from '@components/ui/badge'
import { BasicDropdownItems, delimiterDropdownItems } from './utils/dropdownItems'
import { useFieldSelection } from './FieldSelectionContext'
import { Trash2, Table, SeparatorHorizontal } from 'lucide-react'

interface ParsingFieldProps {
  place: 'log' | 'clip'
  showCol: boolean
  index: number
  remove: UseFieldArrayRemove
}

const ParsingField: React.FC<ParsingFieldProps> = ({ place, showCol, index, remove }) => {
  const { control, setValue, getValues } = useFormContext<SchemaFormType>()
  const activeType = useWatch({
    control,
    name: `${place}_fields.${index}.type`
  }) as FieldEnumType | CameraMetadataEnumType

  const { unselectableMetaFields } = useFieldSelection()

  // Memoize the camera metadata check for better performance
  const isCameraMetadataType = useMemo(() => {
    return (type: string) => CameraMetadataEnumZod.options.includes(type as CameraMetadataEnumType)
  }, [])

  const handleTypeChange = (type: FieldEnumType | CameraMetadataEnumType): void => {
    const currentField = getValues(`${place}_fields.${index}`) as FieldType

    // Cache common property access
    const hasKeyName = 'key_name' in currentField
    const keyName = hasKeyName ? currentField.key_name : ''
    const column = 'column' in currentField ? currentField.column : undefined

    // Check if it's a camera metadata type once
    const isCameraMetadata = isCameraMetadataType(type)

    // Base field object
    const baseField: any = {
      type,
      column
    }

    // Add key_name only for non-camera metadata types
    if (!isCameraMetadata) {
      baseField.key_name = keyName
    }

    // Add type-specific properties
    let newField: any = { ...baseField }

    switch (type) {
      case 'text_list':
        newField.delimiter = 'delimiter' in currentField ? currentField.delimiter : ','
        break

      case 'text_list_list':
        newField.primary_delimiter =
          'primary_delimiter' in currentField ? currentField.primary_delimiter : ','
        newField.secondary_delimiter =
          'secondary_delimiter' in currentField ? currentField.secondary_delimiter : '|'
        break

      case 'kv_map':
        newField.primary_delimiter =
          'primary_delimiter' in currentField ? currentField.primary_delimiter : ';'
        newField.secondary_delimiter =
          'secondary_delimiter' in currentField ? currentField.secondary_delimiter : ':'
        break

      case 'kv_map_list':
        newField.subfields =
          'subfields' in currentField ? currentField.subfields : [{ key_name: '' }]
        newField.primary_delimiter =
          'primary_delimiter' in currentField ? currentField.primary_delimiter : ','
        newField.secondary_delimiter =
          'secondary_delimiter' in currentField ? currentField.secondary_delimiter : '|'
        break

      default:
        if (!isCameraMetadata) {
          console.warn('Unknown type:', type)
          return
        }
        break
    }

    // Single setValue call with validation disabled for better performance
    setValue(`${place}_fields.${index}`, newField, { shouldValidate: false })
  }

  return (
    <>
      <tr
        className={`h-14 min-h-14 border-b border-border/20 peer hover:bg-muted/30 transition-colors ${activeType === 'kv_map_list' && 'border-b-0'}`}
        key={`${place}_fields.${index}`}
      >
        <td className="px-3 py-4 align-top">
          <Badge variant="outline" className="text-muted-foreground font-medium">
            {activeType}
          </Badge>
        </td>
        {!isCameraMetadataType(activeType) ? (
          <td className="px-3 py-3 align-top">
            <FormField
              control={control}
              name={`${place}_fields.${index}.key_name`}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel hidden>Key</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Key" className="border-border/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </td>
        ) : (
          <td className="px-6 py-4 align-top">
            <span className="text-muted-foreground font-medium">{activeType}</span>
          </td>
        )}

        <td className="px-3 py-3 align-top">
          {showCol && (
            <FormField
              control={control}
              name={`${place}_fields.${index}.column`}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel hidden>CSV Column Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Column" className="border-border/50" />
                  </FormControl>
                  <FormMessage className="pb-5" />
                </FormItem>
              )}
            />
          )}
        </td>

        <td className="px-3 py-3 align-top w-12">
          <div className="w-6" />
        </td>
        <td className="absolute right-4 mt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="icon" className="p-3" variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Table /> Type
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <FormField
                      control={control}
                      name={`${place}_fields.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DropdownMenuRadioGroup
                              value={field.value}
                              onValueChange={(v) => handleTypeChange(v as FieldEnumType)}
                            >
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Basic Types</DropdownMenuLabel>
                                {BasicDropdownItems.map((item) => (
                                  <DropdownMenuRadioItem value={item.value} key={item.value}>
                                    {item.label}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuGroup>
                              {place === 'clip' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuGroup>
                                    <DropdownMenuLabel>Metadata</DropdownMenuLabel>
                                    {CameraMetadataEnumZod.options?.map((item) => (
                                      <DropdownMenuRadioItem
                                        value={item}
                                        disabled={unselectableMetaFields?.includes(item)}
                                        key={item}
                                      >
                                        {item}
                                      </DropdownMenuRadioItem>
                                    ))}
                                  </DropdownMenuGroup>
                                </>
                              )}
                            </DropdownMenuRadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              {activeType === 'text_list' ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <SeparatorHorizontal /> Delimiter
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <FormField
                        control={control}
                        name={`${place}_fields.${index}.delimiter`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <DropdownMenuRadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                {delimiterDropdownItems.map((item) => (
                                  <DropdownMenuRadioItem key={item.value} value={item.value}>
                                    <span className="mr-1 ml-2 w-4">{item.value}</span>
                                    <span>{item.label}</span>
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ) : null}
              {activeType === 'kv_map' ||
              activeType === 'text_list_list' ||
              activeType === 'kv_map_list' ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <SeparatorHorizontal /> Delimiters
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Primary Delimiter</DropdownMenuLabel>
                        <FormField
                          control={control}
                          name={`${place}_fields.${index}.primary_delimiter`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <DropdownMenuRadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  {delimiterDropdownItems.map((item) => (
                                    <DropdownMenuRadioItem
                                      key={item.value}
                                      value={item.value}
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <span className="mr-1 ml-2 w-4">{item.value}</span>
                                      <span>{item.label}</span>
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Secondary Delimiter</DropdownMenuLabel>
                        <FormField
                          control={control}
                          name={`${place}_fields.${index}.secondary_delimiter`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <DropdownMenuRadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  {delimiterDropdownItems.map((item) => (
                                    <DropdownMenuRadioItem
                                      key={item.value}
                                      value={item.value}
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <span className="mr-1 ml-2 w-4">{item.value}</span>
                                      <span>{item.label}</span>
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </DropdownMenuGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => remove(index)} variant="destructive">
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
      {activeType === 'kv_map_list' && (
        <tr className="border-b border-border/20 peer-hover:bg-muted/30 transition-colors">
          <td colSpan={showCol ? 4 : 3} className="px-4 py-4">
            <SubfieldArray type={activeType} place={place} parentIndex={index} />
          </td>
        </tr>
      )}
    </>
  )
}

export default ParsingField

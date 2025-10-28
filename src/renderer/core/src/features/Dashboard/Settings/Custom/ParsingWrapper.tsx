import React, { useEffect } from 'react'
import { Button } from '@components/ui/button'
import ParsingField from './ParsingField'
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form'
import { SchemaFormType } from './types'
import { Plus } from 'lucide-react'
import FormRow from '@components/FormRow'
import Matching from './Matching'
import MatchingFields from './MatchingFields'
import { useFieldSelection } from './FieldSelectionContext'

interface ParsingWrapperProps {
  place: 'log' | 'clip'
  desc: string
}

const ParsingWrapper: React.FC<ParsingWrapperProps> = ({ place, desc }) => {
  const { control } = useFormContext<SchemaFormType>()
  const showCol = useWatch({ control, name: 'csv_import' })
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${place}_fields`
  })
  const { updateFieldSelection } = useFieldSelection()

  // Update field selection when fields change (for clip fields only)
  useEffect(() => {
    if (place === 'clip') {
      const usedFieldTypes = fields.map((field: any) => field.type).filter(Boolean)
      updateFieldSelection(usedFieldTypes)
    }
  }, [fields, place, updateFieldSelection])

  //className="text-sm leading-6 text-gray-400 sm:mt-0
  return (
    <>
      <FormRow
        key={`${place}_fields`}
        label={`${[place.slice(0, 1).toUpperCase(), place.slice(1)].join('')} fields`}
        description={desc}
      >
        {fields.length && place === 'clip' ? <Matching /> : ''}
        <div className="rounded-md py-3 px-3 mt-3 mb-3 border empty:hidden relative">
          {!!fields.length && (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-muted-foreground border-b border-border/50">
                  <th className="px-3 py-2.5 font-semibold">Type</th>
                  <th className="pr-3 pl-6 py-2.5 font-semibold">Key</th>
                  {showCol && <th className="pr-3 pl-6 py-2.5 font-semibold">Column</th>}
                  <th className="px-3 py-2.5 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {place === 'clip' && <MatchingFields showCol={showCol} />}
                {fields.map((field, index) => {
                  return (
                    <ParsingField
                      place={place}
                      key={`${place}_${field.id}`}
                      index={index}
                      showCol={showCol}
                      remove={remove}
                    />
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <Button
          type="button"
          onClick={() => append({ key_name: '', column: '', type: 'text' })}
          size="sm"
          className={`${fields.length && 'absolute right-0 -top-1'}`}
        >
          <Plus className="size-4" />
          Add field
        </Button>
      </FormRow>
    </>
  )
}

export default ParsingWrapper

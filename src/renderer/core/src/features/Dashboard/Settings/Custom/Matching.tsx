import { FormField, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'
import RadioCards from '@components/customized/radio-group/radio-group-08'
import { useFieldSelection } from './FieldSelectionContext'

const Matching = () => {
  const { control, setValue } = useFormContext()
  const clipFields = useWatch({ control, name: 'clip_fields' })
  const { updateFieldSelection } = useFieldSelection()

  const handleSyncChange = (newSync: string) => {
    const syncValue = newSync as 'clip' | 'tc'

    // Remove incompatible fields BEFORE changing sync value
    const fieldsToRemove: number[] = []
    const usedFieldTypes: string[] = []
    clipFields.forEach((field, index) => {
      const fieldWithType = field as any // Type assertion for field with type property

      // Collect all used field types for unselectable calculation
      if (fieldWithType.type) {
        usedFieldTypes.push(fieldWithType.type)
      }
      if (syncValue === 'tc') {
        usedFieldTypes.push('tc_start', 'tc_end')
      }
      if (syncValue === 'clip') {
        usedFieldTypes.push('clip')
      }

      // Mark fields for removal based on sync mode
      if (syncValue === 'clip' && fieldWithType.type === 'clip') {
        if (fieldWithType.column) setValue(`clip_col`, fieldWithType.column)
        fieldsToRemove.push(index)
      } else if (
        syncValue === 'tc' &&
        (fieldWithType.type === 'tc_start' || fieldWithType.type === 'tc_end')
      ) {
        if (fieldWithType.type === 'tc_start' && fieldWithType.column) {
          setValue(`tc_start_col`, fieldWithType.column)
        }
        if (fieldWithType.type === 'tc_end' && fieldWithType.column) {
          setValue(`tc_end_col`, fieldWithType.column)
        }
        fieldsToRemove.push(index)
      }
    })
    // Remove fields in reverse order to maintain correct indices
    fieldsToRemove.reverse().forEach((index) => {
      setValue(
        'clip_fields',
        clipFields.filter((_, i) => i !== index)
      )
    })

    // Update field selection rules based on remaining fields
    updateFieldSelection(usedFieldTypes)

    // Now change the sync value
    setValue('sync', syncValue)
  }

  return (
    <div className="mb-4">
      <FormField
        control={control}
        name="sync"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormControl>
              <RadioCards
                options={[
                  { value: 'clip', label: 'Clip name Sync', desc: 'Example: A001C001' },
                  { value: 'tc', label: 'Timecode Sync', desc: 'Example: HH:MM:SS:FF' }
                ]}
                value={field.value}
                onValueChange={handleSyncChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default Matching

import { useEffect, useState } from 'react'
import { Label } from '@components/ui/label'
import { Button } from '@components/ui/button'
import { Plus, X } from 'lucide-react'
import { useWatch, useFormContext } from 'react-hook-form'
import type { CustomType, CustomSchemaType } from 'daytalog'
import { HandleAddClipsParams } from './types'

type CustomSectionProps = {
  schema: CustomSchemaType
  handleAddClips: (params: HandleAddClipsParams) => void
  removeCustomSchema: (schema: CustomSchemaType) => void
}

const CustomSection = ({ schema, handleAddClips, removeCustomSchema }: CustomSectionProps) => {
  const { control } = useFormContext()
  const [clips, setClips] = useState(0)
  const watch: CustomType[] = useWatch({ name: 'custom', control }) ?? []

  useEffect(() => {
    const wSchema = watch.find((s) => s.schema === schema.id)
    console.log(watch, wSchema)
    setClips(wSchema?.clips?.length ?? 0)
  }, [watch, schema.id])
  return (
    <div key={`custom_${schema.id}`}>
      <Label htmlFor={`${schema.id}-copies`} className="text-base capitalize">
        {schema.id}
      </Label>
      <p className="text-muted-foreground text-sm">
        {`${clips && clips > 0 ? clips : 'No'} clips added`}
      </p>
      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={() => handleAddClips({ type: 'custom', schema })}>
          <Plus className="size-4" />
          Select CSV file
        </Button>
        {clips > 0 && (
          <Button size="sm" onClick={() => removeCustomSchema(schema)} variant="destructive">
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}

export default CustomSection

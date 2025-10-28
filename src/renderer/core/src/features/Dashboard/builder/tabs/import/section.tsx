import React from 'react'
import { Label } from '@components/ui/label'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import { useWatch } from 'react-hook-form'
import { CustomSchemaType } from 'daytalog'

interface CommonSectionProps {
  label: string
  disabled?: boolean
  handleRemoveClipsLocal?: () => void
}

type CustomSectionProps = CommonSectionProps & {
  type: 'custom'
  schema: CustomSchemaType
  handleAddClips: (type: 'custom', schema: CustomSchemaType) => void
  children?: React.ReactNode
}

type OtherSectionProps = CommonSectionProps & {
  type: 'ocf' | 'sound' | 'proxy'
  handleAddClips: (type: 'ocf' | 'sound' | 'proxy') => void
  schema?: undefined
  children?: React.ReactNode
}

type SectionProps = CustomSectionProps | OtherSectionProps

const ClipN = (clips, schema) => {
  const clipsN = clips.find((s) => s.id === schema.id)?.clips
  return clipsN && clipsN.length > 0 ? clipsN : 'No'
}

export const Section = ({
  type,
  schema,
  label,
  disabled,
  handleAddClips,
  children
}: SectionProps) => {
  const clips = useWatch({ name: type === 'custom' ? 'custom' : `${type}.clips` })

  if (type === 'ocf') {
    return (
      <div key={type}>
        <Label htmlFor={`${type}-copies`} className="text-base">
          {label}
        </Label>
        <p className="text-muted-foreground text-sm">{`${clips && clips.length > 0 ? clips.length : 'No'} clips added`}</p>
        {children}
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => handleAddClips(type)}>
            <Plus className="size-4" />
            Add Folder
          </Button>
        </div>
      </div>
    )
  } else if (type === 'sound') {
    const watchClips = useWatch({ name: `ocf.clips` })
    return (
      <div key={type}>
        <Label htmlFor={`${type}-copies`} className="text-base">
          {label}
        </Label>
        <p className="text-muted-foreground text-sm">{`${clips && clips.length > 0 ? clips.length : 'No'} clips added`}</p>
        {children}
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => handleAddClips(type)} disabled={watchClips.length === 0}>
            <Plus className="size-4" />
            Add Folder
          </Button>
        </div>
      </div>
    )
  } else if (type === 'proxy') {
    const watchClips = useWatch({ name: `ocf.clips` })
    return (
      <div key={type}>
        <Label htmlFor={`${type}-copies`} className="text-base">
          {label}
        </Label>
        <p className="text-muted-foreground text-sm">
          {`${clips && clips.length > 0 ? clips.length : 'No'} clips added`}
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => handleAddClips(type)} disabled={watchClips.length === 0}>
            <Plus className="size-4" />
            Add Folder
          </Button>
          {clips && clips.length > 0 ? children : null}
        </div>
      </div>
    )
  } else if (type === 'custom') {
    return (
      <div key={`${type}_${schema.id}`}>
        <Label htmlFor={`${type}-copies`} className="text-base capitalize">
          {label}
        </Label>
        <p className="text-muted-foreground text-sm">
          {disabled
            ? 'Add Custom fields in app settings to enable this option'
            : `${ClipN(clips, schema)} clips added`}
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => handleAddClips(type, schema)} disabled={disabled}>
            <Plus className="size-4" />
            Select CSV file
          </Button>
          {clips && clips.length > 0 ? children : null}
        </div>
      </div>
    )
  } else {
    return null
  }
}

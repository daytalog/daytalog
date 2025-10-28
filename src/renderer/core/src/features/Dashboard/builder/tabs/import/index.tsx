import { useState } from 'react'
import type { RefObject } from 'react'
import { Button } from '@components/ui/button'
import { mergeDirtyValues } from '../../utils/merge-clips'
import type {
  CopyType,
  CustomSchemaType,
  CustomType,
  OcfClipType,
  ProxyClipType,
  SoundClipType
} from 'daytalog'
import { useFormContext } from 'react-hook-form'
import { CopiesList } from './CopiesList'
import { X } from 'lucide-react'
import { Section } from './section'
import { ProjectRootType } from '@shared/core/project-types'
import LoadingDialog from '@components/LoadingDialog'
import CustomSection from './customSection'

interface ImportProps {
  project: ProjectRootType
  ocfPaths: RefObject<Set<string>>
  soundPaths: RefObject<Set<string>>
  proxyPaths: RefObject<Set<string>>
}

function getVolumeName(filePath: string): string {
  if (filePath.startsWith('/Volumes/')) {
    const parts = filePath.split('/')
    return parts.length > 2 ? parts[2] : filePath
  } else {
    const parts = filePath.split('/')
    if (parts.length > 1) {
      switch (parts[1]) {
        case 'Users':
        case 'Applications':
        case 'System':
        case 'Library':
          return 'Macintosh HD'
        default:
          return filePath
      }
    }
  }

  return filePath // default return if none of the conditions are met
}

export const Import = ({ project, ocfPaths, soundPaths, proxyPaths }: ImportProps) => {
  const [loadingOpen, setLoadingOpen] = useState<boolean>(false)
  const schemas = project.custom_schemas?.filter((s) => s.active && s.csv_import)
  const { getValues, setValue, resetField, formState } = useFormContext()

  function updateClips(fieldPath: 'ocf.clips', newClips: OcfClipType[]): void
  function updateClips(fieldPath: 'sound.clips', newClips: SoundClipType[]): void
  function updateClips(fieldPath: 'proxy.clips', newClips: ProxyClipType[]): void
  function updateClips<T>(fieldPath: string, newClips: T[]) {
    const dirtyFields = formState.dirtyFields[fieldPath]?.clips || formState.dirtyFields[fieldPath]
    const currentClips = getValues(fieldPath)
    const mergedClips = mergeDirtyValues(dirtyFields, currentClips, newClips)

    resetField(fieldPath, { defaultValue: mergedClips, keepDirty: true })
    setValue(fieldPath, mergedClips)
  }

  const updateCustomSchemas = (newSchema: CustomType) => {
    const current = getValues('custom')
    const newList = [...current, newSchema]
    setValue('custom', newList)
  }

  const removeCustomSchema = (schema: CustomSchemaType) => {
    const current = getValues('custom')
    const newList = current.filter((s) => s.schema !== schema.id)
    setValue('custom', newList)
  }

  async function handleAddClips(type: 'custom', schema: CustomSchemaType): Promise<void>
  async function handleAddClips(type: 'ocf' | 'sound' | 'proxy'): Promise<void>
  async function handleAddClips(
    type: 'ocf' | 'sound' | 'proxy' | 'custom',
    schema?: CustomSchemaType
  ): Promise<void> {
    try {
      const currentClips = getValues(`${type === 'sound' ? 'sound' : 'ocf'}.clips`)
      const customSchema = schema ?? null
      setLoadingOpen(true)
      const res = await window.mainApi.getClips(type, currentClips, customSchema)
      if (res.success) {
        const { ocf, sound, proxy, custom } = res.clips
        if (!ocf && !sound && !proxy && !custom) {
          throw new Error('No valid clips found')
        }

        if (res.paths.ocf) res.paths.ocf.forEach((p) => ocfPaths.current.add(p))
        if (res.paths.sound) res.paths.sound.forEach((p) => soundPaths.current.add(p))
        if (res.paths.proxy) proxyPaths.current.add(res.paths.proxy)

        ocf && updateClips('ocf.clips', ocf)
        sound && updateClips('sound.clips', sound)
        proxy && updateClips('proxy.clips', proxy)
        custom && updateCustomSchemas(custom)
      } else {
        if (res.cancelled) return
        throw new Error(res.error)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingOpen(false)
    }
  }

  const handleRemoveClips = async (copy: CopyType, type: 'ocf' | 'sound'): Promise<void> => {
    try {
      const currentClips = getValues(`${type}.clips`)
      const res = await window.mainApi.removeClips(copy.volumes, type, currentClips)
      if (res.success) {
        const { ocf, sound } = res.clips
        if (!ocf && !sound) {
          throw new Error('No valid clips found: both ocf and sound are missing.')
        }

        ocf && updateClips('ocf.clips', ocf)
        sound && updateClips('sound.clips', sound)

        if (type === 'ocf') {
          for (const p of Array.from(ocfPaths.current)) {
            const volumeName = getVolumeName(p)
            if (copy.volumes.some((vol) => volumeName === vol)) {
              ocfPaths.current.delete(p)
            }
          }
        }
        if (type === 'sound') {
          for (const p of Array.from(soundPaths.current)) {
            const volumeName = getVolumeName(p)
            if (copy.volumes.some((vol) => volumeName === vol)) {
              soundPaths.current.delete(p)
            }
          }
        }
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveProxy = (): void => {
    updateClips('proxy.clips', [])
    proxyPaths.current.clear()
  }

  return (
    <div className="space-y-16">
      <Section label="Original Camera Files" type="ocf" handleAddClips={handleAddClips}>
        <CopiesList type="ocf" handleRemoveCopy={handleRemoveClips} />
      </Section>
      <Section label="Sound" type="sound" handleAddClips={handleAddClips}>
        <CopiesList type="sound" handleRemoveCopy={handleRemoveClips} />
      </Section>
      <Section label="Proxies" type="proxy" handleAddClips={handleAddClips}>
        <Button size="sm" onClick={handleRemoveProxy} variant="destructive">
          <X className="size-4" />
          Clear
        </Button>
      </Section>

      {schemas?.map((schema) => (
        <CustomSection
          schema={schema}
          handleAddClips={handleAddClips}
          removeCustomSchema={removeCustomSchema}
        />
      ))}

      <LoadingDialog open={loadingOpen} />
    </div>
  )
}
export default Import

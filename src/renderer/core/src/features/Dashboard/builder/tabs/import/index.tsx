import { useState } from 'react'
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
import { Section } from './Section'
import { ProjectRootType } from '@shared/core/project-types'
import LoadingDialog from '@components/LoadingDialog'
import CustomSection from './CustomSection'
import { toast } from 'sonner'
import { GetClipsParams, RemoveClipsParams } from '@shared/core/shared-types'
import { HandleAddClipsParams } from './types'
interface ImportProps {
  project: ProjectRootType
}

export const Import = ({ project }: ImportProps) => {
  const [loadingOpen, setLoadingOpen] = useState<boolean>(false)
  const schemas = project.custom_schemas?.filter((s) => s.active && s.csv_import)
  const { getValues, setValue, resetField, formState } = useFormContext()

  const addPathNonOverlapping = (type: 'ocf' | 'sound' | 'proxy', newPath: string): void => {
    const currentPaths = getValues(`paths.${type}`) ?? []
    const normalize = (p: string) => {
      let s = p.trim()
      while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
      return s.toLowerCase()
    }
    const newNorm = normalize(newPath)
    for (const existing of currentPaths) {
      const existNorm = normalize(existing)
      const isParent = newNorm.startsWith(existNorm + '/') || newNorm === existNorm
      const isChild = existNorm.startsWith(newNorm + '/')
      if (isParent || isChild) {
        toast.warning('Skipping path due to overlap', {
          description: `"${newPath}" conflicts with existing "${existing}"`,
          duration: 10000
        })
        return
      }
    }
    const newPaths = [...currentPaths, newPath]
    setValue(`paths.${type}`, newPaths)
  }

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

  async function handleAddClips(params: HandleAddClipsParams): Promise<void> {
    const { type } = params
    const schema = 'schema' in params ? params.schema : undefined
    const refreshPath = 'refreshPath' in params ? params.refreshPath : undefined
    try {
      const currentClips = getValues(`${type === 'sound' ? 'sound' : 'ocf'}.clips`)
      setLoadingOpen(true)
      const params: GetClipsParams = {
        type,
        storedClips: currentClips ?? [],
        customSchema: schema ?? null,
        refreshPath: refreshPath ?? null
      }
      const res = await window.mainApi.getClips(params)
      if (res.success) {
        const { ocf, sound, proxy, custom } = res.clips
        if (!ocf && !sound && !proxy && !custom) {
          throw new Error('No valid clips found')
        }
        if (!refreshPath && res.paths && type !== 'custom') {
          const paths = res.paths[type]
          if (paths) {
            paths.forEach((p: string) => addPathNonOverlapping(type, p))
          }
        }

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
      const params: RemoveClipsParams = {
        paths: copy.volumes,
        type,
        storedClips: currentClips ?? []
      }
      const res = await window.mainApi.removeClips(params)
      if (res.success) {
        const { ocf, sound } = res.clips
        if (!ocf && !sound) {
          throw new Error('No valid clips found: both ocf and sound are missing.')
        }

        ocf && updateClips('ocf.clips', ocf)
        sound && updateClips('sound.clips', sound)
      } else {
        console.error(res.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemovePath = (path: string, type: 'ocf' | 'sound' | 'proxy'): void => {
    const currentPaths = getValues(`paths.${type}`)
    const newPaths = currentPaths?.filter((p: string) => p !== path)
    setValue(`paths.${type}`, newPaths)
  }

  const handleRemoveProxyClips = (): void => {
    updateClips('proxy.clips', [])
  }

  return (
    <div className="space-y-16">
      <Section
        label="Original Camera Files"
        type="ocf"
        handleAddClips={handleAddClips}
        handleRemoveCopy={handleRemoveClips}
        handleRemovePath={handleRemovePath}
        loadingOpen={loadingOpen}
      />
      <Section
        label="Sound"
        type="sound"
        handleAddClips={handleAddClips}
        handleRemoveCopy={handleRemoveClips}
        handleRemovePath={handleRemovePath}
        loadingOpen={loadingOpen}
      />
      <Section
        label="Proxies"
        type="proxy"
        handleAddClips={handleAddClips}
        handleRemoveProxyClips={handleRemoveProxyClips}
        handleRemovePath={handleRemovePath}
        loadingOpen={loadingOpen}
      />

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

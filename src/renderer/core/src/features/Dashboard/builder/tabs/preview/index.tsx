import { useMemo, memo, useState, useEffect, useRef } from 'react'
import type { OcfClipType, SoundClipType, ProxyClipType, CustomType } from 'daytalog'
import DataTable from './table/DataTable'
import { createTableData } from './table/Data'
import { useWatch } from 'react-hook-form'
import { createColumns } from './table/Column'
import ErrorBoundary from '@renderer/utils/ErrorBoundary'
import { ProjectRootType } from '@shared/core/project-types'

interface PreviewProps {
  project: ProjectRootType
}

const Preview = memo(({ project }: PreviewProps) => {
  // @ts-expect-error - Schema transformation makes types incompatible but runtime is correct
  const ocfFields: OcfClipType[] = useWatch({ name: 'ocf.clips' }) || []
  // @ts-expect-error - Schema transformation makes types incompatible but runtime is correct
  const soundFields: SoundClipType[] = useWatch({ name: 'sound.clips' }) || []
  // @ts-expect-error - Schema transformation makes types incompatible but runtime is correct
  const proxyFields: ProxyClipType[] = useWatch({ name: 'proxy.clips' }) || []
  // @ts-expect-error - Schema transformation makes types incompatible but runtime is correct
  const customFields: CustomType[] = useWatch({ name: 'custom' }) || []

  const [data, setData] = useState<any>([])
  const [columns, setColumns] = useState<any>([])
  const previousClips = useRef<string | null>(null)

  const clips = useMemo(() => {
    return {
      ocf: ocfFields.map((field: any, index: number) => ({ ...field, index })),
      sound: soundFields.map((field: any, index: number) => ({ ...field, index })),
      proxy: proxyFields.map((field: any, index: number) => ({ ...field, index })),
      custom: customFields.flatMap((schema: CustomType, schemaIndex: number) =>
        (schema.clips || []).map((clip: any, clipIndex: number) => ({
          ...clip,
          schemaSync: project.custom_schemas?.find((s) => s.id === schema.schema)?.sync,
          schemaIndex,
          clipIndex
        }))
      )
    }
  }, [ocfFields, soundFields, proxyFields, customFields])

  useEffect(() => {
    const serializedClips = JSON.stringify(clips)

    // Skip update if clips haven't changed
    if (serializedClips === previousClips.current) return

    previousClips.current = serializedClips // Update reference to current clips

    // Compute new data and columns
    const newData = createTableData(clips)
    const newColumns = createColumns(newData)

    // Update state only when necessary
    setData(newData)
    setColumns(newColumns)
  }, [clips])

  return (
    <ErrorBoundary>
      <DataTable columns={columns} data={data} />
    </ErrorBoundary>
  )
})
export default Preview

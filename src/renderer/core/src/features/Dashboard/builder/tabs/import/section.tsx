import { useMemo, useState } from 'react'
import { Label } from '@components/ui/label'
import { Button } from '@components/ui/button'
import { Plus, X } from 'lucide-react'
import { useWatch } from 'react-hook-form'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import CopiesList from './CopiesList'
import PathsList from './PathsList'
import { CopyType, format } from 'daytalog'
import { HandleAddClipsParams } from './types'

type SectionProps =
  | {
      type: 'proxy'
      label: string
      handleAddClips: (params: HandleAddClipsParams) => void
      handleRemovePath: (path: string, type: 'ocf' | 'sound' | 'proxy') => void
      handleRemoveProxyClips: () => void
      loadingOpen: boolean
    }
  | {
      type: 'ocf' | 'sound'
      label: string
      handleAddClips: (params: HandleAddClipsParams) => void
      handleRemoveCopy: (copy: CopyType, type: 'ocf' | 'sound') => void
      handleRemovePath: (path: string, type: 'ocf' | 'sound' | 'proxy') => void
      loadingOpen: boolean
    }

export const Section = (props: SectionProps) => {
  const { type } = props
  const [copies, setCopies] = useState<CopyType[]>([])

  const clips = useWatch({ name: `${type}.clips` })
  const paths: string[] | null = useWatch({ name: `paths.${type}` })

  useMemo(() => {
    if (type !== 'proxy') {
      const newCopies = clips?.length > 0 ? format.formatCopiesFromClips(clips) : []
      setCopies(newCopies)
    }
  }, [clips, type])

  return (
    <div key={type}>
      <Label htmlFor={`${type}-copies`} className="text-base">
        {props.label}
      </Label>
      <p className="text-muted-foreground text-sm">{`${clips && clips.length > 0 ? clips.length : 'No'} clips added`}</p>

      <Tabs defaultValue={copies.length > 0 ? 'copies' : 'paths'}>
        <div className="relative">
          <TabsList className="absolute -top-11 right-0 left-0 mx-auto w-fit px-2 py-1 rounded-sm border border-white/20 bg-transparent">
            {type !== 'proxy' && (
              <TabsTrigger
                className="text-xs rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-blue-400"
                value="copies"
              >
                Copies
              </TabsTrigger>
            )}
            <TabsTrigger
              className="text-xs rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-blue-400"
              value="paths"
            >
              Paths
            </TabsTrigger>
          </TabsList>
        </div>
        {type !== 'proxy' && (
          <TabsContent value="copies">
            <CopiesList type={type} copies={copies} handleRemoveCopy={props.handleRemoveCopy} />
          </TabsContent>
        )}
        <TabsContent value="paths">
          <PathsList
            type={type}
            paths={paths}
            handleRemovePath={props.handleRemovePath}
            handleRefresh={props.handleAddClips}
            loadingOpen={props.loadingOpen}
          />
        </TabsContent>
      </Tabs>
      <div className="mt-2 flex gap-2">
        <Button size="sm" onClick={() => props.handleAddClips({ type })}>
          <Plus className="size-4" />
          Add Folder
        </Button>
        {type === 'proxy' && clips && clips.length > 0 ? (
          <Button size="sm" onClick={props.handleRemoveProxyClips} variant="destructive">
            <X className="size-4" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  )
}

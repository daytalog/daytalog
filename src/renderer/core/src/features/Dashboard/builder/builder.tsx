import { Button } from '@components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import type { LogType } from 'daytalog'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import { ProjectRootType } from '@shared/core/project-types'
import { formatDate } from '@shared/core/utils/formatDynamicString'
import { Form } from '@components/ui/form'
import StatsPanel from './stats/statspanel'
import { removeEmptyFields } from '@renderer/utils/form'
import Name from './tabs/name'
import Import from './tabs/import/index'
import Preview from './tabs/preview'
import DefaultsDialog from './defaultPaths/defaultsDialog'
import { useNavigate } from 'react-router-dom'
import { daytalogFormSchema, daytalogFormType } from './utils/schema'
import type { Tags } from '@shared/core/utils/formatDynamicString'
import type { ActiveLogPathType } from '@shared/core/shared-types'
import { getDefaultId } from './utils/getDefaultId'
import { toast } from 'sonner'
import { MessageBox } from '@adapters'

interface BuilderdialogProps {
  project: ProjectRootType
  defaultDay: number
  tags: Tags
  selected?: LogType
  paths: ActiveLogPathType
}

const Builder = ({
  project,
  defaultDay,
  tags,
  paths: initialPaths,
  selected
}: BuilderdialogProps) => {
  const navigate = useNavigate()

  const form = useForm<daytalogFormType>({
    defaultValues: {
      id: selected ? selected.id : getDefaultId(project.logid_template, tags),
      day: selected ? selected.day : defaultDay,
      date: selected ? selected.date : formatDate(),
      unit: selected ? selected.unit : project.unit ? project.unit : '',
      ocf: {
        files: selected?.ocf?.files ?? null,
        size: selected?.ocf?.size ?? null,
        duration: selected?.ocf?.duration ?? null,
        reels: selected?.ocf?.reels ?? null,
        copies: selected?.ocf?.copies ?? null,
        clips: selected?.ocf?.clips ?? []
      },
      sound: {
        files: selected?.sound?.files ?? null,
        size: selected?.sound?.size ?? null,
        copies: selected?.sound?.copies ?? null,
        clips: selected?.sound?.clips ?? []
      },
      proxy: {
        files: selected?.proxy?.files ?? null,
        size: selected?.proxy?.size ?? null,
        clips: selected?.proxy?.clips ?? []
      },
      custom: selected?.custom ?? [],
      paths: {
        ocf: initialPaths?.ocf ?? null,
        sound: initialPaths?.sound ?? null,
        proxy: initialPaths?.proxy ?? null
      }
    },
    mode: 'onBlur',
    resolver: zodResolver(daytalogFormSchema) as Resolver<daytalogFormType>
  })

  const {
    formState: { isValid },
    handleSubmit,
    reset
  } = form

  const onError = (errors) => {
    console.log('Errors:', errors)
  }

  const onSubmit: SubmitHandler<daytalogFormType> = async (data): Promise<void> => {
    const { paths, ...rest } = data
    const cleanedData = removeEmptyFields(rest, { keysToKeep: ['hash'] }) as LogType
    const oldDaytalog = selected

    try {
      const res = await window.mainApi.updateDaytalog(cleanedData, paths, oldDaytalog)
      if (res.success) {
        toast.success(`${data.id} has been ${selected ? 'updated' : 'saved'}`)
        reset()
        navigate('/')
      } else if (res.cancelled) {
        return
      } else {
        console.error(res.error)
        toast.error('Issue saving daytalog', { description: `${res.error}` })
      }
    } catch (error) {
      console.error(error)
      toast.error('Issue saving daytalog', { description: 'Unkown error' })
    }
  }

  return (
    <div className="relative mx-auto max-w-screen-2xl px-4">
      <Form {...form}>
        <Tabs defaultValue="name" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sticky top-0 right-0 pt-8 z-40 col-span-6 bg-background">
            <div className="mx-auto">
              <StatsPanel />
            </div>
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-[400px] mt-4 bg-dark">
                <TabsTrigger
                  value="name"
                  className="hover:bg-zinc-900 hover:border-border data-[state=active]:hover:border-none data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-8 data-[state=active]:decoration-blue-400"
                >
                  1. Name
                </TabsTrigger>
                <TabsTrigger
                  value="import"
                  className="hover:bg-zinc-900  hover:border-border data-[state=active]:hover:border-none data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-8 data-[state=active]:decoration-blue-400"
                >
                  2. Import
                </TabsTrigger>
                <TabsTrigger
                  value="clips"
                  className="hover:bg-zinc-900 hover:border-border data-[state=active]:hover:border-none data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-8 data-[state=active]:decoration-blue-400"
                >
                  3. Preview
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <TabsContent value="name" asChild tabIndex={-1}>
            <div className="lg:col-start-2 col-span-3 mb-32 ">
              <Name project={project} />
            </div>
          </TabsContent>
          <TabsContent value="import" asChild tabIndex={-1}>
            <div className="lg:col-start-2 col-span-3 mb-32">
              <Import project={project} />
            </div>
          </TabsContent>
          <TabsContent value="clips" asChild tabIndex={-1}>
            <div className="col-span-6 h-[64vh] mb-16 flex-1 overflow-auto rounded-lg border border-white/10 ">
              <Preview project={project} />
            </div>
          </TabsContent>
        </Tabs>
        <div className="fixed left-0 right-2 bottom-0 p-4 flex justify-between items-center px-4 bg-background/60 backdrop-blur-sm border-t">
          <div>
            <MessageBox inline />
          </div>
          <div className="flex gap-10">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button variant="default" disabled={!isValid} onClick={handleSubmit(onSubmit, onError)}>
              {selected ? 'Update' : 'Submit'}
            </Button>
          </div>
        </div>
        <DefaultsDialog paths={initialPaths} />
      </Form>
    </div>
  )
}

export default Builder

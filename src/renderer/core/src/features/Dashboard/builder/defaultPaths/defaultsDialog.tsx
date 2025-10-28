import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@components/ui/alert-dialog'
import type {
  CheckResult,
  DefaultPathsInput,
  CheckPathsResult,
  ActiveLogPathType
} from '@shared/core/shared-types'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import LoadingDialog from '@components/LoadingDialog'
import { useAccessablePaths } from './useAccessablePaths'

interface DefaultsDialogProps {
  paths: ActiveLogPathType
}

function hasPaths(paths: ActiveLogPathType): boolean {
  return (
    (Array.isArray(paths?.ocf) && paths.ocf.length > 0) ||
    (Array.isArray(paths?.sound) && paths.sound.length > 0) ||
    (typeof paths?.proxy === 'string' && paths.proxy.trim().length > 0)
  )
}

function getAvailablePaths(data: CheckPathsResult): DefaultPathsInput {
  return {
    ocf: data.ocf
      ? data.ocf.filter((item) => item.available).map((item) => item.path) || null
      : null,
    sound: data.sound
      ? data.sound.filter((item) => item.available).map((item) => item.path) || null
      : null,
    proxy: data.proxy && data.proxy.available ? data.proxy.path : null
  }
}

const DefaultsDialog = ({ paths }: DefaultsDialogProps) => {
  const [open, setOpen] = useState<boolean>(hasPaths(paths))
  const [loadingOpen, setLoadingOpen] = useState<boolean>(false)
  const { setValue } = useFormContext()

  if (!paths) return

  const { data } = useAccessablePaths(paths, { enabled: open })

  const handleImportDefaults = async () => {
    console.log('handleImportRun')
    setOpen(false)
    setLoadingOpen(true)
    try {
      const filteredPaths = data ? getAvailablePaths(data) : paths
      const res = await window.mainApi.getDefaultClips(filteredPaths)
      if (res.success) {
        res.clips.ocf && setValue('ocf.clips', res.clips.ocf)
        res.clips.sound && setValue('sound.clips', res.clips.sound)
        res.clips.proxy && setValue('proxy.clips', res.clips.proxy)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingOpen(false)
    }
  }
  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import from paths?</AlertDialogTitle>
            <AlertDialogDescription hidden>
              List of default/stored paths, either accessable or not.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="w-full text-xs flex flex-col gap-4">
            {data &&
              Object.entries(data).map(([key, value]) => {
                if (!value) return null
                const items: CheckResult[] = Array.isArray(value) ? value : [value]
                if (items.length === 0) return null
                return (
                  <div key={key} className="space-y-2">
                    <strong className={` ${key === 'ocf' ? 'uppercase' : 'capitalize'}`}>
                      {key}:
                    </strong>
                    <ul className="space-y-2 w-full list-disc">
                      {items.map((item, index) => (
                        <li
                          key={index}
                          className={`border p-4 rounded-md flex gap-3 items-center ${!item.available && 'text-muted-foreground'}`}
                        >
                          <div
                            className={`size-2 rounded-full ${item.available ? 'bg-green-500' : 'bg-muted-foreground'}`}
                          />
                          <div>
                            <p className="break-all whitespace-normal block">{item.path}</p>
                            <p>{!item.available && '(unavailable)'}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Skip</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleImportDefaults}
              disabled={
                data
                  ? (!data.ocf || data.ocf.every((item) => !item.available)) &&
                    (!data.sound || data.sound.every((item) => !item.available)) &&
                    (!data.proxy || !data.proxy.available)
                  : true
              }
            >
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <LoadingDialog open={loadingOpen} />
    </div>
  )
}

export default DefaultsDialog

import { useWatch, useFormContext } from 'react-hook-form'
import { formSchemaType } from '../types'
import { FormField, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { Pencil } from 'lucide-react'
import { Plus } from 'lucide-react'

interface ProxiesFieldProps {
  scope: 'project' | 'global'
}

const ProxiesField = ({ scope }: ProxiesFieldProps) => {
  const { control, setValue } = useFormContext<formSchemaType>()

  const watch = useWatch({ control, name: `${scope}_default_proxy_path` })

  const handleAddProxiesPath = async (): Promise<void> => {
    try {
      const res = await window.mainApi.getFolderPath()
      if (res.success) {
        setValue(`${scope}_default_proxy_path`, res.data)
      } else console.log(res.error)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <dd className="mt-1 text-sm leading-6 text-gray-400 sm:mt-0 flex justify-between items-center mr-5">
      {watch ? (
        <>
          <FormField
            control={control}
            name={`${scope}_default_proxy_path`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    id={`${scope}_proxiesPath`}
                    type="text"
                    {...field}
                    className="block w-full bg-zinc-950 border-0 py-1.5 hover:text-white focus:text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 focus-visible:shadow-none sm:text-sm sm:leading-6"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setTimeout(() => {
                  document.getElementById(`${scope}_proxiesPath`)?.focus()
                }, 1)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setValue(`${scope}_default_proxy_path`, '')}
            >
              Remove
            </Button>
          </div>
        </>
      ) : (
        <Button type="button" onClick={handleAddProxiesPath} size="sm">
          <Plus className="size-4" />
          Add Path
        </Button>
      )}
    </dd>
  )
}

export default ProxiesField

import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@components/ui/dialog'
import { useForm } from 'react-hook-form'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@components/ui/radio-group'
import { Button } from '@components/ui/button'
import { useInitialData } from './dataContext'
import type { LogType } from 'daytalog'
import { Textarea } from '@components/ui/textarea'
import { Form, FormItem, FormField, FormLabel, FormControl, FormMessage } from '@components/ui/form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'

interface props {
  mockdata: mockDataType
  setMockdata: Dispatch<SetStateAction<mockDataType>>
  children: ReactNode
}

export interface mockDataType {
  message: string
  source: 'logs' | 'generated'
  cacheLog: string
  logs: LogType[]
}

const mockDataFormZod = z.object({
  message: z.string().max(400),
  source: z.enum(['logs', 'generated'])
})

type mockDataFormType = z.infer<typeof mockDataFormZod>

export const NewMockdataDialog: React.FC<props> = ({ mockdata, setMockdata, children }) => {
  const { initialData, generatedDaytalogs } = useInitialData()
  const { loadedDaytalogs } = initialData
  const [open, setOpen] = useState<boolean>(false)

  const form = useForm<mockDataFormType>({
    defaultValues: {
      message: mockdata.message,
      source: mockdata.source
    },
    mode: 'onSubmit',
    resolver: zodResolver(mockDataFormZod)
  })

  const { handleSubmit, control } = form

  const onSubmit = (data: mockDataFormType) => {
    const logs = data.source === 'logs' ? loadedDaytalogs : generatedDaytalogs
    setMockdata({
      message: data.message,
      source: data.source,
      logs: logs,
      cacheLog: logs.map((l) => l.id).join()
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="dark text-foreground">
        <DialogHeader className="mb-2">
          <DialogTitle>Mockdata</DialogTitle>
          <DialogDescription>
            Select and modify mock data in the editor to suit your testing needs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormField
            control={control}
            name={`message`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-col gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="generated" />
                      </FormControl>
                      <FormLabel className="font-normal">Generated logs</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="logs" disabled={!loadedDaytalogs.length} />
                      </FormControl>
                      <FormLabel className="font-normal">Logs from active project</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <div className="mt-4 rounded-md bg-blue-950 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info aria-hidden="true" className="h-5 w-5 text-blue-200" />
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-200">
                  The editor uses the active project’s settings to create mockdata. To apply changes
                  to project settings, update them in the project settings menu and reload the
                  editor.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={handleSubmit(onSubmit)}>
              Update
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

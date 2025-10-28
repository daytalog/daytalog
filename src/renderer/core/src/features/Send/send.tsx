import { useEffect, useState } from 'react'
import { FormField, FormItem, FormControl, FormLabel, FormMessage, Form } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import MultiSelectTextInput from '@components/MultiSelectTextInput'
import MultiSelect from '@components/MultiSelect'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@components/ui/resizable'
import type { EmailType } from 'daytalog'
import { getPdfAttachments } from '@shared/core/utils/getAttachments'
import { mapPdfTypesToOptions } from '@renderer/utils/mapPdfTypes'
import { Loader2, Send as Sendicon, Check, AlertCircle, WifiOff } from 'lucide-react'
import { Toaster } from '@components/ui/sonner'
import { toast } from 'sonner'
import { useStringWithTags } from './utils/useTags'
import { useData } from './utils/useData'
import Preview from '@components/Preview'
import { Header } from './preview/Header'
import { useEmailApi } from '@renderer/utils/useCheckEmailAPI'
import { useOnlineStatus } from '@renderer/utils/OnlineStatus'
import { EmailFormZod } from './types'
import type { EmailFormType } from './types'

interface SendProps {
  defaults: EmailType | null
}

const Send = ({ defaults }: SendProps) => {
  const { data } = useData()
  const { data: hasEmailConfig, isLoading } = useEmailApi()
  const hasSender = !!data?.project.email_sender
  const projectPdfs = data?.project.pdfs ?? []
  const projectTemplates = data?.project?.templatesDir?.filter((val) => val.type === 'email') ?? []
  const isOnline = useOnlineStatus()
  const [sentSuccess, setSendSuccess] = useState<boolean>(false)
  const form = useForm<EmailFormType>({
    defaultValues: {
      recipients: defaults?.recipients ?? [],
      subject:
        data && defaults?.subject
          ? useStringWithTags(data, defaults.subject, defaults.subject)
          : '',
      attachments: defaults?.attachments ?? [],
      message:
        data && defaults?.message
          ? useStringWithTags(data, defaults.message, defaults.message)
          : '',
      react: defaults?.react ?? projectTemplates[0].name
    },
    mode: 'onSubmit',
    resolver: zodResolver(EmailFormZod)
  })

  const {
    control,
    formState: { isSubmitting, isSubmitSuccessful, errors },
    handleSubmit
  } = form

  console.log(errors)

  const onSubmit: SubmitHandler<EmailFormType> = async (data) => {
    try {
      const email: EmailType = {
        id: '',
        label: 'New email',
        enabled: true,
        ...defaults,
        ...data
      }
      const res = await window.sendApi.sendEmail(email)
      if (res.success) {
        setSendSuccess(true)
        window.sendApi.closeSendWindow()
      } else throw new Error(res.error)
    } catch (error) {
      const errormessage =
        error instanceof Error ? error.message : 'Unknown error, please check error log.'
      console.log(errormessage)
      toast('Error:', { description: errormessage })
    }
  }

  const OFFLINE_TOAST_ID = 'offline-toast'
  const MISSING_API_TOAST_ID = 'missing-api-toast'
  const MISSING_SENDER_TOAST_ID = 'missing-sender-toast'

  useEffect(() => {
    if (!isOnline) {
      toast.error('You are offline. Please check your internet connection.', {
        id: OFFLINE_TOAST_ID,
        duration: Infinity,
        closeButton: false,
        icon: <WifiOff className="h-4 w-4" />
      })
    } else {
      toast.dismiss(OFFLINE_TOAST_ID)
    }
  }, [isOnline])

  if (!hasSender) {
    toast.error('Missing sender email address. Set it up in project settings.', {
      id: MISSING_SENDER_TOAST_ID,
      duration: Infinity,
      closeButton: false,
      icon: <AlertCircle className="h-4 w-4" />
    })
  }

  useEffect(() => {
    if (!isLoading) {
      if (!hasEmailConfig) {
        toast.error('Email API not configured. Set it up in project settings.', {
          id: MISSING_API_TOAST_ID,
          duration: Infinity,
          closeButton: false,
          icon: <AlertCircle className="h-4 w-4" />
        })
      } else {
        toast.dismiss(MISSING_API_TOAST_ID)
      }
    }
  }, [hasEmailConfig, isLoading])

  return (
    <div className="h-dvh flex flex-col">
      <Form {...form}>
        <ResizablePanelGroup className="flex-grow pb-20" direction="horizontal">
          <ResizablePanel className="px-8 mt-12" defaultSize={40} maxSize={75}>
            <div className="flex flex-col flex-grow gap-4 h-full pb-4">
              <FormField
                control={control}
                name={`recipients`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To:</FormLabel>
                    <FormControl>
                      <MultiSelectTextInput {...field} dataIndex={0} />
                    </FormControl>
                    {/*Array.isArray(errors.recipients) &&
              errors.recipients.length > 0 &&
              errors.recipients.map((error, index) => (
                <FormMessage key={index}>{error.message}</FormMessage>
              ))*/}
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`subject`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} data-index={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`message`}
                render={({ field }) => (
                  <FormItem className="flex flex-col flex-grow h-full">
                    <FormLabel>Message</FormLabel>
                    <FormControl className="flex-grow h-full">
                      <Textarea {...field} className="h-full resize-none" data-index={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`attachments`}
                render={({ field }) => (
                  <FormItem className="overflow-visible">
                    <FormLabel>Attachments</FormLabel>
                    <FormControl>
                      <MultiSelect
                        dataIndex={3}
                        menuPosition="fixed"
                        {...field}
                        value={mapPdfTypesToOptions(
                          getPdfAttachments(projectPdfs, field.value ?? [])
                        )}
                        onChange={(newValues) => {
                          const updatedAttachments = newValues
                            .map((id) => {
                              const foundPdf = projectPdfs.find((pdf) => pdf.id === id)
                              return foundPdf?.id
                            })
                            .filter(Boolean)

                          field.onChange(updatedAttachments)
                        }}
                        options={projectPdfs
                          ?.filter((pdf) => pdf.enabled)
                          .map((pdf) => {
                            const option = { label: pdf.label, value: pdf.id }
                            return option
                          })}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="ml-8 mr-4" defaultSize={60} maxSize={75}>
            <Header />
            <Preview />
          </ResizablePanel>
        </ResizablePanelGroup>

        <div className="fixed bottom-0 w-full justify-end flex p-4 border-t">
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => window.sendApi.closeSendWindow()}>
              {isSubmitSuccessful && sentSuccess ? 'Close window' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={
                isSubmitting ||
                (isSubmitSuccessful && sentSuccess) ||
                isLoading ||
                !hasEmailConfig ||
                !data?.project.email_sender ||
                !isOnline
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : isSubmitSuccessful && sentSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4 animate-fadeInMove" />
                  Sent Successfully
                </>
              ) : (
                <>
                  <Sendicon className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </Form>
      <Toaster />
    </div>
  )
}

export default Send

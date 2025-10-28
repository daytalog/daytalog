import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@components/ui/sheet'
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { KeyRound } from 'lucide-react'
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@components/ui/form'
import { Card, CardHeader, CardTitle, CardDescription } from '@components/ui/card'
import { useFormContext, useForm, SubmitHandler } from 'react-hook-form'
import { emailApiType, emailApiZodObj, emailProvidersZod } from '@shared/core/project-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { formSchemaType } from '../../types'
import Headers from './Headers'
import z from 'zod'

const infoText = (provider: z.infer<typeof emailProvidersZod>): string => {
  switch (provider) {
    case 'custom':
      return 'Set URL and headers.'
    case 'postmark':
      return 'Get the API Key from your Postmark account and paste it here'
    case 'resend':
      return 'Get the API Key from your Resend account and paste it here'
    case 'sendgrid':
      return 'Get the URL and API Key from your Sendgrid account and paste it here'
    default:
      return ''
  }
}
type ApiKeyDialogProps = {
  hasConfig: boolean
}
const ApiKeyDialog = ({ hasConfig }: ApiKeyDialogProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [internalHasConfig, setInternalHasConfig] = useState<boolean>(false)
  const { setValue: setMasterValue } = useFormContext<formSchemaType>()

  const defaultValues = {
    provider: undefined,
    api_key: undefined,
    url: undefined,
    headers: [{ header: '', value: '' }]
  }

  const form = useForm<emailApiType>({
    defaultValues: defaultValues,
    mode: 'all',
    resolver: zodResolver(emailApiZodObj)
  })

  const { control, handleSubmit, watch, reset } = form
  const provider = watch('provider')

  const onSubmit: SubmitHandler<emailApiType> = (data): void => {
    console.log(data)
    setMasterValue('new_email_api', data)
    onOpenChange(false)
    setInternalHasConfig(true)
  }

  const onOpenChange = (open: boolean): void => {
    setOpen(open)
    if (open === false) {
      reset(defaultValues)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button type="button">
          <KeyRound />
          {`${hasConfig || internalHasConfig ? 'Update' : 'Configure'} Email API`}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-2 w-full max-w-[800px]">
        <SheetHeader>
          <SheetTitle>Email API Configuration</SheetTitle>
          <SheetDescription>Select your email provider or a custom API endpoint.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <div className="space-y-2 px-4">
            <FormField
              key={'provider'}
              control={control}
              name={'provider'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="font-normal text-xs text-muted-foreground  underline underline-offset-8">
                            Custom Endpoint
                          </SelectLabel>
                          <SelectItem value="custom">Custom HTTPS Request</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="mt-2 font-normal text-xs text-muted-foreground  underline underline-offset-8">
                            Email Providers
                          </SelectLabel>
                          <SelectItem value="postmark">Postmark</SelectItem>
                          <SelectItem value="resend">Resend</SelectItem>
                          <SelectItem value="sendgrid">Sendgrid</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {provider && (
              <Card className="flex flex-col gap-4 border rounded-md p-6 pb-8">
                <CardHeader className="p-0">
                  <CardTitle className="capitalize">{provider}</CardTitle>
                  <CardDescription>{infoText(provider)}</CardDescription>
                </CardHeader>

                {(provider === 'custom' || provider === 'sendgrid') && (
                  <FormField
                    key={'url'}
                    control={control}
                    name={'url'}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {provider !== 'custom' ? (
                  <FormField
                    key={'api_key'}
                    control={control}
                    name={'api_key'}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <Headers control={control} />
                )}
              </Card>
            )}
          </div>
          <SheetFooter className="flex gap-2">
            <Button type="button" onClick={handleSubmit(onSubmit)}>
              Set
            </Button>
            <SheetClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default ApiKeyDialog

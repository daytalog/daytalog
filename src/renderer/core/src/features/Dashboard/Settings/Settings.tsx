import { useState, useEffect } from 'react'
import { Button } from '@components/ui/button'
import { useForm, FormProvider, SubmitHandler, SubmitErrorHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@components/ui/form'
import { removeEmptyFields, removePrefixFields } from '@renderer/utils/form'
import { ProjectSettingsType, TemplateDirectoryFile } from '@shared/core/project-types'
import { formSchemaType, formSchema, Scope } from './types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import ContentCard from './ContentCard'
import GeneralTab from './General/GeneralTab'
import DefaultsTab from './Defaults/DefaultsTab'
import CustomTab from './Custom/CustomTab'
import SelfManagedTab from './SelfManaged/SelfManagedlTab'
import PresetsTab from './Presets/PresetsTab'
import WarningPresets from './Presets/WarningPresets'
import { useNavigate } from 'react-router-dom'
import WarningDefaults from './Defaults/WarningDefaults'
import { toast } from 'sonner'

interface SettingsDialogProps {
  defaults: ProjectSettingsType
  email_api_exists: boolean
  templates: TemplateDirectoryFile[]
}

const Settings: React.FC<SettingsDialogProps> = ({ defaults, email_api_exists, templates }) => {
  const navigate = useNavigate()
  const [scope, setScope] = useState<Scope>('project')

  useEffect(() => {
    reset(defaultValues(defaults, email_api_exists))
  }, [defaults])

  const defaultValues = (defaults: ProjectSettingsType, email_api_exists: boolean) => ({
    project_project_name: defaults.project?.project_name ?? '',
    project_logid_template: defaults.project?.logid_template ?? '',
    project_unit: defaults.project?.unit ?? '',
    project_default_ocf_paths: defaults.project?.default_ocf_paths ?? [],
    project_default_sound_paths: defaults.project.default_sound_paths ?? [],
    project_default_proxy_path: defaults.project?.default_proxy_path ?? '',
    project_custom_schemas: defaults.project?.custom_schemas ?? [],
    project_emails: defaults.project?.emails ?? [],
    project_pdfs: defaults.project?.pdfs ?? [],
    global_logid_template: defaults.global?.logid_template ?? '',
    global_unit: defaults.global?.unit ?? '',
    global_default_ocf_paths: defaults.global?.default_ocf_paths ?? [],
    global_default_sound_paths: defaults.global?.default_sound_paths ?? [],
    global_default_proxy_path: defaults.global?.default_proxy_path ?? '',
    global_custom_schemas: defaults.global?.custom_schemas ?? [],
    global_emails: defaults.global?.emails ?? [],
    global_pdfs: defaults.global?.pdfs ?? [],
    global_email_sender: defaults.global?.email_sender ?? '',
    email_api_exist: email_api_exists
  })

  const form = useForm<formSchemaType>({
    defaultValues: defaultValues(defaults, email_api_exists),
    mode: 'all',
    resolver: zodResolver(formSchema)
  })
  const {
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
    reset
  } = form

  const onSubmit: SubmitHandler<formSchemaType> = async (data) => {
    const cleanedData = removeEmptyFields(data, {
      keysToRemove: ['email_api_exist', 'new_email_api']
    }) as formSchemaType
    const projectfields = removePrefixFields(cleanedData, 'project')
    const globalfields = removePrefixFields(cleanedData, 'global')
    const update_email_api = data.new_email_api ?? undefined
    const update_settings = { project: projectfields, global: globalfields } as ProjectSettingsType

    try {
      const result = await window.mainApi.updateProject({ update_settings, update_email_api })
      if (result.success) {
        //console.log('project should be set with:', result.project)
        toast.success('Project Settings has been updated')
        navigate('/')
      }
    } catch (error) {
      console.log(error)
      toast.error('Error', {
        description: 'An unknown error occured while saving settings, please restart the app.'
      })
    }
  }

  const onError: SubmitErrorHandler<formSchemaType> = (errors) => {
    const msgs = Object.values(errors)
      // filter out any nested or non-message errors
      .filter((err): err is { message: string } => typeof (err as any).message === 'string')
      .map((err) => (err as { message: string }).message)
      // remove duplicate messages
      .filter((msg, idx, arr) => arr.indexOf(msg) === idx)
    toast.error('Error', { description: msgs.join('; ') })
  }

  return (
    <div className="relative mt-8">
      <FormProvider {...form}>
        <Form {...form}>
          <form id="settings" onSubmit={handleSubmit(onSubmit, onError)}>
            <Tabs
              className="mx-auto xl:max-w-6xl gap-2 container grid md:grid-cols-[230px_minmax(0,1fr)]"
              defaultValue="general"
              orientation="vertical"
            >
              <div className="h-full">
                <nav className="w-full sticky z-30 top-8">
                  <h1 className="text-3xl font-semibold mb-4 ml-4">Settings</h1>

                  <div className="bg-card text-card-foreground flex flex-col rounded-xl border p-2 shadow-sm">
                    <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
                      <TabsList className="bg-dark rounded-none border-b">
                        <TabsTrigger
                          value="project"
                          className="data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-blue-400"
                        >
                          This Project
                        </TabsTrigger>
                        <TabsTrigger
                          value="global"
                          className="data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-blue-400"
                        >
                          Local Shared
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <TabsList className="flex flex-col justify-between items-start h-auto mt-1 bg-card">
                      <TabsTrigger
                        className="w-full justify-start data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-blue-400"
                        value="general"
                      >
                        Project Info
                      </TabsTrigger>
                      <TabsTrigger
                        className="w-full justify-between data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-blue-400"
                        value="presets"
                      >
                        Presets
                        <WarningPresets templates={templates} />
                      </TabsTrigger>
                      <TabsTrigger
                        className="w-full justify-start data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-blue-400"
                        value="defaults"
                      >
                        Defaults
                        <WarningDefaults />
                      </TabsTrigger>
                      <TabsTrigger
                        className="w-full justify-start data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-blue-400"
                        value="custom"
                      >
                        Custom Schemas
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="bg-card text-card-foreground flex flex-col rounded-xl border p-2 shadow-sm mt-2">
                    <TabsList className="flex flex-col justify-between items-start h-auto bg-card">
                      <TabsTrigger
                        className="w-full justify-between data-[state=active]:underline data-[state=active]:decoration-2 data-[state=active]:underline-offset-4 data-[state=active]:decoration-blue-400"
                        value="selfmanage"
                      >
                        Self managed
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </nav>
              </div>
              <div className="mb-20">
                <TabsContent value="general" tabIndex={-1}>
                  <ContentCard title="Project Info" desc="Basic info about your project">
                    <GeneralTab scope={scope} />
                  </ContentCard>
                </TabsContent>
                <TabsContent value="presets" tabIndex={-1}>
                  <ContentCard title="Presets" desc="Email and PDF Presets to display in menu">
                    <PresetsTab scope={scope} templates={templates} />
                  </ContentCard>
                </TabsContent>
                <TabsContent value="defaults" tabIndex={-1}>
                  <ContentCard
                    title="Defaults"
                    desc="Add defaults with dynamic tags to streamline your workflow."
                  >
                    <DefaultsTab scope={scope} />
                  </ContentCard>
                </TabsContent>
                <TabsContent value="custom" tabIndex={-1}>
                  <ContentCard
                    title="Custom Schemas"
                    desc="You can optionally import more data to merge with your logs and clips"
                  >
                    <CustomTab scope={scope} />
                  </ContentCard>
                </TabsContent>

                <TabsContent value="selfmanage" tabIndex={-1}>
                  <ContentCard
                    title="Self Managed"
                    desc="Preferences for self managing Email distribution"
                  >
                    <SelfManagedTab />
                  </ContentCard>
                </TabsContent>
              </div>
              <div className="fixed right-2 bottom-0  bg-background flex justify-end rounded-tl-lg gap-10 px-6 py-4">
                <Button variant="ghost" type="button" onClick={() => navigate('/')}>
                  Cancel
                </Button>
                <Button form="settings" type="submit" disabled={isSubmitting || isSubmitSuccessful}>
                  Save
                </Button>
              </div>
            </Tabs>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}

export default Settings

// w-[100vw] h-[100vh] max-w-[100vw] max-h-[100vh] bg-black/40 backdrop-blur-sm

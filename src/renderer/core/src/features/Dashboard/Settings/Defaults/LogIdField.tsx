import { useEffect } from 'react'
import type { TabProps } from '../types'
import { useFormContext, useWatch } from 'react-hook-form'
import type { formSchemaType } from '../types'
import FormRow from '@components/FormRow'
import { FormField, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'

const LogIdField = ({ scope }: TabProps) => {
  const {
    control,
    clearErrors,
    formState: { errors }
  } = useFormContext<formSchemaType>()
  const projectLogid = useWatch({ name: 'project_logid_template' })
  const globalLogid = useWatch({ name: 'global_logid_template' })

  useEffect(() => {
    // if project has a value now, drop any lingering global error
    if (projectLogid?.trim() !== '' && errors.global_logid_template) {
      clearErrors('global_logid_template')
    }
    // if global has a value now, drop any lingering project error
    if (globalLogid?.trim() !== '' && errors.project_logid_template) {
      clearErrors('project_logid_template')
    }
  }, [projectLogid, globalLogid, clearErrors, errors])

  return (
    <FormField
      key={`${scope}_logid_template`}
      control={control}
      name={`${scope}_logid_template`}
      render={({ field }) => (
        <FormItem>
          <FormRow
            name={field.name}
            label="Default Log Name"
            description="Dynamic naming of your logs and folders"
            descriptionTag={['Required (project or global)', 'Tag: <log>']}
          >
            <FormControl>
              <Input {...field} className="max-w-80" />
            </FormControl>
            <FormMessage />
          </FormRow>
        </FormItem>
      )}
    />
  )
}

export default LogIdField

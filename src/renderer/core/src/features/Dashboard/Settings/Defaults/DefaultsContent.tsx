import { ReactElement } from 'react'
import { FieldArray } from './FieldArray'
import FormRow from '@components/FormRow'
import ProxiesField from './ProxiesField'
import { useFormContext } from 'react-hook-form'
import type { formSchemaType } from '../types'
import { FormField, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import type { TabProps } from '../types'
import LogIdField from './LogIdField'

const Defaults = ({ scope }: TabProps): ReactElement => {
  const { control } = useFormContext<formSchemaType>()

  return (
    <>
      <LogIdField scope={scope} />
      <FormField
        key={`${scope}_unit`}
        control={control}
        name={`${scope}_unit`}
        render={({ field }) => (
          <FormItem>
            <FormRow
              name={field.name}
              label="Default Crew Unit"
              description="Set the default crew unit for the project."
              descriptionTag={'Tag: <unit>'}
            >
              <FormControl>
                <Input {...field} className="max-w-80" />
              </FormControl>
              <FormMessage />
            </FormRow>
          </FormItem>
        )}
      />
      <FormRow label="Default OCF Paths">
        <FieldArray scope={scope} type="ocf" />
      </FormRow>
      <FormRow label="Default Sound Paths">
        <FieldArray scope={scope} type="sound" />
      </FormRow>
      <FormRow label="Default Proxies Path">
        <ProxiesField scope={scope} />
      </FormRow>
    </>
  )
}

export default Defaults

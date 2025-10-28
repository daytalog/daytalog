import type { TabProps } from '../types'
import FormRow from '@components/FormRow'
import { useFormContext } from 'react-hook-form'
import { formSchemaType } from '../types'
import { FormField, FormItem, FormControl, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'

const GeneralContent = ({ scope }: TabProps) => {
  const { control } = useFormContext<formSchemaType>()
  if (scope === 'project') {
    return (
      <FormField
        key={`project_project_name`}
        control={control}
        name={`project_project_name`}
        render={({ field }) => (
          <FormItem>
            <FormRow
              name={field.name}
              label="Project Name"
              descriptionTag={['Required for Project', `Tag: <project>`]}
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
  } else {
    return (
      <div className="text-muted-foreground text-base">
        <p>Set project info on This Project</p>
      </div>
    )
  }
}

export default GeneralContent

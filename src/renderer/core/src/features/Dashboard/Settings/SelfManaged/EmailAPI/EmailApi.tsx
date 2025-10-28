import FormRow from '@components/FormRow'
import ApiKeyDialog from './ApiKeyDialog'
import RemoveApiButton from './RemoveApi'
import { useWatch } from 'react-hook-form'

const EmailApi = () => {
  const hasConfig = useWatch({ name: 'email_api_exist' })
  return (
    <FormRow
      label="Email API Configuration"
      description="Add an api key from your email provider or send to a custom endpoint"
    >
      <div className="flex gap-2">
        <ApiKeyDialog hasConfig={hasConfig} />
        {hasConfig && <RemoveApiButton />}
      </div>
    </FormRow>
  )
}

export default EmailApi

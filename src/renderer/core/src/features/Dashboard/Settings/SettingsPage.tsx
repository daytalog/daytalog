import { useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { useEmailApi } from '@renderer/utils/useCheckEmailAPI'
import CloseButton from '@components/CloseButton'
import Settings from './Settings'

function SettingsPage() {
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject()
  const { data: emailApiExists, isLoading: isEmailApiLoading } = useEmailApi()
  if (isLoading || isEmailApiLoading) {
    return null
  }

  if (!project) {
    navigate('/new-project')
    return null
  }

  return (
    <div>
      <CloseButton onClick={() => navigate('/')} />
      <Settings
        defaults={project.settings}
        email_api_exists={emailApiExists ?? false}
        templates={project.templatesDir}
      />
    </div>
  )
}

export default SettingsPage

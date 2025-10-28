import { useEffect } from 'react'
import { formSchemaType } from '../types'
import { useFormContext, useWatch } from 'react-hook-form'
import GeneralContent from './GeneralContent'
import type { TabProps } from '../types'

const GeneralTab: React.FC<TabProps> = ({ scope }) => {
  const { control, trigger } = useFormContext<formSchemaType>()

  const projectFolderTemplateValue = useWatch({ control, name: 'project_logid_template' })
  const globalFolderTemplateValue = useWatch({ control, name: 'global_logid_template' })

  useEffect(() => {
    if (projectFolderTemplateValue !== undefined || globalFolderTemplateValue !== undefined) {
      trigger(['project_logid_template', 'global_logid_template'])
    }
  }, [projectFolderTemplateValue, globalFolderTemplateValue, trigger])

  return <GeneralContent scope={scope} />
}

export default GeneralTab

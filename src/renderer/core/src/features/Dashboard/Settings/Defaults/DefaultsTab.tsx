import Defaults from './DefaultsContent'
import type { TabProps } from '../types'

const DefaultsTab = ({ scope }: TabProps) => {
  /*const { control, trigger } = useFormContext<formSchemaType>()
  
    const projectFolderTemplateValue = useWatch({ control, name: 'project_logid_template' })
    const globalFolderTemplateValue = useWatch({ control, name: 'global_logid_template' })
  
    useEffect(() => {
      if (projectFolderTemplateValue !== undefined || globalFolderTemplateValue !== undefined) {
        trigger(['project_logid_template', 'global_logid_template'])
      }
    }, [projectFolderTemplateValue, globalFolderTemplateValue, trigger])*/
  if (scope === 'project') return <Defaults key="project" scope="project" />
  if (scope === 'global') return <Defaults key="global" scope="global" />
  return
}

export default DefaultsTab

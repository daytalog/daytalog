import { ReactElement } from 'react'
import { TemplateDirectoryFile } from '@shared/core/project-types'
import Pdfs from './pdf/Pdfs'
import Emails from './email/Emails'

//import Emails from './Emails'

interface PdfTabProps {
  scope: 'project' | 'global'
  templates: TemplateDirectoryFile[]
}

const PresetsTab = ({ scope, templates }: PdfTabProps): ReactElement => {
  return (
    <>
      {scope === 'project' ? (
        <>
          <Pdfs key="pdf_project" scope="project" templates={templates} />
          <Emails key="emails_projext" scope="project" templates={templates} />
        </>
      ) : (
        <>
          <Pdfs key="pdfs_global" scope="global" templates={templates} />
          <Emails key="emails_global" scope="global" templates={templates} />
        </>
      )}
    </>
  )
}

export default PresetsTab

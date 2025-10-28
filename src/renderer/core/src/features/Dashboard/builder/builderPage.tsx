import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProject'
import { useDaytalogs } from '../hooks/useDaytalogs'
import { getNextDay } from './utils/getNextDay'
import { formatDate } from '@shared/core/utils/formatDynamicString'
import { getPaths } from './utils/getpaths'
import Builder from './builder'
import CloseButton from '@components/CloseButton'

function BuilderPage() {
  const navigate = useNavigate()
  const { logId } = useParams<{ logId?: string }>()
  const { data: project, isLoading: projectsLoading } = useProject()
  const { data: logs, isLoading: daytalogsLoading } = useDaytalogs()

  if (projectsLoading || daytalogsLoading || !project) {
    return null
  }

  const selectedLog = logs.find((log) => log.id === logId)
  const defaultDay = logs.length > 0 ? getNextDay(logs) : 1

  const tags = {
    day: selectedLog ? selectedLog.day : defaultDay,
    date: selectedLog ? selectedLog.date : formatDate(),
    projectName: project.project_name,
    unit: project.unit,
    log: project.logid_template
  }

  const paths = getPaths(project, tags, selectedLog?.id)

  return (
    <div className="">
      <div className="flex justify-center items-center mt-4 mb-1">
        <h2 className="text-1xl font-semibold leading-none tracking-tight">
          {logId ? `Editing: ${logId}` : 'New Shooting Day'}
        </h2>
      </div>
      <CloseButton onClick={() => navigate('/')} />
      <Builder
        project={project}
        defaultDay={defaultDay}
        tags={tags}
        paths={paths}
        selected={selectedLog}
      />
    </div>
  )
}

export default BuilderPage

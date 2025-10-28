import TableConstructor from './TableConstructor'
import EmptyStateCard from '@components/EmptyStateCard'
import { useNavigate } from 'react-router-dom'
import { useDaytalogs } from '../../hooks/useDaytalogs'
import { useProject } from '../../hooks/useProject'

const Table = () => {
  const navigate = useNavigate()
  const { data: logs, isLoading: isDaytalogsLoading } = useDaytalogs()
  const { data: project, isLoading: isProjectLoading } = useProject()

  if (!project || isDaytalogsLoading || isProjectLoading) return null

  if (!logs.length && !isDaytalogsLoading)
    return (
      <EmptyStateCard
        title="No Logs Loaded"
        buttonLabel="New Shooting Day"
        buttonAction={() => navigate('/builder')}
      />
    )

  return <TableConstructor logs={logs} project={project} />
}

export default Table

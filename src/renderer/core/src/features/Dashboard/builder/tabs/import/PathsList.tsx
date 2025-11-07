import PathListItem from './PathListItem'
import EmptyState from './EmptyState'
import { HandleAddClipsParams } from './types'

interface PathsListProps {
  type: 'ocf' | 'sound' | 'proxy'
  paths: string[] | null
  handleRefresh: (params: HandleAddClipsParams) => void
  handleRemovePath: (path: string, type: 'ocf' | 'sound' | 'proxy') => void
  loadingOpen: boolean
}

const PathsList = ({
  type,
  paths,
  handleRemovePath,
  handleRefresh,
  loadingOpen
}: PathsListProps) => {
  if (paths && paths.length > 0) {
    return (
      <ul role="list" className="mt-2 divide-y divide-white/10 rounded-md border border-white/20">
        {paths.map((path) => (
          <PathListItem
            key={path}
            path={path}
            type={type}
            handleRefresh={handleRefresh}
            handleRemovePath={handleRemovePath}
            loadingOpen={loadingOpen}
          />
        ))}
      </ul>
    )
  } else {
    return <EmptyState message="No folder paths" />
  }
}

export default PathsList

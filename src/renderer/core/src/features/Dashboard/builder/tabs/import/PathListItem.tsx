import { useEffect, useState, useRef } from 'react'
import { Button } from '@components/ui/button'
import { parseVolumePath } from '../../utils/getVolumeName'
import { X, RefreshCw } from 'lucide-react'
import { HandleAddClipsParams } from './types'

interface PathListItemProps {
  path: string
  type: 'ocf' | 'sound' | 'proxy'
  handleRefresh: (params: HandleAddClipsParams) => void
  handleRemovePath: (path: string, type: 'ocf' | 'sound' | 'proxy') => void
  loadingOpen: boolean
}

const PathListItem = ({
  path,
  type,
  handleRefresh,
  handleRemovePath,
  loadingOpen
}: PathListItemProps) => {
  const [animate, setAnimate] = useState(false)
  const animationStartTimeRef = useRef<number | null>(null)
  const minAnimationDuration = 1000

  const handleRefreshClick = () => {
    animationStartTimeRef.current = Date.now()
    setAnimate(true)
    handleRefresh({ type, refreshPath: path })
  }

  useEffect(() => {
    if (!loadingOpen && animate && animationStartTimeRef.current) {
      const elapsed = Date.now() - animationStartTimeRef.current
      const remaining = Math.max(0, minAnimationDuration - elapsed)

      const timeout = setTimeout(() => {
        setAnimate(false)
        animationStartTimeRef.current = null
      }, remaining)

      return () => clearTimeout(timeout)
    }
    return undefined
  }, [loadingOpen, animate])

  const [volume, displayPath] = parseVolumePath(path)

  return (
    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
      <div className="flex w-0 flex-1 items-center">
        <div className="ml-4 flex min-w-0 flex-1">
          <span className="truncate text-white font-medium">{volume}</span>
          <span className="flex-shrink-0 text-gray-400">{displayPath}</span>
        </div>
      </div>
      <div className="ml-4 flex flex-shrink-0 gap-2">
        <Button size="sm" variant="secondary" className="group" onClick={handleRefreshClick}>
          <RefreshCw className={`size-4 ${animate ? 'animate-spin' : ''}`} />
        </Button>
        <Button size="sm" variant="destructive" onClick={() => handleRemovePath(path, type)}>
          <X className="size-4" />
        </Button>
      </div>
    </li>
  )
}

export default PathListItem

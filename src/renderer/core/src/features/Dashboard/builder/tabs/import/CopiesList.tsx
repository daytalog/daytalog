import type { CopyType } from 'daytalog'
import { Button } from '@components/ui/button'
import EmptyState from './EmptyState'
import { X } from 'lucide-react'

interface CopiesListProps {
  type: 'ocf' | 'sound'
  copies: CopyType[]
  handleRemoveCopy: (copy: CopyType, type: 'ocf' | 'sound') => void
}

const CopiesList = ({ type, copies, handleRemoveCopy }: CopiesListProps) => {
  if (copies?.length > 0) {
    return (
      <ul role="list" className="mt-2 divide-y divide-white/10 rounded-md border border-white/20">
        {copies?.map((copy, index) => (
          <li
            key={index}
            className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
          >
            <div className="flex w-0 flex-1 items-center">
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <span className="flex-shrink-0 text-gray-400">Copy {index + 1}: </span>
                {copy?.volumes?.map((vol, volIndex) => (
                  <span key={volIndex} className="truncate text-white font-medium">
                    {vol}
                    <span className="text-gray-400">
                      {volIndex < copy.volumes?.length - 1 && ', '}
                    </span>
                  </span>
                ))}
                <span className="flex-shrink-0 text-gray-400">
                  {copy.count[0]} of {copy.count[1]} Clips
                </span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <Button size="sm" variant="destructive" onClick={() => handleRemoveCopy(copy, type)}>
                <X className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    )
  } else {
    return <EmptyState message="No Copies" />
  }
}

export default CopiesList

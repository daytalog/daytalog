import { Badge } from './ui/badge'
import { cn } from './lib/utils'

interface StatusBadgeProps {
  active: boolean
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ active }) => (
  <Badge variant="outline" className="gap-2 text-muted-foreground">
    <span
      className={cn('rounded-full size-1', {
        'bg-green-400': active,
        'bg-red-400': !active
      })}
    />
    {active ? 'Active' : 'Inactive'}
  </Badge>
)

export default StatusBadge

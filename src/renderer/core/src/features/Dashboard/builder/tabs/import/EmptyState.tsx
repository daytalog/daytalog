interface EmptyStateProps {
  message: string
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="mt-2 divide-y divide-white/10 rounded-md border border-white/20">
      <div className="flex items-center justify-between py-4 pl-4 pr-5 min-h-16 text-sm leading-6">
        <div className="flex w-0 flex-1 items-center">
          <div className="ml-4 flex min-w-0 flex-1 justify-center">
            <span className="truncate text-white font-medium">{message}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyState

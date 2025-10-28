import { useEffect, useState, useRef } from 'react'
import { PreviewConsoleMessage } from '@renderer/workers/utils/types'
import { ResizablePanel } from '@components/ui/resizable'
import { Button } from '@components/ui/button'
import { Ban } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@components/ui/tooltip'

type ConsoleLog = {
  id: string
  level: 'log' | 'warn' | 'error' | 'table'
  args: any[]
}

type ConsolePanelProps = {
  currentFileId?: string
}

// Helper to format arguments for log/warn/error
const formatArg = (arg: any) => {
  if (typeof arg === 'string') return arg
  if (Array.isArray(arg)) {
    // If array of objects, let table logic handle it
    if (arg.length > 0 && typeof arg[0] === 'object' && !Array.isArray(arg[0])) {
      return null
    }
    return `[${arg.map(formatArg).join(', ')}]`
  }
  if (typeof arg === 'object' && arg !== null) {
    return <pre className="inline whitespace-pre-wrap">{JSON.stringify(arg, null, 2)}</pre>
  }
  return String(arg)
}

// DevTools-like expandable object/array inspector
const Inspectable = ({ value, depth = 0 }: { value: any; depth?: number }) => {
  const [open, setOpen] = useState(false)
  const isArray = Array.isArray(value)
  const isObject = typeof value === 'object' && value !== null && !isArray

  // Function marker rendering
  if (isObject && value.__isFunction) {
    return (
      <span className="flex items-start">
        <span className="text-blue-200">function()</span>
      </span>
    )
  }
  if (isObject) {
    const keys = Object.keys(value)
    if (keys.length === 0) return <span>{'{}'}</span>
    return (
      <span>
        <span
          className="cursor-pointer select-none text-blue-300"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '▼' : '▶'}
        </span>
        <span className="text-yellow-200">{' {'}</span>
        {open ? (
          <div className="ml-4 flex flex-col">
            {keys.map((k) => {
              const v = value[k]
              const isFunction = v && typeof v === 'object' && v.__isFunction
              return (
                <div key={k} className="flex items-start">
                  <span className="text-green-200 mr-1">
                    {k}
                    {isFunction ? <span className="text-white">()</span> : null}
                  </span>
                  <span className="mr-1">:</span>
                  <Inspectable value={v} depth={depth + 1} />
                </div>
              )
            })}
            <span className="text-yellow-200">{' }'}</span>
          </div>
        ) : (
          <span className="text-gray-400">…{' }'}</span>
        )}
      </span>
    )
  }
  if (isArray) {
    if (value.length === 0) return <span>[]</span>
    // If array of objects, show as expandable
    return (
      <span>
        <span
          className="cursor-pointer select-none text-blue-300"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '▼' : '▶'}
        </span>
        <span className="text-yellow-200">{` [`}</span>
        {open ? (
          <div className="ml-4 flex flex-col">
            {value.map((v: any, i: number) => (
              <div key={i} className="flex items-start">
                <Inspectable value={v} depth={depth + 1} />
                {/*i < value.length - 1 && <span>,</span>*/}
              </div>
            ))}
            <span className="text-yellow-200">]</span>
          </div>
        ) : (
          <span className="text-gray-400">…]</span>
        )}
      </span>
    )
  }
  if (typeof value === 'string') {
    // Only quote if ambiguous
    if (/\s/.test(value) || value === '') {
      return <span className="text-orange-200">"{value}"</span>
    }
    return <span className="text-orange-200">{value}</span>
  }
  if (typeof value === 'number') {
    return <span className="text-purple-200">{value}</span>
  }
  if (typeof value === 'boolean') {
    return <span className="text-purple-400">{String(value)}</span>
  }
  if (value === null) {
    return <span className="text-gray-400">null</span>
  }
  if (value === undefined) {
    return <span className="text-gray-400">undefined</span>
  }
  return <span>{String(value)}</span>
}

const ConsolePanel = ({ currentFileId }: ConsolePanelProps) => {
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const currentFileRef = useRef<string | null>(null)
  const consolePanelRef = useRef<any>(null)
  const [isConsoleOpen, setIsConsoleOpen] = useState(false)

  useEffect(() => {
    const handlePreviewConsole = (event: Event) => {
      console.debug('recieved message in console panel')
      const e = event as CustomEvent<PreviewConsoleMessage>
      const data = e.detail
      setConsoleLogs((prev) => [...prev, data])
    }
    window.addEventListener('preview-console', handlePreviewConsole)
    return () => {
      window.removeEventListener('preview-console', handlePreviewConsole)
    }
  }, [])

  // Clear logs when file changes (using prop)
  useEffect(() => {
    setConsoleLogs([])
    currentFileRef.current = currentFileId || null
  }, [currentFileId])

  return (
    <ResizablePanel
      ref={consolePanelRef}
      minSize={25}
      collapsedSize={4}
      collapsible
      defaultSize={4}
      onExpand={() => setIsConsoleOpen(true)}
      onCollapse={() => setIsConsoleOpen(false)}
      className="flex flex-col p-2 gap-2 bg-[#323639]"
    >
      <div className="flex justify-between items-center bg-transparent text-white">
        <Button
          size="sm"
          variant="outline"
          className="bg-transparent text"
          onClick={() =>
            consolePanelRef.current.isCollapsed()
              ? consolePanelRef.current?.expand()
              : consolePanelRef.current?.collapse()
          }
        >
          {isConsoleOpen ? 'Console ▼' : 'Console ▶'}
        </Button>
        {isConsoleOpen && (
          <Tooltip delayDuration={700}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent text"
                onClick={() => setConsoleLogs([])}
              >
                <Ban />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear Console</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="z-40 h-full w-full max-w-full bg-black bg-opacity-90 text-xs text-white rounded shadow-lg overflow-y-auto overflow-x-auto p-2 mt-2 font-mono [container-type:inline-size]">
        {consoleLogs.length === 0 && <div className="text-gray-400">No console output</div>}
        {consoleLogs.map((log, idx) => {
          if (log.level === 'table') {
            const [data, columns] = log.args
            if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
              const keys = columns || Object.keys(data[0])
              return (
                <div key={idx} className="mb-2">
                  <span className="uppercase mr-2 text-green-300">[table]</span>
                  <div className="w-max min-w-full">
                    <table className="text-xs border-collapse mb-1 bg-black/80 w-full table-auto @container">
                      <thead>
                        <tr>
                          {keys.map((key: string) => (
                            <th
                              key={key}
                              className="border px-1 py-0.5 text-white bg-gray-700 max-w-[200px] truncate"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row: any, i: number) => (
                          <tr key={i}>
                            {keys.map((key: string) => (
                              <td
                                key={key}
                                className="border px-1 py-0.5 text-white max-w-[200px] truncate"
                              >
                                {String(row[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            }
            // Fallback for non-array data
            return (
              <div key={idx} className="text-green-300">
                <span className="uppercase mr-2">[table]</span>
                {JSON.stringify(data)}
              </div>
            )
          }
          return (
            <div
              key={idx}
              className={
                (log.level === 'error'
                  ? 'text-red-400'
                  : log.level === 'warn'
                    ? 'text-yellow-300'
                    : 'text-white') + ' flex flex-wrap items-start'
              }
            >
              <span className="uppercase mr-2">[{log.level}]</span>
              {log.args.map((arg, i) => {
                if (arg === null) return null // skip, table logic will handle
                return (
                  <span key={i} className="mr-2">
                    <Inspectable value={arg} />
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>
    </ResizablePanel>
  )
}

export default ConsolePanel

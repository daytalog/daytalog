import '../../assets/main.css'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Button } from '@components/ui/button'
import { ScrollArea } from '@components/ui/scroll-area'
import { Copy, Check } from 'lucide-react'

function ErrorPage() {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Get error message from window API
    const getErrorMessage = async () => {
      try {
        const message = await window.errorapi?.getErrorMessage?.()
        if (message) {
          setErrorMessage(message)
        }
      } catch (error) {
        console.error('Failed to get error message:', error)
        setErrorMessage('Failed to load error details')
      }
    }

    // Listen for error message updates
    const handleErrorMessageUpdate = (message: string) => {
      setErrorMessage(message)
    }

    getErrorMessage()

    const unsubscribe = window.errorapi?.onErrorMessageUpdated?.(handleErrorMessageUpdate)

    return () => {
      if (unsubscribe) {
        window.errorapi?.offErrorMessageUpdated?.(unsubscribe)
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(errorMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy error message:', error)
    }
  }

  return (
    <div
      className="h-[600px] p-6 flex flex-col dark:border-[0.5px] dark:border-muted-foreground overflow-hidden dark:rounded-b-xl dark:rounded-t-[11px]"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <h1 className="text-2xl font-semibold text-center mb-4">Invalid .dayta files</h1>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Details</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!errorMessage}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
        </div>

        <ScrollArea
          className="h-48 border border-foreground/30 rounded-md px-4"
          type="always"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
            {errorMessage || 'No error message available'}
          </pre>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground mb-2">Common causes:</p>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-outside pl-5">
          <li>
            <strong>Issue with schema:</strong> .dayta files must follow the .dayta schema. Check
            schema documentation for more details.
          </li>
          <li>
            <strong>Custom schema violations:</strong> Custom schema fields not matching your custom
            schema declaration. Check your custom schema declarations in project settings
            (config.yaml).
          </li>
          <li>
            <strong>YAML structure errors:</strong> Invalid indentation, missing colons, or
            malformed YAML syntax. If editing manually, ensure the file follows proper YAML
            formatting.
          </li>
          <li>
            <strong>Encoding issues:</strong> Files with unsupported character encodings
          </li>
        </ul>
        <div className="text-center pt-6">
          <p className="text-xs text-muted-foreground">
            If you continue experiencing issues after checking these common causes, please report a
            bug.
          </p>
        </div>
      </div>
    </div>
  )
}

const applyDark = () => {
  document.documentElement.classList.toggle(
    'dark',
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}
applyDark()
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyDark)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorPage />
  </React.StrictMode>
)

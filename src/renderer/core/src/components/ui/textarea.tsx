import * as React from 'react'

import { cn } from '@components/lib/utils'

function Textarea({
  className,
  value,
  onChange,
  onKeyDown,
  ...props
}: React.ComponentProps<'textarea'>) {
  const handleInternalKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Cmd+A (or Ctrl+A) to select all text
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
      e.currentTarget.select()
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
      const target = e.currentTarget
      const start = target.selectionStart ?? 0
      const end = target.selectionEnd ?? 0
      const value = target.value
      const selected = value.slice(start, end)
      window.clipboardApi.writeText(selected)
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
      const text = window.clipboardApi.readText()
      const target = e.currentTarget
      const start = target.selectionStart ?? 0
      const end = target.selectionEnd ?? 0
      const value = target.value
      const newValue = value.slice(0, start) + text + value.slice(end)
      e.preventDefault()
      if (onChange) {
        onChange({
          ...e,
          currentTarget: { ...target, value: newValue },
          target: { ...target, value: newValue }
        } as React.ChangeEvent<HTMLTextAreaElement>)
      } else {
        target.value = newValue
      }
    }
  }

  const handleKeyDown = (e) => {
    handleInternalKeyDown(e)

    if (onKeyDown) {
      onKeyDown(e)
    }
  }
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}

export { Textarea }

import * as React from 'react'

import { cn } from '@components/lib/utils'

function Input({
  className,
  type,
  value,
  onChange,
  onKeyDown,
  ...props
}: React.ComponentProps<'input'>) {
  const handleInternalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        } as React.ChangeEvent<HTMLInputElement>)
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
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-1',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}

export { Input }

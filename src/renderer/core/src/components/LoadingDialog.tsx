import { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogHeader
} from '@components/ui/alert-dialog'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { Loader2 } from 'lucide-react'
import { cn } from '@components/lib/utils'

interface LoadingDialogProps {
  open: boolean
}

const LoadingDialog = ({ open }: LoadingDialogProps) => {
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (!open) {
      setShowOverlay(false)
      return
    }

    // Start with transparent overlay, show background after 500ms
    const timer = setTimeout(() => {
      setShowOverlay(true)
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [open])

  return (
    <AlertDialog open={open}>
      <AlertDialogPortal>
        <AlertDialogOverlay
          className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50',
            showOverlay ? 'bg-black/50' : 'bg-transparent'
          )}
        />
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          className={cn(
            'bg-transparent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border-none p-6 duration-200 sm:max-w-lg flex justify-center'
          )}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="sr-only">Loading...</AlertDialogTitle>
            <AlertDialogDescription className="flex gap-8 items-center">
              {showOverlay && <Loader2 className="animate-spin" />}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialog>
  )
}

export default LoadingDialog

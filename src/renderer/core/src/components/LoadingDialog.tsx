import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogHeader
} from '@components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'

interface LoadingDialogProps {
  open: boolean
}

const LoadingDialog = ({ open }: LoadingDialogProps) => {
  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent className="border-none bg-transparent flex justify-center">
          <AlertDialogHeader>
            <AlertDialogTitle className="sr-only">Loading...</AlertDialogTitle>
            <AlertDialogDescription className="flex gap-8 items-center">
              <Loader2 className="animate-spin" />
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default LoadingDialog

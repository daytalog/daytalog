import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'
import type { LogType } from 'daytalog'

type SelectedContextType = {
  selection?: LogType[]
  setSelection: Dispatch<SetStateAction<LogType[] | undefined>>
}

const SelectedContext = createContext<SelectedContextType | undefined>(undefined)

export const SelectedProvider = ({ children }: { children: ReactNode }) => {
  const [selection, setSelection] = useState<LogType[]>()

  return (
    <SelectedContext.Provider value={{ selection, setSelection }}>
      {children}
    </SelectedContext.Provider>
  )
}

export const useSelectedContext = () => {
  const context = useContext(SelectedContext)
  if (!context) {
    throw new Error('useSelectedContext must be used within a SelectedProvider')
  }
  return context
}

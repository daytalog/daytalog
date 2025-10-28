import React, { createContext, useContext, useState, useCallback } from 'react'
import type { CameraMetadataEnumType } from 'daytalog'
import { CameraMetadataEnumZod } from 'daytalog'

interface FieldSelectionContextType {
  unselectableMetaFields: CameraMetadataEnumType[]
  updateFieldSelection: (usedFields: string[]) => void
}

const FieldSelectionContext = createContext<FieldSelectionContextType | undefined>(undefined)

export const useFieldSelection = () => {
  const context = useContext(FieldSelectionContext)
  if (context === undefined) {
    throw new Error('useFieldSelection must be used within a FieldSelectionProvider')
  }
  return context
}

interface FieldSelectionProviderProps {
  children: React.ReactNode
}

export const FieldSelectionProvider: React.FC<FieldSelectionProviderProps> = ({ children }) => {
  const [unselectableMetaFields, setUnselectableMetaFields] = useState<CameraMetadataEnumType[]>([])

  const updateFieldSelection = useCallback((usedFields: string[]) => {
    // Simply mark metadata types as unselectable if they're already being used
    const unselectable = CameraMetadataEnumZod.options.filter((option) =>
      usedFields.includes(option)
    )
    setUnselectableMetaFields(unselectable)
  }, [])

  const value: FieldSelectionContextType = {
    unselectableMetaFields,
    updateFieldSelection
  }

  return <FieldSelectionContext.Provider value={value}>{children}</FieldSelectionContext.Provider>
}

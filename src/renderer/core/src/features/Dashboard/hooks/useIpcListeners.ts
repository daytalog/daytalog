// hooks/useIpcListeners.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ProjectType } from '@shared/core/project-types'
import type { LogType } from 'daytalog'

export function useIpcListeners() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleProjectLoaded = (project: ProjectType) => {
      // Update the "project" query data
      queryClient.setQueryData(['project'], project)
    }

    const projectHandler = window.mainApi.onProjectLoaded(handleProjectLoaded)

    return () => {
      window.mainApi.offProjectLoaded(projectHandler)
    }
  }, [queryClient])

  useEffect(() => {
    const handleDaytalogsLoaded = (daytalogs: LogType[]) => {
      // Update the "daytalogs" query data
      queryClient.setQueryData(['daytalogs'], daytalogs)
    }

    const daytalogsHandler = window.mainApi.onDaytalogsLoaded(handleDaytalogsLoaded)

    return () => {
      window.mainApi.offDaytalogsLoaded(daytalogsHandler)
    }
  }, [queryClient])
}

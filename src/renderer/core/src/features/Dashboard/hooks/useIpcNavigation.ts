import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useIpcNavigation() {
  const navigate = useNavigate()

  useEffect(() => {
    const offBuilder = window.mainApi.openBuilder((_event, id: string | null) =>
      id ? navigate(`/builder/${id}`) : navigate('/builder')
    )
    const offSettings = window.mainApi.openSettings(() => navigate('/settings'))
    const offNewProject = window.mainApi.openNewProject(() => navigate('/new-project'))

    return () => {
      offBuilder?.()
      offSettings?.()
      offNewProject?.()
    }
  }, [])
}

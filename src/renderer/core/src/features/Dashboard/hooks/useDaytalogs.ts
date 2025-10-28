import { useQuery } from '@tanstack/react-query'
import type { LogType } from 'daytalog'

async function fetchDaytalogs() {
  return window.mainApi.getDaytalogs() // your existing IPC call
}

export function useDaytalogs() {
  return useQuery<LogType[]>({
    queryKey: ['daytalogs'],
    queryFn: fetchDaytalogs,
    initialData: []
  })
}

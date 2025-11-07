import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { CheckPathsResult, PathType } from '@shared/core/shared-types'

async function fetchInitialCheckedPaths(paths: PathType) {
  return await window.mainApi.checkDefaultPaths(paths)
}

export function useAccessablePaths(
  paths: PathType,
  options?: Omit<
    UseQueryOptions<CheckPathsResult, Error, CheckPathsResult, [string]>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<CheckPathsResult, Error, CheckPathsResult, [string]>({
    queryKey: ['defaultPaths'],
    queryFn: () => fetchInitialCheckedPaths(paths),
    refetchInterval: 5000,
    ...options
  })
}

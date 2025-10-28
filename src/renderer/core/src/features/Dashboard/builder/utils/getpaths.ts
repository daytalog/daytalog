import type { ProjectRootType } from '@shared/core/project-types'
import replaceTags, { Tags } from '@shared/core/utils/formatDynamicString'

export const getPaths = (project: ProjectRootType, tags: Tags, id?: string) => {
  const mergePaths = (
    activePaths: string[] | null | undefined,
    defaultPaths: string[] | undefined
  ) => {
    const formattedDefaults = (defaultPaths || []).map((path) => replaceTags(path, tags))
    const merged = [...(activePaths || []), ...formattedDefaults]
    return Array.from(new Set(merged.filter(Boolean)))
  }

  const isActive = project.activeLog?.id === id

  const ocf = isActive
    ? mergePaths(project.activeLog?.paths?.ocf, project.default_ocf_paths)
    : (project.default_ocf_paths || []).map((path) => replaceTags(path, tags))

  const sound = isActive
    ? mergePaths(project.activeLog?.paths?.sound, project.default_sound_paths)
    : (project.default_sound_paths || []).map((path) => replaceTags(path, tags))

  const proxy = isActive
    ? project.activeLog?.paths?.proxy ||
      (project.default_proxy_path ? replaceTags(project.default_proxy_path, tags) : null)
    : project.default_proxy_path
      ? replaceTags(project.default_proxy_path, tags)
      : null

  return {
    ocf: ocf.length ? ocf : null,
    sound: sound.length ? sound : null,
    proxy
  }
}

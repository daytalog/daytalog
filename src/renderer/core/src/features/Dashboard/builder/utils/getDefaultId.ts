import replaceTags, { Tags } from '@shared/core/utils/formatDynamicString'

export const getDefaultId = (template: string, tags: Tags): string => {
  return replaceTags(template, tags)
}

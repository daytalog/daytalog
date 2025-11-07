import { watch } from 'fsevents' // npm i fsevents (macOS-only)

export function makeDirtyFlag(watchPath: string) {
  let dirty = false
  const stop = watch(watchPath, () => {
    dirty = true
  })
  // fsevents v2 starts watching immediately

  return {
    isDirty: () => dirty,
    clear: () => {
      dirty = false
    },
    stop: () => stop()
  }
}

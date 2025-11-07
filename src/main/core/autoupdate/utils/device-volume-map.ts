import { spawnSync } from 'child_process'

// --- Build device→volume map ---
export function getDeviceVolumeMap() {
  // We use diskutil because there's no exposed Apple API to get the volume map
  const out = spawnSync('bash', [
    '-c',
    'diskutil list -plist | plutil -convert json -o - -'
  ]).stdout.toString()

  const parsed = JSON.parse(out)
  const disks = parsed.AllDisksAndPartitions || []

  // 🔹 Collect only user-visible APFS volumes first
  const userVolumes = new Map()
  for (const d of disks) {
    for (const v of d.APFSVolumes || []) {
      if (!v.OSInternal && v.MountPoint && v.VolumeName) {
        userVolumes.set(v.DeviceIdentifier, v.VolumeName)
      }
    }
  }

  // 1) Build slice -> whole-disk map
  const sliceToWhole = {}
  for (const d of disks) {
    if (Array.isArray(d.Partitions)) {
      for (const p of d.Partitions) {
        if (p.DeviceIdentifier) sliceToWhole[p.DeviceIdentifier] = d.DeviceIdentifier
      }
    }
  }

  // 2) Build result
  const result = {}
  const add = (whole, name) => {
    if (!whole || !name) return
    if (!result[whole]) result[whole] = []
    if (!result[whole].includes(name)) result[whole].push(name)
  }

  // 3) Map APFS containers to physical disks using only user-visible volumes
  for (const d of disks) {
    if (d.APFSPhysicalStores) {
      const volNames = (d.APFSVolumes || [])
        .filter((v) => userVolumes.has(v.DeviceIdentifier))
        .map((v) => v.VolumeName)

      if (volNames.length === 0) continue

      for (const store of d.APFSPhysicalStores) {
        const slice = store?.DeviceIdentifier
        if (!slice) continue
        let whole = sliceToWhole[slice]
        if (!whole) {
          const m = /^([a-z]+[0-9]+)/i.exec(slice)
          whole = m ? m[1] : null
        }
        for (const name of volNames) add(whole, name)
      }
    }
  }
  for (const k of Object.keys(result)) {
    result[k] = result[k].filter(
      (name: string) => !/^(Preboot|Recovery|VM|Update|Hardware|xART|iSCPreboot|Data)$/i.test(name)
    )
    if (!result[k].length) delete result[k]
  }

  return result
}

import React, { useMemo, useCallback, useEffect, useState } from 'react'
import DataTable from './DataTable'
import type { LogType, Log } from 'daytalog'
import { LogSum } from './types'
import { Columns } from './Column'
import { useNavigate } from 'react-router-dom'
import { createDaytalog } from 'daytalog'
import { ProjectType } from '@shared/core/project-types'

interface TableProps {
  logs: LogType[]
  project: ProjectType
}

const TableConstructor: React.FC<TableProps> = React.memo(({ logs, project }) => {
  const navigate = useNavigate()
  const [logAll, setLogAll] = useState<Log[]>([])

  useEffect(() => {
    let isMounted = true
    async function fetchLogs() {
      try {
        if (!project || !logs) {
          setLogAll([])
          return
        }
        const daytalog = await createDaytalog({ logs, project })
        if (isMounted) setLogAll(daytalog.logAll)
      } catch (e) {
        console.error(e)
      }
    }
    fetchLogs()
    return () => {
      isMounted = false
    }
  }, [logs, project])

  const handleDelete = useCallback(
    async (log: LogType) => {
      try {
        await window.mainApi.deleteDaytalog(log)
      } catch (error) {
        console.error(error)
      }
    },
    [logs]
  )

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`/builder/${id}`)
    },
    [navigate]
  )

  const handlers = useMemo(() => ({ handleDelete, handleEdit }), [handleDelete, handleEdit])

  const DaytalogRows = (logAll: Log[]): LogSum[] => {
    return logAll.map((log) => ({
      id: log.id,
      day: Number(log.day()),
      date: log.date(),
      unit: log.unit ?? '',
      ocfClips: log.ocf.files(),
      ocfSize: log.ocf.sizeAsNumber({ type: 'bytes' }) ?? 0,
      ocfCopies: log.ocf
        .copies()
        .map(
          (c, index) =>
            `${index + 1}: ${c.volumes}${c.count[0] !== c.count[1] ? `[${c.count[0]} of ${c.count[1]} clips] 🔴` : ''}`
        )
        .join('\n'),
      ocfDuration: log.ocf.durationTC(),
      proxyClips: log.proxy.files(),
      proxySize: log.proxy.sizeAsNumber({ type: 'bytes' }) ?? 0,
      soundClips: log.sound.files(),
      soundSize: log.sound.sizeAsNumber({ type: 'bytes' }) ?? 0,
      soundCopies: log.sound
        .copies()
        .map(
          (c, index) =>
            `${index + 1}: ${c.volumes.join(', ')}${c.count[0] !== c.count[1] ? `[${c.count[0]} of ${c.count[1]} clips] 🔴` : ''}`
        )
        .join('\n'),
      reels: log.ocf.reels({ mergeRanges: true }),
      raw: logs.find((l) => l.id === log.id)!
    }))
  }

  const columns = useMemo(() => Columns(handlers), [handlers])

  return columns && logAll.length && <DataTable columns={columns} data={DaytalogRows(logAll)} />
})

export default TableConstructor

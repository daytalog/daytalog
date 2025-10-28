import { useFormContext } from 'react-hook-form'
import type { formSchemaType } from '../types'
import WarningTooltip from '@components/WarningTooltip'
import { useEffect, useState } from 'react'

const WarningDefaults = () => {
  const [warning, setWarning] = useState<boolean>(false)
  const {
    formState: { errors }
  } = useFormContext<formSchemaType>()

  useEffect(() => {
    if (errors.project_logid_template || errors.global_logid_template) {
      setWarning(true)
    } else {
      setWarning(false)
    }
  }, [errors.project_logid_template, errors.global_logid_template])

  if (warning) {
    return <WarningTooltip text="Default Log Name missing" />
  }

  return
}

export default WarningDefaults

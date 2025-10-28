import { ReactElement } from 'react'
import CustomContent from './CustomContent'

const CustomTab = ({ scope }): ReactElement => {
  /*return (
    <div className="flex flex-col justify-center items-center gap-10 py-20">
      You can set custom schemas in config.yaml
      <Button
        onClick={() =>
          window.externalApi.openExternal('https://docs.daytalog.com/config/custom-schemas')
        }
      >
        Learn More
      </Button>
    </div>
  )*/
  return (
    <div className="mt-8">
      {scope === 'project' ? <CustomContent key="local_fields" scope={scope} /> : null}
      {scope === 'global' ? <CustomContent key="global_fields" scope={scope} /> : null}
    </div>
  )
}

export default CustomTab

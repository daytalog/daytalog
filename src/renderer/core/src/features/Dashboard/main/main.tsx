import Table from './table/Table'
import { Toaster } from '@components/ui/sonner'
import { SelectedProvider } from './SelectedContext'
import SendButton from './nav/SendButton'
import ExportButton from './nav/ExportButton'
import BuilderButton from './nav/BuilderButton'
import SettingsButton from './nav/SettingsButton'
import NewProjectButton from './nav/NewProjectButton'
import { useProject } from '../hooks/useProject'
import { useIpcListeners } from '../hooks/useIpcListeners'
import { MessageBox } from '@adapters'
import { OnlineStatusProvider } from '@renderer/utils/OnlineStatus'
import daytalogo from '../../../assets/DAYTALOGO.svg'

function Main() {
  useIpcListeners()

  const { data: project } = useProject()

  return (
    <div>
      <OnlineStatusProvider>
        <SelectedProvider>
          <div className="container flex flex-col mx-auto w-full sm:px-6 lg:px-8">
            <div className="fixed left-0 right-0 z-10 container mx-auto pt-4 pb-8 sm:px-6 lg:px-8 bg-background/40 backdrop-blur-sm">
              <div className="flex h-5 justify-center items-center pb-1">
                <h2 className="text-1xl font-semibold leading-none tracking-tight">
                  {project?.project_name}
                </h2>
              </div>
              <div className="flex justify-between items-end pt-5 pb-4">
                <div className="flex gap-4 items-center">
                  <img src={daytalogo} alt="Daytalog" width={104} height={20} />
                </div>
                <div className="flex gap-4">
                  <SendButton />
                  <ExportButton />
                  <BuilderButton />
                  <SettingsButton />
                </div>
              </div>
            </div>
            <div className="grow mb-20 mt-36">
              <Table />
              <NewProjectButton />
            </div>
            <MessageBox fullWidth />
          </div>
          <Toaster />
        </SelectedProvider>
      </OnlineStatusProvider>
    </div>
  )
}

export default Main

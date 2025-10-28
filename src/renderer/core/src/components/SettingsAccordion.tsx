import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@components/ui/accordion'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent
} from '@components/ui/dropdown-menu'
import WarningTooltip from '@components/WarningTooltip'
import StatusBadge from '@components/StatusBadge'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
interface SettingsAccordionProps {
  collapse: boolean
  children: React.ReactNode
}

export const SettingsAccordion = ({ collapse, children }: SettingsAccordionProps) => {
  return (
    <Accordion type="single" collapsible className={collapse ? '' : 'border rounded-md'}>
      {children}
    </Accordion>
  )
}

interface SettingAccordionItemProps {
  value: string
  children: React.ReactNode
}
export const SettingsAccordionItem = ({ value, children }: SettingAccordionItemProps) => {
  return <AccordionItem value={value}>{children}</AccordionItem>
}

interface SettingsAccordionTriggerProps {
  label: string
  warning?: string
  active: boolean
  order?: number
  children: React.ReactNode
}
export const SettingsAccordionTrigger = ({
  label,
  warning,
  active,
  order,
  children
}: SettingsAccordionTriggerProps) => {
  return (
    <>
      <AccordionTrigger>
        <span className="flex gap-2 items-center">
          {label}
          {warning && <WarningTooltip text={warning} />}
        </span>
      </AccordionTrigger>
      <div className="absolute right-10 top-2 flex items-center">
        {order && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-2 text-muted-foreground mr-2">
                  Priority: {order}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  The priority of the schema. If two schemas have the same type, the one with the
                  higher priority will be used.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <StatusBadge active={active} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>{children}</DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

export const SettingsAccordionContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <AccordionContent className="grid grid-cols-[130px_minmax(0,1fr)] m-3 p-8 gap-x-4 gap-y-2 bg-background border rounded">
      {children}
    </AccordionContent>
  )
}

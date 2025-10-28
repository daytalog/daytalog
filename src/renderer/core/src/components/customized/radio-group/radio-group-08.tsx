import * as RadioGroup from '@radix-ui/react-radio-group'
import { cn } from '@components/lib/utils'

export type RadioOption = {
  value: string
  label: string
  desc?: string
}

interface RadioCardsProps {
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  className?: string
}

const RadioCards = ({
  options,
  value,
  defaultValue,
  onValueChange,
  className
}: RadioCardsProps) => {
  return (
    <RadioGroup.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className={cn('max-w-md w-full grid grid-cols-2 gap-4', className)}
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            'relative flex gap-2 group ring-[1px] ring-border rounded py-2 px-3 text-start',
            'data-[state=checked]:ring-2 data-[state=checked]:ring-blue-400'
          )}
        >
          <div>
            <span className="tracking-tight">{option.label}</span>
            {option.desc && <p className="text-[10px] text-muted-foreground">{option.desc}</p>}
          </div>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )
}

export default RadioCards

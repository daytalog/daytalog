import { Label } from '@components/ui/label'
import { ReactNode } from 'react'

interface FormRowProps {
  name?: string
  label: string
  description?: string
  descriptionTag?: string | string[]
  children: ReactNode
}

const FormRow: React.FC<FormRowProps> = ({
  name,
  label,
  description,
  descriptionTag,
  children
}) => {
  return (
    <div className="px-4 py-4 sm:px-0">
      <div className="relative">
        <Label htmlFor={name} className="text-base">
          {label}
        </Label>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="mt-2">{children}</div>
          <p className="text-xs italic text-muted-foreground">
            {Array.isArray(descriptionTag) ? (
              descriptionTag.map((tag, index) => (
                <span key={index} className="block">
                  {tag}
                </span>
              ))
            ) : (
              <span>{descriptionTag}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FormRow

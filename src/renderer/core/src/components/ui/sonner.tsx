import { Toaster as Sonner, ToasterProps } from 'sonner'
import errorIcon from '../../assets/error_icon.png'
import successIcon from '../../assets/success_icon.png'
import infoIcon from '../../assets/info_icon.png'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      closeButton
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)'
        } as React.CSSProperties
      }
      icons={{
        error: <img src={errorIcon} />,
        success: <img src={successIcon} />,
        info: <img src={infoIcon} />
      }}
      {...props}
    />
  )
}

export { Toaster }

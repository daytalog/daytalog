import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@components/ui/card'

interface ContentCardProps {
  title: string
  desc: string
  children: React.ReactNode
}

const ContentCard = ({ title, desc, children }: ContentCardProps) => {
  return (
    <Card className="min-h-74.5">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default ContentCard

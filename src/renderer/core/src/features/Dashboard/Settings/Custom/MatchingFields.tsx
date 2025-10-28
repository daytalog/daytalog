import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { Badge } from '@components/ui/badge'
import { useFormContext, useWatch } from 'react-hook-form'

const MatchingFields = ({ showCol }) => {
  const { control } = useFormContext()
  const sync = useWatch({ name: 'sync' })
  return (
    <>
      <tr
        className={`h-14 min-h-14 w-full border-b border-border/20 hover:bg-muted/30 transition-colors ${sync === 'tc' && 'hidden'}`}
      >
        <td className="px-3 py-4 align-top">
          <Badge variant="outline" className="text-muted-foreground">
            clip
          </Badge>
        </td>
        <td className="pl-6 py-4 align-top text-muted-foreground">clip</td>
        <td className="px-3 py-3 align-top">
          {showCol && (
            <FormField
              control={control}
              name={`clip_col`}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel hidden>CSV Column Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Column" />
                  </FormControl>
                  <FormMessage className="pb-5" />
                </FormItem>
              )}
            />
          )}
        </td>
        <td className="px-3 py-3 align-top w-12">
          <div className="w-6" />
        </td>
      </tr>
      <tr
        className={`h-14 min-h-14 border-b border-border/20 hover:bg-muted/30 transition-colors ${sync === 'clip' && 'hidden'}`}
      >
        <td className="px-3 py-4 align-top">
          <Badge variant="outline" className="text-muted-foreground">
            tc_start
          </Badge>
        </td>
        <td className="pl-6 py-4 align-top text-muted-foreground">tc_start</td>
        <td className="px-3 py-3 align-top">
          {showCol && (
            <FormField
              control={control}
              name={`tc_start_col`}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel hidden>CSV Column Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Column" />
                  </FormControl>
                  <FormMessage className="pb-5" />
                </FormItem>
              )}
            />
          )}
        </td>
        <td className="px-3 py-3 align-top w-12">
          <div className="w-6" />
        </td>
      </tr>
      <tr
        className={`h-14 min-h-14 border-b border-border/20 hover:bg-muted/30 transition-colors ${sync === 'clip' && 'hidden'}`}
      >
        <td className="px-3 py-4 align-top">
          <Badge variant="outline" className="text-muted-foreground">
            tc_end
          </Badge>
        </td>
        <td className="pl-6 py-4 align-top text-muted-foreground">tc_end</td>
        <td className="px-3 py-3 align-top">
          {showCol && (
            <FormField
              control={control}
              name={`tc_end_col`}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel hidden>CSV Column Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Column" />
                  </FormControl>
                  <FormMessage className="pb-5" />
                </FormItem>
              )}
            />
          )}
        </td>
        <td className="px-3 py-3 align-top w-12">
          <div className="w-6" />
        </td>
      </tr>
    </>
  )
}

export default MatchingFields

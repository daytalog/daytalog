import * as z from 'zod'
import { LogZod, OCFZod, SoundZod, ProxyZod } from 'daytalog'

function makeNullableExcept<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  keysToExclude: (keyof T)[]
) {
  const newShape = Object.fromEntries(
    Object.entries(schema.shape).map(([key, propSchema]) => [
      key,
      keysToExclude.includes(key as keyof T) ? propSchema : (propSchema as z.ZodTypeAny).nullable()
    ])
  )
  return z.object(newShape)
}

export const daytalogFormSchema = z.object({
  id: z.string().min(1).max(50),
  day: z.coerce
    .number({ error: 'Day is required' })
    .int()
    .gte(1, { message: 'Day must be greater than or equal to 1' })
    .lte(999, { message: 'Day must be below 999' }),
  date: LogZod.shape.date,
  unit: LogZod.shape.unit.nullable(),
  ocf: makeNullableExcept(OCFZod, ['clips']),
  sound: makeNullableExcept(SoundZod, ['clips']),
  proxy: makeNullableExcept(ProxyZod, ['clips']),
  custom: LogZod.shape.custom
})
export type daytalogFormType = z.infer<typeof daytalogFormSchema>

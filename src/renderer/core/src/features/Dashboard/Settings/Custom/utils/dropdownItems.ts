import { fieldEnumZod, delimitersZod } from 'daytalog'

export const BasicDropdownItems = fieldEnumZod.options.map((type) => ({
  value: type,
  label: type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) // Format the label
}))

const delimiterLabels: { [key: string]: string } = {
  ',': 'Comma',
  ';': 'Semicolon',
  '|': 'Pipe',
  ':': 'Colon',
  '=': 'Equals Sign'
}

export const delimiterDropdownItems = delimitersZod.options.map((option) => ({
  value: option,
  label: delimiterLabels[option]
}))

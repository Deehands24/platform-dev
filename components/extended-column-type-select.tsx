"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColumnType } from "@/lib/types"

interface ExtendedColumnTypeSelectProps {
  value: string
  onValueChange: (value: string) => void
  id?: string
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function ExtendedColumnTypeSelectComponent({
  value,
  onValueChange,
  id,
  className,
  placeholder = "Select column type",
  disabled = false,
}: ExtendedColumnTypeSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ColumnType.Text.toString()}>Text</SelectItem>
        <SelectItem value={ColumnType.Number.toString()}>Number</SelectItem>
        <SelectItem value={ColumnType.Boolean.toString()}>Boolean</SelectItem>
        <SelectItem value={ColumnType.Date.toString()}>Date</SelectItem>
        <SelectItem value={ColumnType.Select.toString()}>Select</SelectItem>
        <SelectItem value={ColumnType.Reference.toString()}>Reference</SelectItem>
        <SelectItem value={ColumnType.File.toString()}>File</SelectItem>
        <SelectItem value="6">Email</SelectItem>
        <SelectItem value="7">Phone</SelectItem>
        <SelectItem value="8">URL</SelectItem>
        <SelectItem value="9">JSON</SelectItem>
        <SelectItem value="10">Currency</SelectItem>
        <SelectItem value="11">Percentage</SelectItem>
        <SelectItem value="12">Password</SelectItem>
        <SelectItem value="13">Color</SelectItem>
        <SelectItem value="14">Rating</SelectItem>
      </SelectContent>
    </Select>
  )
}

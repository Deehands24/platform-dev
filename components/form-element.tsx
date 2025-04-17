"use client"

import { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { ElementType, type FormElement } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CalendarIcon, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface FormElementProps {
  element: FormElement
  isSelected: boolean
  onSelect: () => void
  index: number
  moveElement: (dragIndex: number, hoverIndex: number) => void
}

interface DragItem {
  index: number
  id: number
  type: string
}

export default function FormElementComponent({ element, isSelected, onSelect, index, moveElement }: FormElementProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | null }>({
    accept: "canvas-element",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveElement(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: "canvas-element",
    item: () => {
      return { id: element.elementId, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  const renderElement = () => {
    switch (element.type) {
      case ElementType.TextBox:
        return (
          <div className="space-y-2">
            <Label htmlFor={`element-${element.elementId}`}>{element.label}</Label>
            <Input
              id={`element-${element.elementId}`}
              placeholder={element.placeholder}
              defaultValue={element.defaultValue}
              disabled={!element.isEnabled}
              type={element.fieldType || "text"}
              maxLength={element.maxLength || undefined}
            />
          </div>
        )

      case ElementType.ComboBox:
        return (
          <div className="space-y-2">
            <Label htmlFor={`element-${element.elementId}`}>{element.label}</Label>
            <Select disabled={!element.isEnabled}>
              <SelectTrigger id={`element-${element.elementId}`}>
                <SelectValue placeholder={element.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder">Select an option...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case ElementType.DatePicker:
        return (
          <div className="space-y-2">
            <Label htmlFor={`element-${element.elementId}`}>{element.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={`element-${element.elementId}`}
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !element.defaultValue && "text-muted-foreground",
                  )}
                  disabled={!element.isEnabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {element.defaultValue
                    ? format(new Date(element.defaultValue), element.dateFormat || "PPP")
                    : element.placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar />
              </PopoverContent>
            </Popover>
          </div>
        )

      case ElementType.CheckBox:
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`element-${element.elementId}`}
              disabled={!element.isEnabled}
              defaultChecked={element.defaultValue === (element.trueValue || "true")}
            />
            <Label htmlFor={`element-${element.elementId}`}>{element.label}</Label>
          </div>
        )

      default:
        return null
    }
  }

  // Instead of returning null, we'll render the element but with a visual indication that it's hidden
  const isHidden = !element.isVisible

  return (
    <div
      ref={preview}
      className={`p-4 border rounded-md relative ${isSelected ? "ring-2 ring-primary" : ""} ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${isHidden ? "opacity-40 border-dashed border-muted-foreground" : ""}`}
      onClick={onSelect}
      data-handler-id={handlerId}
    >
      {isHidden && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 pointer-events-none">
          <p className="text-sm text-muted-foreground">Hidden Element</p>
        </div>
      )}
      <div className="flex items-start">
        <div className="flex-1">{renderElement()}</div>
        <div ref={ref} className="cursor-move p-1 hover:bg-muted rounded-md ml-2" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

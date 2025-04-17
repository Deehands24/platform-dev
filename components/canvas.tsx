"use client"

import { useDrop } from "react-dnd"
import type { ElementType, Form, FormElement } from "@/lib/types"
import FormElementComponent from "./form-element"

interface CanvasProps {
  form: Form | null
  selectedElement: FormElement | null
  onElementSelect: (element: FormElement) => void
  onElementMove: (dragIndex: number, hoverIndex: number) => void
  addElement: (type: ElementType, index?: number) => void
}

export default function Canvas({ form, selectedElement, onElementSelect, onElementMove, addElement }: CanvasProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ["form-element", "canvas-element"],
    drop: (item: any, monitor) => {
      // If dropping a new element from toolbox
      if (item.type !== undefined && monitor.getItemType() === "form-element") {
        // Add the element at the end or at a specific position
        addElement(item.type)
      }
      return { name: "Canvas" }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }))

  if (!form) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10 p-4">
        <div className="text-center text-muted-foreground">
          <p>No form selected</p>
          <p className="text-sm">Create a new form or load an existing one</p>
        </div>
      </div>
    )
  }

  // Sort elements by order
  const sortedElements = [...form.elements].sort((a, b) => a.order - b.order)

  return (
    <div
      ref={drop}
      className={`flex-1 p-6 overflow-auto ${isOver && canDrop ? "bg-primary/10" : "bg-muted/10"}`}
      data-testid="canvas"
    >
      <div className="max-w-3xl mx-auto bg-background p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-1">{form.name}</h1>
        <p className="text-muted-foreground mb-6">{form.description}</p>

        <div className="space-y-4">
          {sortedElements.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-md text-muted-foreground">
              <p>Drag and drop elements from the toolbox</p>
              <p className="text-sm">or click on an element to add it to the form</p>
            </div>
          ) : (
            sortedElements.map((element, index) => (
              <FormElementComponent
                key={element.elementId}
                element={element}
                isSelected={selectedElement?.elementId === element.elementId}
                onSelect={() => onElementSelect(element)}
                index={index}
                moveElement={onElementMove}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

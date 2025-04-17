"use client"

import type React from "react"
import { useDrag } from "react-dnd"
import { ElementType, type Form, type FormElement } from "@/lib/types"
import { TextCursor, ListFilter, Calendar, CheckSquare, EyeOff } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface ToolboxProps {
  addElement: (type: ElementType) => void
  forms: Form[]
  currentForm: Form | null
  onFormSelect: (form: Form) => void
  onElementSelect: (element: FormElement) => void
  selectedElement: FormElement | null
}

export default function Toolbox({
  addElement,
  forms,
  currentForm,
  onFormSelect,
  onElementSelect,
  selectedElement,
}: ToolboxProps) {
  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col h-full">
      <Accordion type="multiple" defaultValue={["elements", "forms", "formElements"]} className="flex-1 flex flex-col">
        <AccordionItem value="elements" className="border-b">
          <AccordionTrigger className="px-4 py-2">Toolbox</AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-1">
            <div className="space-y-2">
              <ToolboxItem
                type={ElementType.TextBox}
                icon={<TextCursor className="h-4 w-4 mr-2" />}
                label="Text Box"
                onAdd={addElement}
              />
              <ToolboxItem
                type={ElementType.ComboBox}
                icon={<ListFilter className="h-4 w-4 mr-2" />}
                label="Combo Box"
                onAdd={addElement}
              />
              <ToolboxItem
                type={ElementType.DatePicker}
                icon={<Calendar className="h-4 w-4 mr-2" />}
                label="Date Picker"
                onAdd={addElement}
              />
              <ToolboxItem
                type={ElementType.CheckBox}
                icon={<CheckSquare className="h-4 w-4 mr-2" />}
                label="Check Box"
                onAdd={addElement}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="forms" className="border-b">
          <AccordionTrigger className="px-4 py-2">Forms</AccordionTrigger>
          <AccordionContent className="px-0 pb-0 pt-0">
            <ScrollArea className="h-[150px]">
              <div className="px-4 py-2 space-y-1">
                {forms.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No forms available</p>
                ) : (
                  forms.map((form) => (
                    <Button
                      key={form.formId}
                      variant={currentForm?.formId === form.formId ? "default" : "ghost"}
                      className="w-full justify-start text-sm h-8"
                      onClick={() => onFormSelect(form)}
                    >
                      {form.name}
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="formElements" className="border-b flex-1">
          <AccordionTrigger className="px-4 py-2">Form Elements</AccordionTrigger>
          <AccordionContent className="px-0 pb-0 pt-0 flex-1">
            <ScrollArea className="flex-1">
              <div className="px-4 py-2 space-y-1">
                {!currentForm || currentForm.elements.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No elements in this form</p>
                ) : (
                  // Sort elements by order
                  [...currentForm.elements]
                    .sort((a, b) => a.order - b.order)
                    .map((element) => (
                      <Button
                        key={element.elementId}
                        variant={selectedElement?.elementId === element.elementId ? "default" : "ghost"}
                        className="w-full justify-start text-sm h-8 flex items-center"
                        onClick={() => onElementSelect(element)}
                      >
                        <span className="truncate flex-1">{element.label}</span>
                        {!element.isVisible && <EyeOff className="h-3 w-3 ml-1 opacity-50" />}
                      </Button>
                    ))
                )}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

interface ToolboxItemProps {
  type: ElementType
  icon: React.ReactNode
  label: string
  onAdd: (type: ElementType) => void
}

function ToolboxItem({ type, icon, label, onAdd }: ToolboxItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "form-element",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`flex items-center p-2 border rounded-md cursor-move bg-background hover:bg-accent ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      onClick={() => onAdd(type)}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

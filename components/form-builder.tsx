"use client"

import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import MenuBar from "./menu-bar"
import Toolbox from "./toolbox"
import Canvas from "./canvas"
import PropertiesPanel from "./properties-panel"
import FormPreview from "./form-preview"
import {
  ElementType,
  type Form,
  type FormElement,
  type ElementInteractionRule,
  type ComboBoxItemsSource,
} from "@/lib/types"

export default function FormBuilder() {
  const [forms, setForms] = useState<Form[]>([])
  const [currentForm, setCurrentForm] = useState<Form | null>(null)
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(null)
  const [itemsSources, setItemsSources] = useState<ComboBoxItemsSource[]>([])
  const [interactionRules, setInteractionRules] = useState<ElementInteractionRule[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const createNewForm = () => {
    const newForm: Form = {
      formId: Date.now(),
      name: "New Form",
      description: "Form description",
      createdDate: new Date(),
      updatedDate: new Date(),
      isActive: true,
      elements: [],
      interactionRules: [],
    }
    setForms([...forms, newForm])
    setCurrentForm(newForm)
    setInteractionRules([])
    setIsPreviewMode(false)
  }

  const loadFormFromJson = (jsonData: string) => {
    try {
      const formData = JSON.parse(jsonData) as Form

      // Extract interaction rules if they exist
      const extractedRules: ElementInteractionRule[] = []

      // Process elements to ensure they have the right structure
      const processedElements = formData.elements.map((element) => {
        // Extract source and target interaction rules
        if (element.sourceInteractionRules) {
          extractedRules.push(...element.sourceInteractionRules)
        }
        if (element.targetInteractionRules) {
          extractedRules.push(...element.targetInteractionRules)
        }

        // Move type-specific data to the main element if needed
        if (element.elementTypeSpecificData) {
          const specificData = element.elementTypeSpecificData
          return {
            ...element,
            ...specificData,
          }
        }

        return element
      })

      // Create the processed form
      const processedForm: Form = {
        ...formData,
        elements: processedElements,
        interactionRules: extractedRules,
      }

      setForms([...forms, processedForm])
      setCurrentForm(processedForm)
      setInteractionRules(extractedRules)
      setIsPreviewMode(false)

      return true
    } catch (error) {
      console.error("Error loading form from JSON:", error)
      return false
    }
  }

  const exportFormToJson = () => {
    if (!currentForm) return ""

    // Process elements to match the expected JSON structure
    const processedElements = currentForm.elements.map((element) => {
      const {
        elementId,
        formId,
        label,
        placeholder,
        defaultValue,
        order,
        type,
        isRequired,
        isVisible,
        isEnabled,
        validationRules,
      } = element

      // Create the base element
      const processedElement: any = {
        elementId,
        formId,
        label,
        placeholder,
        defaultValue,
        order,
        type,
        isRequired,
        isVisible,
        isEnabled,
        validationRules,
        sourceInteractionRules: [],
        targetInteractionRules: [],
      }

      // Add element type specific data
      let elementTypeSpecificData: any = {}

      switch (type) {
        case ElementType.TextBox:
          elementTypeSpecificData = {
            fieldType: element.fieldType || "text",
            maxLength: element.maxLength,
            regexPattern: element.regexPattern,
          }
          break
        case ElementType.ComboBox:
          elementTypeSpecificData = {
            itemsSourceId: element.itemsSourceId,
            allowMultiSelect: element.allowMultiSelect || false,
          }
          break
        case ElementType.DatePicker:
          elementTypeSpecificData = {
            dateFormat: element.dateFormat || "yyyy-MM-dd",
            minDate: element.minDate,
            maxDate: element.maxDate,
          }
          break
        case ElementType.CheckBox:
          elementTypeSpecificData = {
            trueValue: element.trueValue || "true",
            falseValue: element.falseValue || "false",
          }
          break
      }

      processedElement.elementTypeSpecificData = elementTypeSpecificData

      // Add interaction rules
      interactionRules.forEach((rule) => {
        if (rule.sourceElementId === elementId) {
          processedElement.sourceInteractionRules.push(rule)
        }
        if (rule.targetElementId === elementId) {
          processedElement.targetInteractionRules.push(rule)
        }
      })

      return processedElement
    })

    // Create the final form object
    const exportForm = {
      ...currentForm,
      elements: processedElements,
      interactionRules: interactionRules,
    }

    return JSON.stringify(exportForm, null, 2)
  }

  const addElement = (type: ElementType, index?: number) => {
    if (!currentForm) return

    const newElement: FormElement = {
      elementId: Date.now(),
      formId: currentForm.formId,
      label: `New ${ElementType[type]}`,
      placeholder: `Enter ${ElementType[type]}`,
      defaultValue: "",
      order: typeof index === "number" ? index : currentForm.elements.length,
      type: type,
      isRequired: false,
      isVisible: true,
      isEnabled: true,
      validationRules: [],
    }

    // Add type-specific default properties
    switch (type) {
      case ElementType.TextBox:
        newElement.fieldType = "text"
        break
      case ElementType.ComboBox:
        newElement.allowMultiSelect = false
        break
      case ElementType.DatePicker:
        newElement.dateFormat = "yyyy-MM-dd"
        break
      case ElementType.CheckBox:
        newElement.trueValue = "true"
        newElement.falseValue = "false"
        break
    }

    // If inserting at a specific index, update the order of all elements after it
    let updatedElements = [...currentForm.elements]
    if (typeof index === "number") {
      updatedElements = updatedElements.map((element) => {
        if (element.order >= index) {
          return { ...element, order: element.order + 1 }
        }
        return element
      })
    }

    const updatedForm = {
      ...currentForm,
      elements: [...updatedElements, newElement],
      updatedDate: new Date(),
    }

    setCurrentForm(updatedForm)
    setForms(forms.map((form) => (form.formId === updatedForm.formId ? updatedForm : form)))
    setSelectedElement(newElement)
  }

  const updateElement = (updatedElement: FormElement) => {
    if (!currentForm) return

    const updatedElements = currentForm.elements.map((element) =>
      element.elementId === updatedElement.elementId ? updatedElement : element,
    )

    const updatedForm = {
      ...currentForm,
      elements: updatedElements,
      updatedDate: new Date(),
    }

    setCurrentForm(updatedForm)
    setForms(forms.map((form) => (form.formId === updatedForm.formId ? updatedForm : form)))
    setSelectedElement(updatedElement)
  }

  const handleElementSelect = (element: FormElement) => {
    setSelectedElement(element)
    if (isPreviewMode) {
      setIsPreviewMode(false)
    }
  }

  const handleFormSelect = (form: Form) => {
    setCurrentForm(form)
    setSelectedElement(null)

    // Update interaction rules for the selected form
    const formRules = form.interactionRules || []
    setInteractionRules(formRules)
  }

  const handleElementMove = (dragIndex: number, hoverIndex: number) => {
    if (!currentForm) return

    // Get the sorted elements
    const sortedElements = [...currentForm.elements].sort((a, b) => a.order - b.order)

    // Get the element being dragged
    const dragElement = sortedElements[dragIndex]

    // Create a new array with updated orders
    const updatedElements = currentForm.elements.map((element) => {
      // The element being dragged gets the new order
      if (element.elementId === dragElement.elementId) {
        return { ...element, order: hoverIndex }
      }

      // Elements between the old and new positions need their orders adjusted
      if (dragIndex < hoverIndex) {
        // Moving down: decrease order for elements between old and new positions
        if (element.order > dragIndex && element.order <= hoverIndex) {
          return { ...element, order: element.order - 1 }
        }
      } else {
        // Moving up: increase order for elements between new and old positions
        if (element.order >= hoverIndex && element.order < dragIndex) {
          return { ...element, order: element.order + 1 }
        }
      }

      // Other elements remain unchanged
      return element
    })

    const updatedForm = {
      ...currentForm,
      elements: updatedElements,
      updatedDate: new Date(),
    }

    setCurrentForm(updatedForm)
    setForms(forms.map((form) => (form.formId === updatedForm.formId ? updatedForm : form)))
  }

  const addInteractionRule = (rule: ElementInteractionRule) => {
    setInteractionRules([...interactionRules, rule])
  }

  const updateInteractionRule = (updatedRule: ElementInteractionRule) => {
    setInteractionRules(
      interactionRules.map((rule) => (rule.interactionRuleId === updatedRule.interactionRuleId ? updatedRule : rule)),
    )
  }

  const removeInteractionRule = (ruleId: number) => {
    setInteractionRules(interactionRules.filter((rule) => rule.interactionRuleId !== ruleId))
  }

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
    if (isPreviewMode) {
      // When exiting preview mode, clear selection
      setSelectedElement(null)
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen">
        <MenuBar
          createNewForm={createNewForm}
          currentForm={currentForm}
          itemsSources={itemsSources}
          setItemsSources={setItemsSources}
          loadFormFromJson={loadFormFromJson}
          exportFormToJson={exportFormToJson}
          isPreviewMode={isPreviewMode}
          togglePreviewMode={togglePreviewMode}
        />
        <div className="flex flex-1 overflow-hidden">
          {!isPreviewMode && (
            <Toolbox
              addElement={addElement}
              forms={forms}
              currentForm={currentForm}
              onFormSelect={handleFormSelect}
              onElementSelect={handleElementSelect}
              selectedElement={selectedElement}
            />
          )}
          <div className="flex-1 flex flex-col">
            {isPreviewMode ? (
              <FormPreview form={currentForm} interactionRules={interactionRules} itemsSources={itemsSources} />
            ) : (
              <Canvas
                form={currentForm}
                selectedElement={selectedElement}
                onElementSelect={handleElementSelect}
                onElementMove={handleElementMove}
                addElement={addElement}
              />
            )}
          </div>
          {!isPreviewMode && (
            <PropertiesPanel
              selectedElement={selectedElement}
              updateElement={updateElement}
              itemsSources={itemsSources}
              currentForm={currentForm}
              interactionRules={interactionRules}
              addInteractionRule={addInteractionRule}
              updateInteractionRule={updateInteractionRule}
              removeInteractionRule={removeInteractionRule}
            />
          )}
        </div>
      </div>
    </DndProvider>
  )
}

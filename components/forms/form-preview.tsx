"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  type Form,
  type FormElement,
  ElementType,
  type ElementInteractionRule,
  ConditionOperator,
  ActionType,
  type ComboBoxItemsSource,
} from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface FormPreviewProps {
  form: Form | null
  interactionRules: ElementInteractionRule[]
  itemsSources: ComboBoxItemsSource[]
}

export default function FormPreview({ form, interactionRules, itemsSources }: FormPreviewProps) {
  const [formValues, setFormValues] = useState<Record<number, any>>({})
  const [elementStates, setElementStates] = useState<Record<number, { isVisible: boolean; isEnabled: boolean }>>({})
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})
  const { toast } = useToast()

  // Initialize form values and element states
  useEffect(() => {
    if (!form) return

    const initialValues: Record<number, any> = {}
    const initialStates: Record<number, { isVisible: boolean; isEnabled: boolean }> = {}

    form.elements.forEach((element) => {
      initialValues[element.elementId] = element.defaultValue
      initialStates[element.elementId] = {
        isVisible: element.isVisible,
        isEnabled: element.isEnabled,
      }
    })

    setFormValues(initialValues)
    setElementStates(initialStates)

    // Apply initial interaction rules
    applyInteractionRules(initialValues, initialStates)
  }, [form, interactionRules])

  // Apply interaction rules whenever form values change
  useEffect(() => {
    if (!form) return
    applyInteractionRules(formValues, { ...elementStates })
  }, [formValues, form, interactionRules])

  const applyInteractionRules = (
    values: Record<number, any>,
    states: Record<number, { isVisible: boolean; isEnabled: boolean }>,
  ) => {
    if (!form) return

    let statesChanged = false
    const newStates = { ...states }

    // Process all interaction rules
    interactionRules.forEach((rule) => {
      const sourceElement = form.elements.find((e) => e.elementId === rule.sourceElementId)
      if (!sourceElement) return

      const sourceValue = values[rule.sourceElementId]
      const targetElement = form.elements.find((e) => e.elementId === rule.targetElementId)

      if (!targetElement) return

      // Check if the condition is met
      let conditionMet = false

      // Special handling for checkbox values
      const normalizedSourceValue =
        sourceElement.type === ElementType.CheckBox ? normalizeCheckboxValue(sourceValue, sourceElement) : sourceValue

      const normalizedConditionValue =
        sourceElement.type === ElementType.CheckBox
          ? normalizeCheckboxValue(rule.conditionValue, sourceElement)
          : rule.conditionValue

      switch (rule.operator) {
        case ConditionOperator.Equals:
          conditionMet = normalizedSourceValue === normalizedConditionValue
          break
        case ConditionOperator.NotEquals:
          conditionMet = normalizedSourceValue !== normalizedConditionValue
          break
        case ConditionOperator.Contains:
          conditionMet = String(normalizedSourceValue)?.includes(String(normalizedConditionValue)) || false
          break
        case ConditionOperator.GreaterThan:
          conditionMet = Number(normalizedSourceValue) > Number(normalizedConditionValue)
          break
        case ConditionOperator.LessThan:
          conditionMet = Number(normalizedSourceValue) < Number(normalizedConditionValue)
          break
        case ConditionOperator.IsEmpty:
          conditionMet = !normalizedSourceValue || normalizedSourceValue === ""
          break
        case ConditionOperator.IsNotEmpty:
          conditionMet = !!normalizedSourceValue && normalizedSourceValue !== ""
          break
      }

      // Apply the action if condition is met
      if (conditionMet) {
        switch (rule.action) {
          case ActionType.Show:
            if (!newStates[rule.targetElementId].isVisible) {
              newStates[rule.targetElementId].isVisible = true
              statesChanged = true
            }
            break
          case ActionType.Hide:
            if (newStates[rule.targetElementId].isVisible) {
              newStates[rule.targetElementId].isVisible = false
              statesChanged = true
            }
            break
          case ActionType.Enable:
            if (!newStates[rule.targetElementId].isEnabled) {
              newStates[rule.targetElementId].isEnabled = true
              statesChanged = true
            }
            break
          case ActionType.Disable:
            if (newStates[rule.targetElementId].isEnabled) {
              newStates[rule.targetElementId].isEnabled = false
              statesChanged = true
            }
            break
          case ActionType.SetValue:
            setFormValues((prev) => ({
              ...prev,
              [rule.targetElementId]: rule.conditionValue,
            }))
            break
        }
      }
    })

    if (statesChanged) {
      setElementStates(newStates)
    }
  }

  // Helper function to normalize checkbox values for comparison
  const normalizeCheckboxValue = (value: any, element: FormElement): string => {
    // If the value is already the trueValue or falseValue, return it
    if (value === element.trueValue || value === element.falseValue) {
      return value
    }

    // Handle common true/false values
    if (value === true || value === "true" || value === "1" || value === 1) {
      return element.trueValue || "true"
    }

    if (value === false || value === "false" || value === "0" || value === 0) {
      return element.falseValue || "false"
    }

    // Default case
    return String(value)
  }

  const handleValueChange = (elementId: number, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [elementId]: value,
    }))

    // Clear validation error when value changes
    if (validationErrors[elementId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[elementId]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    if (!form) return false

    const errors: Record<number, string> = {}
    let isValid = true

    form.elements.forEach((element) => {
      // Skip validation for hidden elements
      if (!elementStates[element.elementId]?.isVisible) return

      const value = formValues[element.elementId]

      // Check required validation
      if (element.isRequired && (!value || value === "")) {
        errors[element.elementId] = `${element.label} is required`
        isValid = false
        return
      }

      // Skip other validations if value is empty and not required
      if (!value || value === "") return

      // Check other validation rules
      if (element.validationRules && element.validationRules.length > 0) {
        for (const rule of element.validationRules) {
          let ruleViolated = false

          switch (rule.ruleType) {
            case 0: // Required
              ruleViolated = !value || value === ""
              break
            case 1: // Regex
              try {
                const regex = new RegExp(rule.ruleValue)
                ruleViolated = !regex.test(value)
              } catch (e) {
                console.error("Invalid regex pattern:", rule.ruleValue)
              }
              break
            case 2: // MaxLength
              ruleViolated = value.length > Number.parseInt(rule.ruleValue)
              break
            case 3: // MinLength
              ruleViolated = value.length < Number.parseInt(rule.ruleValue)
              break
            case 4: // Range
              const [min, max] = rule.ruleValue.split(",")
              const numValue = Number.parseFloat(value)
              ruleViolated = numValue < Number.parseFloat(min) || numValue > Number.parseFloat(max)
              break
            case 5: // Email
              ruleViolated = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              break
            case 6: // Numeric
              ruleViolated = isNaN(Number.parseFloat(value))
              break
          }

          if (ruleViolated) {
            errors[element.elementId] = rule.errorMessage
            isValid = false
            break
          }
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      toast({
        title: "Form Submitted",
        description: "Form data has been submitted successfully",
      })

      console.log("Form Values:", formValues)
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
    }
  }

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
    <div className="flex-1 p-6 overflow-auto bg-muted/10">
      <div className="max-w-3xl mx-auto bg-background p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-1">{form.name}</h1>
        <p className="text-muted-foreground mb-6">{form.description}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sortedElements.map((element) => {
            // In preview mode, we actually don't render hidden elements at all
            if (!elementStates[element.elementId]?.isVisible) return null

            const isEnabled = elementStates[element.elementId]?.isEnabled
            const error = validationErrors[element.elementId]

            return (
              <div key={element.elementId} className="space-y-2">
                {renderFormElement(
                  element,
                  formValues[element.elementId],
                  isEnabled,
                  (value) => handleValueChange(element.elementId, value),
                  itemsSources,
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            )
          })}

          <div className="pt-4">
            <Button type="submit" className="w-full">
              Submit Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function renderFormElement(
  element: FormElement,
  value: any,
  isEnabled: boolean,
  onChange: (value: any) => void,
  itemsSources: ComboBoxItemsSource[],
) {
  switch (element.type) {
    case ElementType.TextBox:
      return (
        <>
          <Label htmlFor={`element-${element.elementId}`}>{element.label}</Label>
          <Input
            id={`element-${element.elementId}`}
            placeholder={element.placeholder}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={!isEnabled}
            type={element.fieldType || "text"}
            maxLength={element.maxLength || undefined}
          />
        </>
      )

    case ElementType.ComboBox:
      // Find the items source
      const itemsSource = itemsSources.find((source) => source.itemsSourceId === element.itemsSourceId)

      return (
        <>
          <Label htmlFor={`element-${element.elementId}`}>{element.label}</Label>
          <Select value={value || ""} onValueChange={onChange} disabled={!isEnabled}>
            <SelectTrigger id={`element-${element.elementId}`}>
              <SelectValue placeholder={element.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {itemsSource ? (
                itemsSource.items.map((item, index) => (
                  <SelectItem key={index} value={item.value}>
                    {item.displayText}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="placeholder">No items available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </>
      )

    case ElementType.DatePicker:
      return (
        <>
          <Label htmlFor={`element-${element.elementId}`}>{element.label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={`element-${element.elementId}`}
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
                disabled={!isEnabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), element.dateFormat || "PPP") : element.placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
                disabled={!isEnabled}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </>
      )

    case ElementType.CheckBox:
      const isChecked = value === (element.trueValue || "true")

      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`element-${element.elementId}`}
            checked={isChecked}
            onCheckedChange={(checked) =>
              onChange(checked ? element.trueValue || "true" : element.falseValue || "false")
            }
            disabled={!isEnabled}
          />
          <Label htmlFor={`element-${element.elementId}`}>{element.label}</Label>
        </div>
      )

    default:
      return null
  }
}

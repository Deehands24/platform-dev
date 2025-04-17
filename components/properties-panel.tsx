"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ElementType,
  type FormElement,
  type Form,
  type ElementInteractionRule,
  type ComboBoxItemsSource,
} from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ValidationRulesTab from "./validation-rules-tab"
import ElementInteractionRulesTab from "./element-interaction-rules-tab"

interface PropertiesPanelProps {
  selectedElement: FormElement | null
  updateElement: (element: FormElement) => void
  itemsSources: ComboBoxItemsSource[]
  currentForm: Form | null
  interactionRules: ElementInteractionRule[]
  addInteractionRule: (rule: ElementInteractionRule) => void
  updateInteractionRule: (rule: ElementInteractionRule) => void
  removeInteractionRule: (ruleId: number) => void
}

export default function PropertiesPanel({
  selectedElement,
  updateElement,
  itemsSources,
  currentForm,
  interactionRules,
  addInteractionRule,
  updateInteractionRule,
  removeInteractionRule,
}: PropertiesPanelProps) {
  const [localElement, setLocalElement] = useState<FormElement | null>(null)

  useEffect(() => {
    setLocalElement(selectedElement)
  }, [selectedElement])

  const handleChange = (field: string, value: any) => {
    if (!localElement) return

    const updatedElement = { ...localElement, [field]: value }
    setLocalElement(updatedElement)
    updateElement(updatedElement)
  }

  if (!localElement || !currentForm) {
    return (
      <div className="w-80 border-l bg-muted/20 p-4">
        <h2 className="font-semibold mb-4">Properties</h2>
        <div className="text-center py-8 text-muted-foreground">
          <p>No element selected</p>
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    )
  }

  // Get interaction rules for this element
  const sourceRules = interactionRules.filter((rule) => rule.sourceElementId === localElement.elementId)
  const targetRules = interactionRules.filter((rule) => rule.targetElementId === localElement.elementId)

  return (
    <div className="w-80 border-l bg-muted/20 p-4 overflow-y-auto">
      <h2 className="font-semibold mb-4">Properties</h2>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="specific">Specific</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="interaction">Interaction</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" value={localElement.label} onChange={(e) => handleChange("label", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={localElement.placeholder}
              onChange={(e) => handleChange("placeholder", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultValue">Default Value</Label>
            <Input
              id="defaultValue"
              value={localElement.defaultValue}
              onChange={(e) => handleChange("defaultValue", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="isVisible">Visible</Label>
              <Switch
                id="isVisible"
                checked={localElement.isVisible}
                onCheckedChange={(checked) => handleChange("isVisible", checked)}
              />
            </div>
            {!localElement.isVisible && (
              <p className="text-xs text-amber-500">
                This element is hidden but still available for drag and drop. It will not be visible in the preview.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isEnabled">Enabled</Label>
            <Switch
              id="isEnabled"
              checked={localElement.isEnabled}
              onCheckedChange={(checked) => handleChange("isEnabled", checked)}
            />
          </div>
        </TabsContent>

        <TabsContent value="specific" className="space-y-4 pt-4">
          {localElement.type === ElementType.TextBox && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fieldType">Field Type</Label>
                <Select
                  value={localElement.fieldType || "text"}
                  onValueChange={(value) => handleChange("fieldType", value)}
                >
                  <SelectTrigger id="fieldType">
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="password">Password</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLength">Max Length</Label>
                <Input
                  id="maxLength"
                  type="number"
                  value={localElement.maxLength || ""}
                  onChange={(e) => handleChange("maxLength", e.target.value ? Number.parseInt(e.target.value) : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regexPattern">Regex Pattern</Label>
                <Input
                  id="regexPattern"
                  value={localElement.regexPattern || ""}
                  onChange={(e) => handleChange("regexPattern", e.target.value || null)}
                />
              </div>
            </>
          )}

          {localElement.type === ElementType.ComboBox && (
            <>
              <div className="space-y-2">
                <Label htmlFor="itemsSourceId">Items Source</Label>
                <Select
                  value={localElement.itemsSourceId?.toString() || ""}
                  onValueChange={(value) => handleChange("itemsSourceId", value ? Number.parseInt(value) : null)}
                >
                  <SelectTrigger id="itemsSourceId">
                    <SelectValue placeholder="Select items source" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemsSources.map((source) => (
                      <SelectItem key={source.itemsSourceId} value={source.itemsSourceId.toString()}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowMultiSelect">Allow Multi Select</Label>
                <Switch
                  id="allowMultiSelect"
                  checked={localElement.allowMultiSelect || false}
                  onCheckedChange={(checked) => handleChange("allowMultiSelect", checked)}
                />
              </div>
            </>
          )}

          {localElement.type === ElementType.DatePicker && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Input
                  id="dateFormat"
                  value={localElement.dateFormat || "yyyy-MM-dd"}
                  onChange={(e) => handleChange("dateFormat", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minDate">Min Date</Label>
                <Input
                  id="minDate"
                  type="date"
                  value={localElement.minDate || ""}
                  onChange={(e) => handleChange("minDate", e.target.value || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDate">Max Date</Label>
                <Input
                  id="maxDate"
                  type="date"
                  value={localElement.maxDate || ""}
                  onChange={(e) => handleChange("maxDate", e.target.value || null)}
                />
              </div>
            </>
          )}

          {localElement.type === ElementType.CheckBox && (
            <>
              <div className="space-y-2">
                <Label htmlFor="trueValue">True Value</Label>
                <Input
                  id="trueValue"
                  value={localElement.trueValue || "true"}
                  onChange={(e) => handleChange("trueValue", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="falseValue">False Value</Label>
                <Input
                  id="falseValue"
                  value={localElement.falseValue || "false"}
                  onChange={(e) => handleChange("falseValue", e.target.value)}
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="validation" className="pt-4">
          <ValidationRulesTab element={localElement} updateElement={updateElement} />
        </TabsContent>

        <TabsContent value="interaction" className="pt-4">
          <ElementInteractionRulesTab
            form={currentForm}
            element={localElement}
            updateElement={updateElement}
            interactionRules={interactionRules}
            addInteractionRule={addInteractionRule}
            updateInteractionRule={updateInteractionRule}
            removeInteractionRule={removeInteractionRule}
            sourceRules={sourceRules}
            targetRules={targetRules}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

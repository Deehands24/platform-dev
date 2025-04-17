"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ActionType,
  ConditionOperator,
  ElementType,
  type ElementInteractionRule,
  type Form,
  type FormElement,
} from "@/lib/types"
import { PlusCircle, Trash2 } from "lucide-react"

interface ElementInteractionRulesTabProps {
  form: Form
  element: FormElement
  updateElement: (element: FormElement) => void
  interactionRules: ElementInteractionRule[]
  addInteractionRule: (rule: ElementInteractionRule) => void
  updateInteractionRule: (rule: ElementInteractionRule) => void
  removeInteractionRule: (ruleId: number) => void
  sourceRules: ElementInteractionRule[]
  targetRules: ElementInteractionRule[]
}

export default function ElementInteractionRulesTab({
  form,
  element,
  updateElement,
  interactionRules,
  addInteractionRule,
  updateInteractionRule,
  removeInteractionRule,
  sourceRules,
  targetRules,
}: ElementInteractionRulesTabProps) {
  const [activeTab, setActiveTab] = useState("source")

  // Source rule state (when this element affects others)
  const [targetElementId, setTargetElementId] = useState<number | null>(null)
  const [sourceOperator, setSourceOperator] = useState<ConditionOperator>(ConditionOperator.Equals)
  const [sourceConditionValue, setSourceConditionValue] = useState("")
  const [sourceAction, setSourceAction] = useState<ActionType>(ActionType.Show)

  // Target rule state (when other elements affect this one)
  const [sourceElementId, setSourceElementId] = useState<number | null>(null)
  const [targetOperator, setTargetOperator] = useState<ConditionOperator>(ConditionOperator.Equals)
  const [targetConditionValue, setTargetConditionValue] = useState("")
  const [targetAction, setTargetAction] = useState<ActionType>(ActionType.Show)

  const addSourceRule = () => {
    if (!targetElementId) return

    // For checkbox elements, suggest the true/false values in the UI
    let conditionValue = sourceConditionValue
    if (element.type === ElementType.CheckBox && !conditionValue) {
      conditionValue = element.trueValue || "true"
    }

    const newRule: ElementInteractionRule = {
      interactionRuleId: Date.now(),
      sourceElementId: element.elementId,
      targetElementId,
      operator: sourceOperator,
      conditionValue,
      action: sourceAction,
    }

    addInteractionRule(newRule)

    // Reset form
    setTargetElementId(null)
    setSourceConditionValue("")
  }

  const addTargetRule = () => {
    if (!sourceElementId) return

    // Get the source element to check if it's a checkbox
    const sourceElement = form.elements.find((e) => e.elementId === sourceElementId)
    let conditionValue = targetConditionValue

    // For checkbox elements, suggest the true/false values in the UI
    if (sourceElement?.type === ElementType.CheckBox && !conditionValue) {
      conditionValue = sourceElement.trueValue || "true"
    }

    const newRule: ElementInteractionRule = {
      interactionRuleId: Date.now(),
      sourceElementId,
      targetElementId: element.elementId,
      operator: targetOperator,
      conditionValue,
      action: targetAction,
    }

    addInteractionRule(newRule)

    // Reset form
    setSourceElementId(null)
    setTargetConditionValue("")
  }

  const getOperatorLabel = (op: ConditionOperator) => {
    switch (op) {
      case ConditionOperator.Equals:
        return "Equals"
      case ConditionOperator.NotEquals:
        return "Not Equals"
      case ConditionOperator.Contains:
        return "Contains"
      case ConditionOperator.GreaterThan:
        return "Greater Than"
      case ConditionOperator.LessThan:
        return "Less Than"
      case ConditionOperator.IsEmpty:
        return "Is Empty"
      case ConditionOperator.IsNotEmpty:
        return "Is Not Empty"
      default:
        return "Unknown"
    }
  }

  const getActionLabel = (act: ActionType) => {
    switch (act) {
      case ActionType.Show:
        return "Show"
      case ActionType.Hide:
        return "Hide"
      case ActionType.Enable:
        return "Enable"
      case ActionType.Disable:
        return "Disable"
      case ActionType.SetValue:
        return "Set Value"
      default:
        return "Unknown"
    }
  }

  const getElementLabel = (elementId: number) => {
    const foundElement = form.elements.find((e) => e.elementId === elementId)
    return foundElement ? foundElement.label : "Unknown Element"
  }

  // Filter out the current element from the other elements
  const otherElements = form.elements.filter((e) => e.elementId !== element.elementId)

  // Get the selected source element for the target tab
  const selectedSourceElement = form.elements.find((e) => e.elementId === sourceElementId)

  // Get checkbox values for the current element (for source tab)
  const getCheckboxValues = () => {
    if (element.type === ElementType.CheckBox) {
      return [
        { value: element.trueValue || "true", label: `True (${element.trueValue || "true"})` },
        { value: element.falseValue || "false", label: `False (${element.falseValue || "false"})` },
      ]
    }
    return []
  }

  // Get checkbox values for the selected source element (for target tab)
  const getSourceCheckboxValues = () => {
    if (selectedSourceElement?.type === ElementType.CheckBox) {
      return [
        {
          value: selectedSourceElement.trueValue || "true",
          label: `True (${selectedSourceElement.trueValue || "true"})`,
        },
        {
          value: selectedSourceElement.falseValue || "false",
          label: `False (${selectedSourceElement.falseValue || "false"})`,
        },
      ]
    }
    return []
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="source">This Element Affects Others</TabsTrigger>
          <TabsTrigger value="target">Other Elements Affect This</TabsTrigger>
        </TabsList>

        <TabsContent value="source" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="targetElementId">Target Element</Label>
            <Select
              value={targetElementId?.toString() || ""}
              onValueChange={(value) => setTargetElementId(Number.parseInt(value))}
            >
              <SelectTrigger id="targetElementId">
                <SelectValue placeholder="Select target element" />
              </SelectTrigger>
              <SelectContent>
                {otherElements.map((e) => (
                  <SelectItem key={e.elementId} value={e.elementId.toString()}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceOperator">Condition</Label>
            <Select
              value={sourceOperator.toString()}
              onValueChange={(value) => setSourceOperator(Number.parseInt(value) as ConditionOperator)}
            >
              <SelectTrigger id="sourceOperator">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConditionOperator.Equals.toString()}>Equals</SelectItem>
                <SelectItem value={ConditionOperator.NotEquals.toString()}>Not Equals</SelectItem>
                <SelectItem value={ConditionOperator.Contains.toString()}>Contains</SelectItem>
                <SelectItem value={ConditionOperator.GreaterThan.toString()}>Greater Than</SelectItem>
                <SelectItem value={ConditionOperator.LessThan.toString()}>Less Than</SelectItem>
                <SelectItem value={ConditionOperator.IsEmpty.toString()}>Is Empty</SelectItem>
                <SelectItem value={ConditionOperator.IsNotEmpty.toString()}>Is Not Empty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sourceOperator !== ConditionOperator.IsEmpty && sourceOperator !== ConditionOperator.IsNotEmpty && (
            <div className="space-y-2">
              <Label htmlFor="sourceConditionValue">Condition Value</Label>
              {element.type === ElementType.CheckBox ? (
                <Select value={sourceConditionValue} onValueChange={setSourceConditionValue}>
                  <SelectTrigger id="sourceConditionValue">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCheckboxValues().map((option, index) => (
                      <SelectItem key={index} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="sourceConditionValue"
                  value={sourceConditionValue}
                  onChange={(e) => setSourceConditionValue(e.target.value)}
                />
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sourceAction">Action</Label>
            <Select
              value={sourceAction.toString()}
              onValueChange={(value) => setSourceAction(Number.parseInt(value) as ActionType)}
            >
              <SelectTrigger id="sourceAction">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ActionType.Show.toString()}>Show</SelectItem>
                <SelectItem value={ActionType.Hide.toString()}>Hide</SelectItem>
                <SelectItem value={ActionType.Enable.toString()}>Enable</SelectItem>
                <SelectItem value={ActionType.Disable.toString()}>Disable</SelectItem>
                <SelectItem value={ActionType.SetValue.toString()}>Set Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={addSourceRule} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Interaction Rule
          </Button>

          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium">Current Source Rules</h3>
            {sourceRules.length > 0 ? (
              <div className="space-y-2">
                {sourceRules.map((rule) => (
                  <div key={rule.interactionRuleId} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">When this element</p>
                      <p className="text-sm">
                        {getOperatorLabel(rule.operator)}
                        {rule.operator !== ConditionOperator.IsEmpty &&
                          rule.operator !== ConditionOperator.IsNotEmpty &&
                          ` "${rule.conditionValue}"`}
                      </p>
                      <p className="text-sm">
                        {getActionLabel(rule.action)} {getElementLabel(rule.targetElementId)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeInteractionRule(rule.interactionRuleId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No source rules added yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="target" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="sourceElementId">Source Element</Label>
            <Select
              value={sourceElementId?.toString() || ""}
              onValueChange={(value) => setSourceElementId(Number.parseInt(value))}
            >
              <SelectTrigger id="sourceElementId">
                <SelectValue placeholder="Select source element" />
              </SelectTrigger>
              <SelectContent>
                {otherElements.map((e) => (
                  <SelectItem key={e.elementId} value={e.elementId.toString()}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetOperator">Condition</Label>
            <Select
              value={targetOperator.toString()}
              onValueChange={(value) => setTargetOperator(Number.parseInt(value) as ConditionOperator)}
            >
              <SelectTrigger id="targetOperator">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConditionOperator.Equals.toString()}>Equals</SelectItem>
                <SelectItem value={ConditionOperator.NotEquals.toString()}>Not Equals</SelectItem>
                <SelectItem value={ConditionOperator.Contains.toString()}>Contains</SelectItem>
                <SelectItem value={ConditionOperator.GreaterThan.toString()}>Greater Than</SelectItem>
                <SelectItem value={ConditionOperator.LessThan.toString()}>Less Than</SelectItem>
                <SelectItem value={ConditionOperator.IsEmpty.toString()}>Is Empty</SelectItem>
                <SelectItem value={ConditionOperator.IsNotEmpty.toString()}>Is Not Empty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetOperator !== ConditionOperator.IsEmpty && targetOperator !== ConditionOperator.IsNotEmpty && (
            <div className="space-y-2">
              <Label htmlFor="targetConditionValue">Condition Value</Label>
              {selectedSourceElement?.type === ElementType.CheckBox ? (
                <Select value={targetConditionValue} onValueChange={setTargetConditionValue}>
                  <SelectTrigger id="targetConditionValue">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSourceCheckboxValues().map((option, index) => (
                      <SelectItem key={index} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="targetConditionValue"
                  value={targetConditionValue}
                  onChange={(e) => setTargetConditionValue(e.target.value)}
                />
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="targetAction">Action</Label>
            <Select
              value={targetAction.toString()}
              onValueChange={(value) => setTargetAction(Number.parseInt(value) as ActionType)}
            >
              <SelectTrigger id="targetAction">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ActionType.Show.toString()}>Show</SelectItem>
                <SelectItem value={ActionType.Hide.toString()}>Hide</SelectItem>
                <SelectItem value={ActionType.Enable.toString()}>Enable</SelectItem>
                <SelectItem value={ActionType.Disable.toString()}>Disable</SelectItem>
                <SelectItem value={ActionType.SetValue.toString()}>Set Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={addTargetRule} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Interaction Rule
          </Button>

          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium">Current Target Rules</h3>
            {targetRules.length > 0 ? (
              <div className="space-y-2">
                {targetRules.map((rule) => (
                  <div key={rule.interactionRuleId} className="flex items-center justify-between p-2 border rounded-md">
                    <div>
                      <p className="font-medium">When {getElementLabel(rule.sourceElementId)}</p>
                      <p className="text-sm">
                        {getOperatorLabel(rule.operator)}
                        {rule.operator !== ConditionOperator.IsEmpty &&
                          rule.operator !== ConditionOperator.IsNotEmpty &&
                          ` "${rule.conditionValue}"`}
                      </p>
                      <p className="text-sm">{getActionLabel(rule.action)} this element</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeInteractionRule(rule.interactionRuleId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No target rules added yet</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

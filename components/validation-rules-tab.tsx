"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type FormElement, RuleType, type ValidationRule } from "@/lib/types"
import { PlusCircle, Trash2 } from "lucide-react"

interface ValidationRulesTabProps {
  element: FormElement
  updateElement: (element: FormElement) => void
}

export default function ValidationRulesTab({ element, updateElement }: ValidationRulesTabProps) {
  const [ruleType, setRuleType] = useState<RuleType>(RuleType.Required)
  const [ruleValue, setRuleValue] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const addValidationRule = () => {
    if (!errorMessage) return

    const newRule: ValidationRule = {
      validationRuleId: Date.now(),
      elementId: element.elementId,
      ruleType,
      ruleValue,
      errorMessage,
    }

    const updatedElement = {
      ...element,
      validationRules: [...(element.validationRules || []), newRule],
    }

    updateElement(updatedElement)

    // Reset form
    setRuleValue("")
    setErrorMessage("")
  }

  const removeValidationRule = (ruleId: number) => {
    const updatedElement = {
      ...element,
      validationRules: element.validationRules.filter((rule) => rule.validationRuleId !== ruleId),
    }

    updateElement(updatedElement)
  }

  const getRuleTypeLabel = (type: RuleType) => {
    switch (type) {
      case RuleType.Required:
        return "Required"
      case RuleType.Regex:
        return "Regex"
      case RuleType.MaxLength:
        return "Max Length"
      case RuleType.MinLength:
        return "Min Length"
      case RuleType.Range:
        return "Range"
      case RuleType.Email:
        return "Email"
      case RuleType.Numeric:
        return "Numeric"
      case RuleType.Custom:
        return "Custom"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ruleType">Rule Type</Label>
        <Select value={ruleType.toString()} onValueChange={(value) => setRuleType(Number.parseInt(value) as RuleType)}>
          <SelectTrigger id="ruleType">
            <SelectValue placeholder="Select rule type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={RuleType.Required.toString()}>Required</SelectItem>
            <SelectItem value={RuleType.Regex.toString()}>Regex</SelectItem>
            <SelectItem value={RuleType.MaxLength.toString()}>Max Length</SelectItem>
            <SelectItem value={RuleType.MinLength.toString()}>Min Length</SelectItem>
            <SelectItem value={RuleType.Range.toString()}>Range</SelectItem>
            <SelectItem value={RuleType.Email.toString()}>Email</SelectItem>
            <SelectItem value={RuleType.Numeric.toString()}>Numeric</SelectItem>
            <SelectItem value={RuleType.Custom.toString()}>Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {ruleType !== RuleType.Required && ruleType !== RuleType.Email && ruleType !== RuleType.Numeric && (
        <div className="space-y-2">
          <Label htmlFor="ruleValue">Rule Value</Label>
          <Input
            id="ruleValue"
            value={ruleValue}
            onChange={(e) => setRuleValue(e.target.value)}
            placeholder={
              ruleType === RuleType.Regex
                ? "^[a-zA-Z0-9]+$"
                : ruleType === RuleType.MaxLength
                  ? "100"
                  : ruleType === RuleType.MinLength
                    ? "5"
                    : ruleType === RuleType.Range
                      ? "1-100"
                      : ""
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="errorMessage">Error Message</Label>
        <Input
          id="errorMessage"
          value={errorMessage}
          onChange={(e) => setErrorMessage(e.target.value)}
          placeholder="Please enter a valid value"
        />
      </div>

      <Button onClick={addValidationRule} className="w-full">
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Validation Rule
      </Button>

      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium">Current Validation Rules</h3>
        {element.validationRules && element.validationRules.length > 0 ? (
          <div className="space-y-2">
            {element.validationRules.map((rule) => (
              <div key={rule.validationRuleId} className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <p className="font-medium">{getRuleTypeLabel(rule.ruleType)}</p>
                  {rule.ruleValue && <p className="text-sm text-muted-foreground">{rule.ruleValue}</p>}
                  <p className="text-sm">{rule.errorMessage}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeValidationRule(rule.validationRuleId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No validation rules added yet</p>
        )}
      </div>
    </div>
  )
}

// Database Types
export interface Database {
  databaseId: number
  name: string
  description: string
  createdDate: Date
  updatedDate: Date
  tables: Table[]
  forms: Form[]
  relationships: Relationship[]
}

export interface Table {
  tableId: number
  databaseId: number
  name: string
  description: string
  createdDate: Date
  updatedDate: Date
  columns: TableColumn[]
  rows: TableRow[]
}

export interface TableColumn {
  columnId: number
  tableId: number
  name: string
  type: ColumnType
  isPrimaryKey: boolean
  isRequired: boolean
  defaultValue?: string
  validationRules?: ValidationRule[]
}

export interface TableRow {
  rowId: number
  tableId: number
  data: Record<string, any>
}

export enum ColumnType {
  Text = 0,
  Number = 1,
  Boolean = 2,
  Date = 3,
  Select = 4,
  Reference = 5,
  File = 6,
}

export interface Relationship {
  relationshipId: number
  databaseId: number
  name: string
  sourceTableId: number
  sourceColumnId: number
  targetTableId: number
  targetColumnId: number
  type: RelationshipType
}

export enum RelationshipType {
  OneToOne = 0,
  OneToMany = 1,
  ManyToMany = 2,
}

// Form Types
export enum ElementType {
  TextBox = 0,
  ComboBox = 1,
  DatePicker = 2,
  CheckBox = 3,
}

export enum RuleType {
  Required = 0,
  Regex = 1,
  MaxLength = 2,
  MinLength = 3,
  Range = 4,
  Email = 5,
  Numeric = 6,
  Custom = 7,
}

export enum ConditionOperator {
  Equals = 0,
  NotEquals = 1,
  Contains = 2,
  GreaterThan = 3,
  LessThan = 4,
  IsEmpty = 5,
  IsNotEmpty = 6,
}

export enum ActionType {
  Show = 0,
  Hide = 1,
  Enable = 2,
  Disable = 3,
  SetValue = 4,
}

export enum NavigationType {
  Next = 0,
  Previous = 1,
  Submit = 2,
}

export interface Form {
  formId: number
  databaseId: number
  name: string
  description: string
  createdDate?: Date
  updatedDate?: Date
  isActive: boolean
  elements: FormElement[]
  interactionRules?: ElementInteractionRule[]
  tableLinks: FormTableLink[]
}

export interface FormTableLink {
  linkId: number
  formId: number
  elementId: number
  tableId: number
  columnId: number
}

export interface TextBoxElementData {
  fieldType: string
  maxLength?: number | null
  regexPattern?: string | null
}

export interface ComboBoxElementData {
  itemsSourceId: number | null
  allowMultiSelect: boolean
}

export interface DatePickerElementData {
  dateFormat: string
  minDate?: string | null
  maxDate?: string | null
}

export interface CheckBoxElementData {
  trueValue: string
  falseValue: string
}

export type ElementTypeSpecificData =
  | TextBoxElementData
  | ComboBoxElementData
  | DatePickerElementData
  | CheckBoxElementData

export interface FormElement {
  elementId: number
  formId: number
  label: string
  placeholder: string
  defaultValue: string
  order: number
  type: ElementType
  isRequired: boolean
  isVisible: boolean
  isEnabled: boolean
  validationRules: ValidationRule[]
  elementTypeSpecificData?: ElementTypeSpecificData
  sourceInteractionRules?: ElementInteractionRule[]
  targetInteractionRules?: ElementInteractionRule[]
  tableLink?: FormTableLink

  // Legacy properties for backward compatibility
  fieldType?: string
  maxLength?: number | null
  regexPattern?: string | null
  itemsSourceId?: number | null
  allowMultiSelect?: boolean
  dateFormat?: string
  minDate?: string | null
  maxDate?: string | null
  trueValue?: string
  falseValue?: string
}

export interface ValidationRule {
  validationRuleId: number
  elementId: number
  ruleType: RuleType
  ruleValue: string
  errorMessage: string
}

export interface ElementInteractionRule {
  interactionRuleId: number
  sourceElementId: number
  targetElementId: number
  operator: ConditionOperator
  conditionValue: string
  action: ActionType
}

export interface ComboBoxItemsSource {
  itemsSourceId: number
  name?: string
  items: ComboBoxItem[]
  parentId?: number | null
}

export interface ComboBoxItem {
  value: string
  displayText: string
}

export interface FormNavigation {
  navigationId: number
  formId: number
  nextFormId?: number | null
  previousFormId?: number | null
  type: NavigationType
  order: number
  additionalConditions: string
}

"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Group,
  X,
  Plus,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Data types that the table can detect
type DataType = "string" | "number" | "date" | "boolean" | "array" | "object" | "unknown"

// Interface for column configuration
interface ColumnConfig {
  key: string
  label: string
  type?: DataType
  format?: (value: any) => string
  sortable?: boolean
}

// DynamicTable component properties
interface DynamicTableProps {
  data: Record<string, any>[]
  columns?: ColumnConfig[]
  pageSize?: number
  searchable?: boolean
  sortable?: boolean
  filterable?: boolean
  groupable?: boolean
}

interface FilterRule {
  field: string
  operator: string
  value: string
}

interface FilterState {
  logicOperator: "AND" | "OR"
  rules: FilterRule[]
}

export default function DynamicTable({
  data = [],
  columns,
  pageSize = 10,
  searchable = true,
  sortable = true,
  filterable = true,
  groupable = true,
}: DynamicTableProps) {
  // Table state
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [filterState, setFilterState] = useState<FilterState>({
    logicOperator: "AND",
    rules: [],
  })
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    logicOperator: "AND",
    rules: [],
  })
  const [groupByField, setGroupByField] = useState<string | null>(null)
  const [appliedTags, setAppliedTags] = useState<string[]>([])
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [pageSizeOptions] = useState([5, 10, 20, 50, 100])
  const [currentPageSize, setCurrentPageSize] = useState(pageSize)

  // Auto-detect columns if not provided
  const autoDetectedColumns = useMemo(() => {
    if (columns) return columns

    if (data.length === 0) return []

    // Extract all unique keys from the data
    const keys = Array.from(new Set(data.flatMap((item) => Object.keys(item))))

    return keys.map((key) => {
      // Detect data type for this column
      const type = detectDataType(data.find((item) => item[key] !== undefined)?.[key])

      return {
        key,
        label: key.charAt(0).toUpperCase() + key.replace(/([A-Z])/g, " $1").slice(1),
        type,
        sortable: type !== "object" && type !== "unknown",
      }
    })
  }, [data, columns])

  // Function to detect data type
  function detectDataType(value: any): DataType {
    if (value === null || value === undefined) return "unknown"

    if (Array.isArray(value)) return "array"

    if (value instanceof Date) return "date"

    const type = typeof value

    if (type === "string") {
      // Try to detect if it's a date
      const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/
      if (datePattern.test(value) && !isNaN(Date.parse(value))) {
        return "date"
      }
      return "string"
    }

    if (type === "number") return "number"
    if (type === "boolean") return "boolean"
    if (type === "object") return "object"

    return "unknown"
  }

  // Function to apply filters
  const applyFilter = () => {
    setActiveFilters(filterState)

    // Extract tags to show applied filters
    const tags = filterState.rules.map((rule) => `${rule.field} ${rule.operator} ${rule.value}`)
    setAppliedTags(tags)
  }

  // Function to remove a specific filter
  const removeFilter = (index: number) => {
    const newRules = [...filterState.rules]
    newRules.splice(index, 1)
    const newFilterState = { ...filterState, rules: newRules }
    setFilterState(newFilterState)
    setActiveFilters(newFilterState)

    const newTags = [...appliedTags]
    newTags.splice(index, 1)
    setAppliedTags(newTags)
  }

  // Function to add a new filter rule
  const addFilterRule = () => {
    if (autoDetectedColumns.length === 0) return

    setFilterState((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          field: autoDetectedColumns[0].key,
          operator: "=",
          value: "",
        },
      ],
    }))
  }

  // Function to update a filter rule
  const updateFilterRule = (index: number, field: string, value: any) => {
    const newRules = [...filterState.rules]
    newRules[index] = { ...newRules[index], [field]: value }
    setFilterState({ ...filterState, rules: newRules })
  }

  // Function to get operators based on data type
  const getOperatorsForType = (type: DataType) => {
    switch (type) {
      case "number":
      case "date":
        return [
          { value: "=", label: "=" },
          { value: "!=", label: "!=" },
          { value: ">", label: ">" },
          { value: "<", label: "<" },
          { value: ">=", label: ">=" },
          { value: "<=", label: "<=" },
        ]
      case "string":
        return [
          { value: "=", label: "=" },
          { value: "!=", label: "!=" },
          { value: "contains", label: "Contains" },
          { value: "startsWith", label: "Starts with" },
          { value: "endsWith", label: "Ends with" },
        ]
      case "boolean":
        return [
          { value: "=", label: "=" },
          { value: "!=", label: "!=" },
        ]
      default:
        return [
          { value: "=", label: "=" },
          { value: "!=", label: "!=" },
        ]
    }
  }

  // Function to evaluate if a value meets a filter rule
  const evaluateFilterRule = (value: any, rule: FilterRule, type: DataType) => {
    if (value === null || value === undefined) return false

    const strValue = String(value).toLowerCase()
    const filterValue = rule.value.toLowerCase()

    switch (rule.operator) {
      case "=":
        if (type === "boolean") {
          return (value === true && filterValue === "true") || (value === false && filterValue === "false")
        }
        return type === "string" ? strValue === filterValue : value == rule.value
      case "!=":
        if (type === "boolean") {
          return (value === true && filterValue !== "true") || (value === false && filterValue !== "false")
        }
        return type === "string" ? strValue !== filterValue : value != rule.value
      case ">":
        return type === "date" ? new Date(value) > new Date(rule.value) : Number(value) > Number(rule.value)
      case "<":
        return type === "date" ? new Date(value) < new Date(rule.value) : Number(value) < Number(rule.value)
      case ">=":
        return type === "date" ? new Date(value) >= new Date(rule.value) : Number(value) >= Number(rule.value)
      case "<=":
        return type === "date" ? new Date(value) <= new Date(rule.value) : Number(value) <= Number(rule.value)
      case "contains":
        return strValue.includes(filterValue)
      case "startsWith":
        return strValue.startsWith(filterValue)
      case "endsWith":
        return strValue.endsWith(filterValue)
      default:
        return false
    }
  }

  // Format value based on its type
  function formatValue(value: any, type: DataType): string {
    if (value === null || value === undefined) return ""

    switch (type) {
      case "date":
        const date = value instanceof Date ? value : new Date(value)
        return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
      case "array":
        return Array.isArray(value) ? value.join(", ") : String(value)
      case "object":
        return JSON.stringify(value)
      default:
        return String(value)
    }
  }

  // Filter data based on search and advanced filters
  const filteredData = useMemo(() => {
    let result = data

    // Apply global search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const firstColumnKey = autoDetectedColumns[0]?.key
      if (firstColumnKey) {
        result = result.filter((row) => {
          const value = row[firstColumnKey]
          if (value !== null && value !== undefined) {
            return String(value).toLowerCase().includes(query)
          }
          return false
        })
      }
    }

    // Apply advanced filters
    if (activeFilters.rules.length > 0) {
      result = result.filter((row) => {
        const results = activeFilters.rules.map((rule) => {
          const column = autoDetectedColumns.find((col) => col.key === rule.field)
          if (!column) return false

          const value = row[rule.field]
          const type = column.type || detectDataType(value)

          return evaluateFilterRule(value, rule, type)
        })

        return activeFilters.logicOperator === "AND" ? results.every(Boolean) : results.some(Boolean)
      })
    }

    return result
  }, [data, searchQuery, activeFilters, autoDetectedColumns])

  // Sort data and apply grouping
  const sortedAndGroupedData = useMemo(() => {
    let result = [...filteredData]

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        // Handle null or undefined values
        if (aValue === undefined || aValue === null) return sortConfig.direction === "asc" ? -1 : 1
        if (bValue === undefined || bValue === null) return sortConfig.direction === "asc" ? 1 : -1

        // Sort based on data type
        const columnType = autoDetectedColumns.find((col) => col.key === sortConfig.key)?.type || "string"

        if (columnType === "date") {
          const dateA = aValue instanceof Date ? aValue : new Date(aValue)
          const dateB = bValue instanceof Date ? bValue : new Date(bValue)
          return sortConfig.direction === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
        }

        if (columnType === "number") {
          return sortConfig.direction === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
        }

        // Default sorting (string)
        const strA = String(aValue).toLowerCase()
        const strB = String(bValue).toLowerCase()

        if (sortConfig.direction === "asc") {
          return strA.localeCompare(strB)
        } else {
          return strB.localeCompare(strA)
        }
      })
    }

    // Apply grouping if active
    if (groupByField) {
      const groups: Record<string, any[]> = {}
      result.forEach((item) => {
        const groupValue = item[groupByField]
        const groupKey = groupValue === null || groupValue === undefined ? "No value" : String(groupValue)
        if (!groups[groupKey]) {
          groups[groupKey] = []
        }
        groups[groupKey].push(item)
      })
      result = Object.entries(groups).map(([groupKey, items]) => ({
        __isGroupRow: true,
        __groupKey: groupKey,
        __groupField: groupByField,
        __itemCount: items.length,
        __items: items,
      }))
    }

    return result
  }, [filteredData, sortConfig, groupByField, autoDetectedColumns])

  // Pagination
  const totalPages = Math.ceil(sortedAndGroupedData.length / currentPageSize)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * currentPageSize
    return sortedAndGroupedData.slice(startIndex, startIndex + currentPageSize)
  }, [sortedAndGroupedData, currentPage, currentPageSize])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Handle sorting
  const handleSort = (key: string) => {
    if (!sortable) return

    const column = autoDetectedColumns.find((col) => col.key === key)
    if (!column?.sortable) return

    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null
      }
      return { key, direction: "asc" }
    })
  }

  // Render cell value based on its type
  const renderCellValue = (row: any, columnKey: string, type: DataType) => {
    // If it's a group row and it's the grouped column
    if (row.__isGroupRow && columnKey === row.__groupField) {
      return (
        <div className="font-medium">
          Group: {row.__groupKey} ({row.__itemCount} items)
        </div>
      )
    }

    // If it's a group row but not the grouped column
    if (row.__isGroupRow) {
      return null
    }

    const value = row[columnKey]
    if (value === null || value === undefined) return null

    switch (type) {
      case "boolean":
        return <Badge variant={value ? "default" : "outline"}>{value ? "Yes" : "No"}</Badge>
      case "array":
        if (!Array.isArray(value)) return formatValue(value, type)
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((item, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {String(item)}
              </Badge>
            ))}
            {value.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{value.length - 3}
              </Badge>
            )}
          </div>
        )
      case "date":
        const date = value instanceof Date ? value : new Date(value)
        return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
      default:
        return formatValue(value, type)
    }
  }

  // Update current page if total pages changes
  useEffect(() => {
    const newTotalPages = Math.ceil(sortedAndGroupedData.length / currentPageSize)
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(1, newTotalPages))
    }
  }, [sortedAndGroupedData, currentPageSize, currentPage])

  return (
    <div className="w-full space-y-4">
      {/* Search bar */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <div className="flex items-center flex-wrap gap-2 pl-8 pr-3 py-2 bg-background border rounded-md">
            {appliedTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(index)} />
              </Badge>
            ))}
            {groupByField && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Group className="h-3 w-3" />
                Grouped by: {groupByField}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setGroupByField(null)} />
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                {autoDetectedColumns[0]?.label}: {searchQuery}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            <Input
              type="search"
              placeholder="Search..."
              className="flex-grow border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}
      {(appliedTags.length > 0 || groupByField || searchQuery) && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => {
            setFilterState({ logicOperator: "AND", rules: [] })
            setActiveFilters({ logicOperator: "AND", rules: [] })
            setAppliedTags([])
            setGroupByField(null)
            setSearchQuery("")
          }}
        >
          Clear all filters
        </Button>
      )}

      {/* Filter and grouping buttons */}
      <div className="flex flex-wrap gap-2">
        {filterable && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Advanced Filters</DialogTitle>
              </DialogHeader>

              <div className="py-4 space-y-4">
                {/* Logic operator selector */}
                <div className="flex gap-2">
                  <Button
                    variant={filterState.logicOperator === "AND" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterState({ ...filterState, logicOperator: "AND" })}
                  >
                    AND
                  </Button>
                  <Button
                    variant={filterState.logicOperator === "OR" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterState({ ...filterState, logicOperator: "OR" })}
                  >
                    OR
                  </Button>

                  <div className="ml-auto">
                    <Button variant="outline" size="sm" onClick={addFilterRule}>
                      <Plus className="h-4 w-4 mr-1" /> Rule
                    </Button>
                  </div>
                </div>

                {/* Filter rules */}
                <div className="space-y-3">
                  {filterState.rules.map((rule, index) => {
                    const column = autoDetectedColumns.find((col) => col.key === rule.field)
                    const dataType = column?.type || "string"
                    const operators = getOperatorsForType(dataType)

                    return (
                      <div key={index} className="flex items-center gap-2">
                        {/* Field selector */}
                        <Select value={rule.field} onValueChange={(value) => updateFilterRule(index, "field", value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {autoDetectedColumns.map((column) => (
                              <SelectItem key={column.key} value={column.key}>
                                {column.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Operator selector */}
                        <Select
                          value={rule.operator}
                          onValueChange={(value) => updateFilterRule(index, "operator", value)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Value input */}
                        <Input
                          value={rule.value}
                          onChange={(e) => updateFilterRule(index, "value", e.target.value)}
                          className="flex-1"
                          placeholder="Value"
                        />

                        {/* Button to remove rule */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newRules = [...filterState.rules]
                            newRules.splice(index, 1)
                            setFilterState({ ...filterState, rules: newRules })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}

                  {filterState.rules.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No filter rules. Click "Rule" to add one.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterState({ logicOperator: "AND", rules: [] })
                    setActiveFilters({ logicOperator: "AND", rules: [] })
                    setAppliedTags([])
                  }}
                >
                  Clear
                </Button>
                <Button onClick={applyFilter}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {groupable && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Group className="h-4 w-4 mr-2" />
                Group by
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <div className="p-2">
                <div className="space-y-2">
                  {autoDetectedColumns.map((column) => (
                    <Button
                      key={column.key}
                      variant={groupByField === column.key ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setGroupByField(groupByField === column.key ? null : column.key)}
                    >
                      {column.label}
                    </Button>
                  ))}

                  {groupByField && (
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setGroupByField(null)}>
                      Remove grouping
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {autoDetectedColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.sortable && sortable ? "cursor-pointer select-none" : ""}
                  onClick={() => column.sortable && sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable &&
                      column.sortable &&
                      sortConfig?.key === column.key &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                    {groupByField === column.key && (
                      <Badge variant="outline" className="ml-2 h-5 px-1.5">
                        Grouped
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) =>
              row.__isGroupRow ? (
                <TableRow key={`group-${rowIndex}`} className="bg-muted">
                  <TableCell colSpan={autoDetectedColumns.length}>
                    <Collapsible
                      open={expandedGroups.includes(row.__groupKey)}
                      onOpenChange={(isOpen) => {
                        setExpandedGroups((prev) =>
                          isOpen ? [...prev, row.__groupKey] : prev.filter((key) => key !== row.__groupKey),
                        )
                      }}
                    >
                      <CollapsibleTrigger className="flex items-center w-full">
                        <ChevronRight
                          className={`h-4 w-4 mr-2 transition-transform ${
                            expandedGroups.includes(row.__groupKey) ? "transform rotate-90" : ""
                          }`}
                        />
                        <span className="font-medium">
                          {row.__groupField}: {row.__groupKey} ({row.__itemCount} items)
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2">
                          <Table>
                            <TableBody>
                              {row.__items.map((item, itemIndex) => (
                                <TableRow key={`${rowIndex}-${itemIndex}`}>
                                  {autoDetectedColumns.map((column) => {
                                    const type = column.type || detectDataType(item[column.key])
                                    return (
                                      <TableCell key={`${rowIndex}-${itemIndex}-${column.key}`}>
                                        {column.format
                                          ? column.format(item[column.key])
                                          : renderCellValue(item, column.key, type)}
                                      </TableCell>
                                    )
                                  })}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={rowIndex}>
                  {autoDetectedColumns.map((column) => {
                    const type = column.type || detectDataType(row[column.key])
                    return (
                      <TableCell key={`${rowIndex}-${column.key}`}>
                        {column.format ? column.format(row[column.key]) : renderCellValue(row, column.key, type)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={currentPageSize.toString()}
              onValueChange={(value) => {
                const newPageSize = Number.parseInt(value)
                setCurrentPageSize(newPageSize)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={currentPageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * currentPageSize + 1} to{" "}
            {Math.min(currentPage * currentPageSize, sortedAndGroupedData.length)} of {sortedAndGroupedData.length}{" "}
            results
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select value={currentPage.toString()} onValueChange={(value) => handlePageChange(Number.parseInt(value))}>
              <SelectTrigger className="w-16">
                <SelectValue placeholder={currentPage} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground">of {totalPages}</span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

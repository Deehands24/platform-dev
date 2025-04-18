"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FuturisticButton } from "./futuristic-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FocusTrap } from "@/components/ui/focus-trap"
import { X, Upload, FileJson, Database, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface DataImportDialogProps {
  onDataImported: (data: any[], options: ImportOptions) => void
  tableColumns?: string[]
}

export interface ImportOptions {
  hasHeaders: boolean
  skipEmptyRows: boolean
  trimValues: boolean
  mapToColumns?: Record<string, string>
}

export function DataImportDialog({ onDataImported, tableColumns = [] }: DataImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"json" | "sql" | "csv">("json")
  const [inputValue, setInputValue] = useState("")
  const [parsedData, setParsedData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<ImportOptions>({
    hasHeaders: true,
    skipEmptyRows: true,
    trimValues: true,
  })
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const handleImport = () => {
    if (!inputValue.trim()) {
      setError("Please enter some data to import")
      return
    }

    try {
      let data: any[] = []

      if (activeTab === "json") {
        data = parseJsonInput(inputValue)
      } else if (activeTab === "sql") {
        data = parseSqlInput(inputValue)
      } else if (activeTab === "csv") {
        data = parseCsvInput(inputValue, options.hasHeaders)
      }

      if (!Array.isArray(data) || data.length === 0) {
        setError("No valid data found. Please check your input.")
        return
      }

      setParsedData(data)
      setError(null)

      // If we have table columns and the data has different column names, show mapping UI
      const dataColumns = Object.keys(data[0])
      const needsMapping =
        tableColumns.length > 0 &&
        !tableColumns.every((col) => dataColumns.includes(col)) &&
        !dataColumns.every((col) => tableColumns.includes(col))

      if (!needsMapping) {
        // No mapping needed, proceed with import
        onDataImported(data, options)
        setIsOpen(false)
        setInputValue("")
        setParsedData(null)
        toast({
          title: "Data imported successfully",
          description: `${data.length} records imported`,
        })
      }
    } catch (err) {
      setError(`Error parsing data: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const parseJsonInput = (input: string): any[] => {
    try {
      const parsed = JSON.parse(input)

      // Handle different JSON formats
      if (Array.isArray(parsed)) {
        return parsed
      } else if (typeof parsed === "object" && parsed !== null) {
        // Check if it's an object with a data array property
        if (parsed.data && Array.isArray(parsed.data)) {
          return parsed.data
        }

        // Check if it's an object with array values
        const arrayValues = Object.values(parsed).find((val) => Array.isArray(val))
        if (arrayValues) {
          return arrayValues
        }

        // If it's just a single object, wrap it in an array
        return [parsed]
      }

      throw new Error("Invalid JSON format. Expected an array or object.")
    } catch (err) {
      throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const parseSqlInput = (input: string): any[] => {
    // Basic SQL INSERT statement parser
    try {
      // Check if it's an INSERT statement
      const insertRegex =
        /INSERT\s+INTO\s+`?(\w+)`?\s*$$([^)]+)$$\s*VALUES\s*($$(?:[^)(]+|\([^)(]*$$)*\)(?:\s*,\s*$$(?:[^)(]+|\([^)(]*$$)*\))*)/i
      const match = input.match(insertRegex)

      if (!match) {
        throw new Error("Only INSERT statements are supported")
      }

      const tableName = match[1]
      const columns = match[2].split(",").map((col) => col.trim().replace(/[`'"]/g, ""))

      // Extract all value sets
      const valuesString = match[3]
      const valueRegex = /$$([^)(]+|\([^)(]*$$)*\)/g
      const valueMatches = [...valuesString.matchAll(valueRegex)]

      const result = valueMatches.map((valueMatch) => {
        // Parse individual values, handling quoted strings and other types
        const valueString = valueMatch[0].substring(1, valueMatch[0].length - 1)
        const values = parseValues(valueString)

        // Create object with column names as keys
        const row: Record<string, any> = {}
        columns.forEach((col, index) => {
          if (index < values.length) {
            row[col] = values[index]
          }
        })

        return row
      })

      return result
    } catch (err) {
      throw new Error(`SQL parsing error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // Helper function to parse SQL values
  const parseValues = (valuesString: string): any[] => {
    const values: any[] = []
    let currentValue = ""
    let inQuote = false
    let quoteChar = ""

    for (let i = 0; i < valuesString.length; i++) {
      const char = valuesString[i]

      if ((char === "'" || char === '"') && (i === 0 || valuesString[i - 1] !== "\\")) {
        if (!inQuote) {
          inQuote = true
          quoteChar = char
        } else if (char === quoteChar) {
          inQuote = false
        } else {
          currentValue += char
        }
      } else if (char === "," && !inQuote) {
        // End of value
        values.push(parseValue(currentValue.trim()))
        currentValue = ""
      } else {
        currentValue += char
      }
    }

    // Add the last value
    if (currentValue.trim()) {
      values.push(parseValue(currentValue.trim()))
    }

    return values
  }

  // Parse individual SQL value
  const parseValue = (value: string): any => {
    // Remove quotes from string values
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      return value.substring(1, value.length - 1)
    }

    // Handle NULL
    if (value.toUpperCase() === "NULL") {
      return null
    }

    // Handle numbers
    if (!isNaN(Number(value))) {
      return Number(value)
    }

    // Handle booleans
    if (value.toUpperCase() === "TRUE") return true
    if (value.toUpperCase() === "FALSE") return false

    // Default to string
    return value
  }

  const parseCsvInput = (input: string, hasHeaders: boolean): any[] => {
    const lines = input.split(/\r?\n/).filter((line) => (options.skipEmptyRows ? line.trim() !== "" : true))

    if (lines.length === 0) {
      throw new Error("No data found in CSV")
    }

    // Parse header row or generate column names
    const headerLine = lines[0]
    const headers = headerLine.split(",").map((header) => (options.trimValues ? header.trim() : header))

    // Start from index 1 if we have headers
    const startIndex = hasHeaders ? 1 : 0

    // Parse data rows
    const data = []
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i]
      const values = line.split(",").map((val) => (options.trimValues ? val.trim() : val))

      const row: Record<string, any> = {}
      for (let j = 0; j < values.length; j++) {
        const columnName = hasHeaders ? headers[j] : `Column${j + 1}`
        let value = values[j]

        // Try to parse numbers and booleans
        if (value.toLowerCase() === "true") value = true
        else if (value.toLowerCase() === "false") value = false
        else if (!isNaN(Number(value))) value = Number(value)

        row[columnName] = value
      }

      data.push(row)
    }

    return data
  }

  const handleApplyMapping = () => {
    if (!parsedData) return

    // Apply column mapping to the data
    const mappedData = parsedData.map((row) => {
      const newRow: Record<string, any> = {}

      Object.entries(columnMapping).forEach(([sourceCol, targetCol]) => {
        if (targetCol && row[sourceCol] !== undefined) {
          newRow[targetCol] = row[sourceCol]
        }
      })

      return newRow
    })

    onDataImported(mappedData, {
      ...options,
      mapToColumns: columnMapping,
    })

    setIsOpen(false)
    setInputValue("")
    setParsedData(null)
    toast({
      title: "Data imported successfully",
      description: `${mappedData.length} records imported with column mapping`,
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputValue(content || "")

      // Auto-detect format based on file extension
      const extension = file.name.split(".").pop()?.toLowerCase()
      if (extension === "json") setActiveTab("json")
      else if (extension === "sql") setActiveTab("sql")
      else if (extension === "csv") setActiveTab("csv")
    }
    reader.readAsText(file)
  }

  // If dialog is not open, just show the button
  if (!isOpen) {
    return (
      <FuturisticButton className="glass-button" onClick={() => setIsOpen(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Import Data
      </FuturisticButton>
    )
  }

  // If we have parsed data and need column mapping
  if (parsedData && tableColumns.length > 0) {
    const dataColumns = Object.keys(parsedData[0])

    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

        {/* Dialog content */}
        <FocusTrap>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mapping-dialog-title"
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-700/50 bg-gray-800/90 p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg glass-card"
            style={{ maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}
          >
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 id="mapping-dialog-title" className="text-lg font-semibold leading-none tracking-tight text-gray-100">
                Map Columns
              </h2>
              <p className="text-sm text-gray-300">Map the columns from your imported data to the table columns</p>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-2">Source Columns</h3>
                  <div className="space-y-2">
                    {dataColumns.map((column) => (
                      <Badge key={column} variant="outline" className="mr-2">
                        {column}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-200 mb-2">Target Columns</h3>
                  <div className="space-y-2">
                    {tableColumns.map((column) => (
                      <Badge key={column} variant="secondary" className="mr-2">
                        {column}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700/50 pt-4">
                <h3 className="text-sm font-medium text-gray-200 mb-2">Column Mapping</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {dataColumns.map((sourceCol) => (
                    <div key={sourceCol} className="flex items-center justify-between">
                      <span className="text-gray-300">{sourceCol}</span>
                      <span className="text-gray-500 mx-2">→</span>
                      <select
                        className="glass-select bg-gray-800/50 border border-gray-700/50 rounded-md p-1 text-sm"
                        value={columnMapping[sourceCol] || ""}
                        onChange={(e) => {
                          setColumnMapping({
                            ...columnMapping,
                            [sourceCol]: e.target.value,
                          })
                        }}
                      >
                        <option value="">-- Skip this column --</option>
                        {tableColumns.map((targetCol) => (
                          <option key={targetCol} value={targetCol}>
                            {targetCol}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-700/50 pt-4">
                <h3 className="text-sm font-medium text-gray-200 mb-2">Preview</h3>
                <div className="max-h-[200px] overflow-y-auto border border-gray-700/50 rounded-md p-2 bg-gray-900/50">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(parsedData.slice(0, 3), null, 2)}
                    {parsedData.length > 3 && "\n..."}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <FuturisticButton
                variant="outline"
                onClick={() => {
                  setParsedData(null)
                  setColumnMapping({})
                }}
                className="mt-2 sm:mt-0"
              >
                Back
              </FuturisticButton>
              <FuturisticButton onClick={handleApplyMapping}>Apply Mapping</FuturisticButton>
            </div>

            {/* Close button */}
            <button
              className="absolute right-4 top-4 rounded-full p-1 text-gray-300 opacity-70 hover:bg-gray-700/50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </FocusTrap>
      </>
    )
  }

  // Main import dialog
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Dialog content */}
      <FocusTrap>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-dialog-title"
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-700/50 bg-gray-800/90 p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg glass-card"
          style={{ maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}
        >
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <h2 id="import-dialog-title" className="text-lg font-semibold leading-none tracking-tight text-gray-100">
              Import Data
            </h2>
            <p className="text-sm text-gray-300">Import data from JSON, SQL, or CSV format</p>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-gray-300 hover:text-gray-100">
                  <Upload className="h-4 w-4" />
                  <span>Upload file</span>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,.sql,.csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <div className="flex gap-2">
                <Badge
                  variant={activeTab === "json" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveTab("json")}
                >
                  <FileJson className="h-3 w-3 mr-1" />
                  JSON
                </Badge>
                <Badge
                  variant={activeTab === "sql" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveTab("sql")}
                >
                  <Database className="h-3 w-3 mr-1" />
                  SQL
                </Badge>
                <Badge
                  variant={activeTab === "csv" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveTab("csv")}
                >
                  <FileJson className="h-3 w-3 mr-1" />
                  CSV
                </Badge>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="sql">SQL</TabsTrigger>
                <TabsTrigger value="csv">CSV</TabsTrigger>
              </TabsList>

              <TabsContent value="json" className="space-y-4">
                <Textarea
                  ref={textareaRef}
                  className="glass-input min-h-[300px] font-mono text-sm"
                  placeholder={`Paste your JSON data here...\n\nExample:\n[\n  {\n    "id": 1,\n    "name": "John Doe",\n    "email": "john@example.com"\n  }\n]`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />

                <div className="text-sm text-gray-300">
                  <p>Supported formats:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>
                      Array of objects:{" "}
                      <code className="text-xs bg-gray-900/50 px-1 rounded">
                        [{"{...}"}, {"{...}"}]
                      </code>
                    </li>
                    <li>
                      Object with data array:{" "}
                      <code className="text-xs bg-gray-900/50 px-1 rounded">{'{ "data": [{...}, {...}] }'}</code>
                    </li>
                    <li>
                      Single object: <code className="text-xs bg-gray-900/50 px-1 rounded">{"{...}"}</code>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="sql" className="space-y-4">
                <Textarea
                  ref={textareaRef}
                  className="glass-input min-h-[300px] font-mono text-sm"
                  placeholder={`Paste your SQL INSERT statement here...\n\nExample:\nINSERT INTO users (id, name, email) VALUES\n(1, 'John Doe', 'john@example.com'),\n(2, 'Jane Smith', 'jane@example.com');`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />

                <div className="text-sm text-gray-300">
                  <p>Supported format:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>INSERT statements with column names and values</li>
                    <li>Multiple rows in a single statement</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="csv" className="space-y-4">
                <Textarea
                  ref={textareaRef}
                  className="glass-input min-h-[300px] font-mono text-sm"
                  placeholder={`Paste your CSV data here...\n\nExample:\nid,name,email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasHeaders"
                      checked={options.hasHeaders}
                      onCheckedChange={(checked) => setOptions({ ...options, hasHeaders: checked === true })}
                    />
                    <Label htmlFor="hasHeaders" className="text-gray-300">
                      First row contains headers
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skipEmptyRows"
                      checked={options.skipEmptyRows}
                      onCheckedChange={(checked) => setOptions({ ...options, skipEmptyRows: checked === true })}
                    />
                    <Label htmlFor="skipEmptyRows" className="text-gray-300">
                      Skip empty rows
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trimValues"
                      checked={options.trimValues}
                      onCheckedChange={(checked) => setOptions({ ...options, trimValues: checked === true })}
                    />
                    <Label htmlFor="trimValues" className="text-gray-300">
                      Trim whitespace from values
                    </Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <FuturisticButton variant="outline" onClick={() => setIsOpen(false)} className="mt-2 sm:mt-0">
              Cancel
            </FuturisticButton>
            <FuturisticButton onClick={handleImport}>Import Data</FuturisticButton>
          </div>

          {/* Close button */}
          <button
            className="absolute right-4 top-4 rounded-full p-1 text-gray-300 opacity-70 hover:bg-gray-700/50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </FocusTrap>
    </>
  )
}

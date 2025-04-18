"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { type Database, type Table, type TableColumn, ColumnType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Table2, Key, DatabaseIcon } from "lucide-react"
import DynamicTable from "./dynamic-table"
// Add the import for DataImportDialog at the top of the file
import { DataImportDialog } from "./data-import-dialog"

interface TableManagerProps {
  activeDatabase: Database | null
  onSelectTable: (table: Table | null) => void
  activeTable: Table | null
}

export default function TableManager({ activeDatabase, onSelectTable, activeTable }: TableManagerProps) {
  const { createTable, updateTable, deleteTable, addColumn, updateColumn, deleteColumn, addRow, updateRow, deleteRow } =
    useStore()
  const [newTableName, setNewTableName] = useState("")
  const [newTableDescription, setNewTableDescription] = useState("")
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState<ColumnType>(ColumnType.Text)
  const [newColumnIsPrimary, setNewColumnIsPrimary] = useState(false)
  const [newColumnIsRequired, setNewColumnIsRequired] = useState(false)
  const [editingColumn, setEditingColumn] = useState<TableColumn | null>(null)
  const [activeTab, setActiveTab] = useState("structure")
  const [newRowData, setNewRowData] = useState<Record<string, any>>({})

  // Reset active table if database changes
  useEffect(() => {
    if (!activeDatabase || (activeTable && activeTable.databaseId !== activeDatabase.databaseId)) {
      onSelectTable(null)
    }
  }, [activeDatabase, activeTable, onSelectTable])

  const handleCreateTable = () => {
    if (!activeDatabase || !newTableName.trim()) return

    const newTable = createTable(activeDatabase.databaseId, newTableName, newTableDescription)
    setNewTableName("")
    setNewTableDescription("")
    onSelectTable(newTable)
  }

  const handleUpdateTable = () => {
    if (!editingTable || !editingTable.name.trim()) return

    updateTable(editingTable)
    setEditingTable(null)
  }

  const handleDeleteTable = (tableId: number) => {
    if (!activeDatabase) return

    deleteTable(activeDatabase.databaseId, tableId)
    if (activeTable?.tableId === tableId) {
      onSelectTable(null)
    }
  }

  const handleAddColumn = () => {
    if (!activeTable || !newColumnName.trim()) return

    const newColumn = addColumn(activeTable.tableId, {
      name: newColumnName,
      type: newColumnType,
      isPrimaryKey: newColumnIsPrimary,
      isRequired: newColumnIsRequired,
    })

    setNewColumnName("")
    setNewColumnType(ColumnType.Text)
    setNewColumnIsPrimary(false)
    setNewColumnIsRequired(false)

    // Update the active table
    const updatedTable = activeDatabase?.tables.find((t) => t.tableId === activeTable.tableId)
    if (updatedTable) {
      onSelectTable(updatedTable)
    }
  }

  const handleUpdateColumn = () => {
    if (!editingColumn || !editingColumn.name.trim()) return

    updateColumn(editingColumn)
    setEditingColumn(null)

    // Update the active table
    const updatedTable = activeDatabase?.tables.find((t) => t.tableId === activeTable?.tableId)
    if (updatedTable) {
      onSelectTable(updatedTable)
    }
  }

  const handleDeleteColumn = (columnId: number) => {
    if (!activeTable) return

    deleteColumn(activeTable.tableId, columnId)

    // Update the active table
    const updatedTable = activeDatabase?.tables.find((t) => t.tableId === activeTable.tableId)
    if (updatedTable) {
      onSelectTable(updatedTable)
    }
  }

  const handleAddRow = () => {
    if (!activeTable) return

    addRow(activeTable.tableId, newRowData)
    setNewRowData({})

    // Update the active table
    const updatedTable = activeDatabase?.tables.find((t) => t.tableId === activeTable.tableId)
    if (updatedTable) {
      onSelectTable(updatedTable)
    }
  }

  const getColumnTypeName = (type: ColumnType): string => {
    switch (type) {
      case ColumnType.Text:
        return "Text"
      case ColumnType.Number:
        return "Number"
      case ColumnType.Boolean:
        return "Boolean"
      case ColumnType.Date:
        return "Date"
      case ColumnType.Select:
        return "Select"
      case ColumnType.Reference:
        return "Reference"
      case ColumnType.File:
        return "File"
      default:
        return "Unknown"
    }
  }

  // Convert table data to format for DynamicTable
  const tableData =
    activeTable?.rows.map((row) => {
      const rowData: Record<string, any> = { id: row.rowId }
      activeTable.columns.forEach((column) => {
        rowData[column.name] = row.data[column.columnId] || null
      })
      return rowData
    }) || []

  // Create columns config for DynamicTable
  const tableColumns =
    activeTable?.columns.map((column) => ({
      key: column.name,
      label: column.name,
      type: getColumnTypeName(column.type).toLowerCase() as any,
      sortable: true,
    })) || []

  return (
    <div className="space-y-4">
      {!activeDatabase ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <DatabaseIcon className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No database selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">Please select a database to manage tables.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Tables in {activeDatabase.name}</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Table</DialogTitle>
                  <DialogDescription>Enter the details for your new table.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="table-name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="table-name"
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      placeholder="Table name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="table-description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="table-description"
                      value={newTableDescription}
                      onChange={(e) => setNewTableDescription(e.target.value)}
                      placeholder="Table description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTable}>Create Table</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Table List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-350px)]">
                    <div className="space-y-2">
                      {activeDatabase.tables.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No tables yet</p>
                          <p className="text-sm">Create your first table to get started</p>
                        </div>
                      ) : (
                        activeDatabase.tables.map((table) => (
                          <div
                            key={table.tableId}
                            className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
                              activeTable?.tableId === table.tableId
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => onSelectTable(table)}
                          >
                            <div className="flex items-center">
                              <Table2 className="h-4 w-4 mr-2" />
                              <span>{table.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={activeTable?.tableId === table.tableId ? "hover:bg-primary/20" : ""}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingTable({ ...table })
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={activeTable?.tableId === table.tableId ? "hover:bg-primary/20" : ""}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the table and all its data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTable(table.tableId)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Table Details */}
            <div className="lg:col-span-3">
              {!activeTable ? (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <Table2 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No table selected</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Select a table from the list or create a new one.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{activeTable.name}</CardTitle>
                    <CardDescription>{activeTable.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="structure">Structure</TabsTrigger>
                        <TabsTrigger value="data">Data</TabsTrigger>
                      </TabsList>

                      <TabsContent value="structure" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Columns</h3>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Column
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add New Column</DialogTitle>
                                <DialogDescription>Define the properties for your new column.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label htmlFor="column-name" className="text-sm font-medium">
                                    Name
                                  </label>
                                  <Input
                                    id="column-name"
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    placeholder="Column name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="column-type" className="text-sm font-medium">
                                    Type
                                  </label>
                                  <Select
                                    value={newColumnType.toString()}
                                    onValueChange={(value) => setNewColumnType(Number(value) as ColumnType)}
                                  >
                                    <SelectTrigger id="column-type">
                                      <SelectValue placeholder="Select column type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={ColumnType.Text.toString()}>Text</SelectItem>
                                      <SelectItem value={ColumnType.Number.toString()}>Number</SelectItem>
                                      <SelectItem value={ColumnType.Boolean.toString()}>Boolean</SelectItem>
                                      <SelectItem value={ColumnType.Date.toString()}>Date</SelectItem>
                                      <SelectItem value={ColumnType.Select.toString()}>Select</SelectItem>
                                      <SelectItem value={ColumnType.Reference.toString()}>Reference</SelectItem>
                                      <SelectItem value={ColumnType.File.toString()}>File</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="column-primary"
                                    checked={newColumnIsPrimary}
                                    onCheckedChange={setNewColumnIsPrimary}
                                  />
                                  <Label htmlFor="column-primary">Primary Key</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="column-required"
                                    checked={newColumnIsRequired}
                                    onCheckedChange={setNewColumnIsRequired}
                                  />
                                  <Label htmlFor="column-required">Required</Label>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleAddColumn}>Add Column</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {activeTable.columns.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed rounded-md">
                            <p className="text-muted-foreground">No columns defined yet</p>
                            <p className="text-sm text-muted-foreground">Add columns to define your table structure</p>
                          </div>
                        ) : (
                          <div className="border rounded-md">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="px-4 py-2 text-left">Name</th>
                                  <th className="px-4 py-2 text-left">Type</th>
                                  <th className="px-4 py-2 text-left">Attributes</th>
                                  <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activeTable.columns.map((column) => (
                                  <tr key={column.columnId} className="border-b">
                                    <td className="px-4 py-2">
                                      <div className="flex items-center">
                                        {column.isPrimaryKey && <Key className="h-3 w-3 mr-2 text-amber-500" />}
                                        {column.name}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2">{getColumnTypeName(column.type)}</td>
                                    <td className="px-4 py-2">
                                      {column.isRequired && (
                                        <span className="text-xs bg-muted px-2 py-1 rounded">Required</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                      <div className="flex justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingColumn({ ...column })}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will permanently delete the column and all its data.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeleteColumn(column.columnId)}>
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="data" className="space-y-4">
                        {activeTable.columns.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed rounded-md">
                            <p className="text-muted-foreground">No columns defined yet</p>
                            <p className="text-sm text-muted-foreground">Add columns in the Structure tab first</p>
                          </div>
                        ) : (
                          <>
                            {/* Update the div with the "Add Row" button to include the DataImportDialog */}
                            {/* Find this section in the code: */}
                            {/* <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium">Table Data</h3>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Row
                                  </Button>
                                </DialogTrigger> */}

                            {/* Replace it with: */}
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium">Table Data</h3>
                              <div className="flex gap-2">
                                <DataImportDialog
                                  onDataImported={(data, options) => {
                                    // Add each row from the imported data
                                    data.forEach((row) => {
                                      // Convert the flat data structure to the column-based structure
                                      const rowData: Record<string, any> = {}
                                      activeTable.columns.forEach((column) => {
                                        if (row[column.name] !== undefined) {
                                          rowData[column.columnId] = row[column.name]
                                        }
                                      })

                                      // Add the row to the table
                                      addRow(activeTable.tableId, rowData)
                                    })

                                    // Update the active table
                                    const updatedTable = activeDatabase?.tables.find(
                                      (t) => t.tableId === activeTable.tableId,
                                    )
                                    if (updatedTable) {
                                      onSelectTable(updatedTable)
                                    }
                                  }}
                                  tableColumns={activeTable.columns.map((col) => col.name)}
                                />
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Row
                                    </Button>
                                  </DialogTrigger>

                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Add New Row</DialogTitle>
                                      <DialogDescription>
                                        Enter values for each column in the new row.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      {activeTable.columns.map((column) => (
                                        <div key={column.columnId} className="space-y-2">
                                          <label htmlFor={`column-${column.columnId}`} className="text-sm font-medium">
                                            {column.name} {column.isRequired && <span className="text-red-500">*</span>}
                                          </label>
                                          {column.type === ColumnType.Boolean ? (
                                            <div className="flex items-center space-x-2">
                                              <Switch
                                                id={`column-${column.columnId}`}
                                                checked={!!newRowData[column.columnId]}
                                                onCheckedChange={(checked) =>
                                                  setNewRowData({ ...newRowData, [column.columnId]: checked })
                                                }
                                              />
                                              <Label htmlFor={`column-${column.columnId}`}>
                                                {newRowData[column.columnId] ? "Yes" : "No"}
                                              </Label>
                                            </div>
                                          ) : column.type === ColumnType.Date ? (
                                            <Input
                                              id={`column-${column.columnId}`}
                                              type="date"
                                              value={newRowData[column.columnId] || ""}
                                              onChange={(e) =>
                                                setNewRowData({ ...newRowData, [column.columnId]: e.target.value })
                                              }
                                              required={column.isRequired}
                                            />
                                          ) : column.type === ColumnType.Number ? (
                                            <Input
                                              id={`column-${column.columnId}`}
                                              type="number"
                                              value={newRowData[column.columnId] || ""}
                                              onChange={(e) =>
                                                setNewRowData({ ...newRowData, [column.columnId]: e.target.value })
                                              }
                                              required={column.isRequired}
                                            />
                                          ) : (
                                            <Input
                                              id={`column-${column.columnId}`}
                                              value={newRowData[column.columnId] || ""}
                                              onChange={(e) =>
                                                setNewRowData({ ...newRowData, [column.columnId]: e.target.value })
                                              }
                                              required={column.isRequired}
                                            />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={handleAddRow}>Add Row</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>

                            <DynamicTable
                              data={tableData}
                              columns={tableColumns}
                              pageSize={10}
                              filterable={true}
                              groupable={true}
                            />
                          </>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Table Dialog */}
      <Dialog open={!!editingTable} onOpenChange={(open) => !open && setEditingTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>Update the details for your table.</DialogDescription>
          </DialogHeader>
          {editingTable && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-table-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="edit-table-name"
                  value={editingTable.name}
                  onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
                  placeholder="Table name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-table-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="edit-table-description"
                  value={editingTable.description}
                  onChange={(e) => setEditingTable({ ...editingTable, description: e.target.value })}
                  placeholder="Table description"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateTable}>Update Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog open={!!editingColumn} onOpenChange={(open) => !open && setEditingColumn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
            <DialogDescription>Update the properties for your column.</DialogDescription>
          </DialogHeader>
          {editingColumn && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-column-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="edit-column-name"
                  value={editingColumn.name}
                  onChange={(e) => setEditingColumn({ ...editingColumn, name: e.target.value })}
                  placeholder="Column name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-column-type" className="text-sm font-medium">
                  Type
                </label>
                <Select
                  value={editingColumn.type.toString()}
                  onValueChange={(value) => setEditingColumn({ ...editingColumn, type: Number(value) as ColumnType })}
                >
                  <SelectTrigger id="edit-column-type">
                    <SelectValue placeholder="Select column type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ColumnType.Text.toString()}>Text</SelectItem>
                    <SelectItem value={ColumnType.Number.toString()}>Number</SelectItem>
                    <SelectItem value={ColumnType.Boolean.toString()}>Boolean</SelectItem>
                    <SelectItem value={ColumnType.Date.toString()}>Date</SelectItem>
                    <SelectItem value={ColumnType.Select.toString()}>Select</SelectItem>
                    <SelectItem value={ColumnType.Reference.toString()}>Reference</SelectItem>
                    <SelectItem value={ColumnType.File.toString()}>File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-column-primary"
                  checked={editingColumn.isPrimaryKey}
                  onCheckedChange={(checked) => setEditingColumn({ ...editingColumn, isPrimaryKey: checked })}
                />
                <Label htmlFor="edit-column-primary">Primary Key</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-column-required"
                  checked={editingColumn.isRequired}
                  onCheckedChange={(checked) => setEditingColumn({ ...editingColumn, isRequired: checked })}
                />
                <Label htmlFor="edit-column-required">Required</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateColumn}>Update Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

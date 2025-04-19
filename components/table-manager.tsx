"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { type Database, type Table, type TableColumn, ColumnType } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FuturisticCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/futuristic-card"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, Table2, Key, DatabaseIcon } from "lucide-react"
import DynamicTable from "./dynamic-table"
import { DataImportDialog } from "./data-import-dialog"
import { FuturisticButton } from "./futuristic-button"
import { ExtendedColumnTypeSelectComponent } from "./extended-column-type-select"

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
  const [isNewTableDialogOpen, setIsNewTableDialogOpen] = useState(false)

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
    setIsNewTableDialogOpen(false)
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
        <div className="text-center py-12 border border-gray-700/30 rounded-lg backdrop-blur-sm bg-gray-800/20">
          <DatabaseIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-300">No database selected</h3>
          <p className="mt-1 text-sm text-gray-400">Please select a database to manage tables.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              Tables in {activeDatabase.name}
            </h2>
            <Dialog open={isNewTableDialogOpen} onOpenChange={setIsNewTableDialogOpen}>
              <DialogTrigger asChild>
                <FuturisticButton className="text-white" onClick={() => setIsNewTableDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Table
                </FuturisticButton>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Create New Table</DialogTitle>
                  <DialogDescription className="text-gray-300">Enter the details for your new table.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="table-name" className="text-sm font-medium text-gray-200">
                      Name
                    </label>
                    <Input
                      id="table-name"
                      className="glass-input"
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      placeholder="Table name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="table-description" className="text-sm font-medium text-gray-200">
                      Description
                    </label>
                    <Textarea
                      id="table-description"
                      className="glass-input"
                      value={newTableDescription}
                      onChange={(e) => setNewTableDescription(e.target.value)}
                      placeholder="Table description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <FuturisticButton onClick={handleCreateTable}>Create Table</FuturisticButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Table List */}
            <div className="lg:col-span-1">
              <FuturisticCard className="h-full">
                <CardHeader>
                  <CardTitle className="text-gray-100">Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-350px)]">
                    <div className="space-y-2">
                      {activeDatabase.tables.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <p>No tables yet</p>
                          <p className="text-sm">Create your first table to get started</p>
                        </div>
                      ) : (
                        activeDatabase.tables.map((table) => (
                          <div
                            key={table.tableId}
                            className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
                              activeTable?.tableId === table.tableId ? "bg-white/15 text-white" : "hover:bg-white/10"
                            }`}
                            onClick={() => onSelectTable(table)}
                          >
                            <div className="flex items-center">
                              <Table2 className="h-4 w-4 mr-2" />
                              <span>{table.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <FuturisticButton
                                variant="ghost"
                                size="icon"
                                className="hover:bg-white/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingTable({ ...table })
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </FuturisticButton>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <FuturisticButton
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-white/10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </FuturisticButton>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="glass-card">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-gray-100">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-300">
                                      This will permanently delete the table and all its data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="glass-button bg-red-500/20"
                                      onClick={() => handleDeleteTable(table.tableId)}
                                    >
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
              </FuturisticCard>
            </div>

            {/* Table Details */}
            <div className="lg:col-span-3">
              {!activeTable ? (
                <FuturisticCard className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <Table2 className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-300">No table selected</h3>
                    <p className="mt-1 text-sm text-gray-400">Select a table from the list or create a new one.</p>
                  </CardContent>
                </FuturisticCard>
              ) : (
                <FuturisticCard>
                  <CardHeader>
                    <CardTitle className="text-gray-100">{activeTable.name}</CardTitle>
                    <CardDescription className="text-gray-300">{activeTable.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-list-futuristic">
                      <TabsList className="mb-4 tabs-list-futuristic">
                        <TabsTrigger value="structure" className="tab-trigger-futuristic">
                          Structure
                        </TabsTrigger>
                        <TabsTrigger value="data" className="tab-trigger-futuristic">
                          Data
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="structure" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-200">Columns</h3>
                          <Dialog>
                            <DialogTrigger asChild>
                              <FuturisticButton size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Column
                              </FuturisticButton>
                            </DialogTrigger>
                            <DialogContent className="glass-card">
                              <DialogHeader>
                                <DialogTitle className="text-gray-100">Add New Column</DialogTitle>
                                <DialogDescription className="text-gray-300">
                                  Define the properties for your new column.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label htmlFor="column-name" className="text-sm font-medium text-gray-200">
                                    Name
                                  </label>
                                  <Input
                                    id="column-name"
                                    className="glass-input"
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    placeholder="Column name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="column-type" className="text-sm font-medium text-gray-200">
                                    Type
                                  </label>
                                  <ExtendedColumnTypeSelectComponent
                                    id="column-type"
                                    className="glass-input"
                                    value={newColumnType.toString()}
                                    onValueChange={(value) => setNewColumnType(Number(value) as ColumnType)}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="column-primary"
                                    checked={newColumnIsPrimary}
                                    onCheckedChange={setNewColumnIsPrimary}
                                  />
                                  <Label htmlFor="column-primary" className="text-gray-200">
                                    Primary Key
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id="column-required"
                                    checked={newColumnIsRequired}
                                    onCheckedChange={setNewColumnIsRequired}
                                  />
                                  <Label htmlFor="column-required" className="text-gray-200">
                                    Required
                                  </Label>
                                </div>
                              </div>
                              <DialogFooter>
                                <FuturisticButton onClick={handleAddColumn}>Add Column</FuturisticButton>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {activeTable.columns.length === 0 ? (
                          <div className="text-center py-8 border border-gray-700/30 rounded-md backdrop-blur-sm bg-gray-800/20">
                            <p className="text-gray-300">No columns defined yet</p>
                            <p className="text-sm text-gray-400">Add columns to define your table structure</p>
                          </div>
                        ) : (
                          <div className="border border-gray-700/30 rounded-md glass-table">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-700/30">
                                  <th className="px-4 py-2 text-left text-gray-200">Name</th>
                                  <th className="px-4 py-2 text-left text-gray-200">Type</th>
                                  <th className="px-4 py-2 text-left text-gray-200">Attributes</th>
                                  <th className="px-4 py-2 text-right text-gray-200">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activeTable.columns.map((column) => (
                                  <tr key={column.columnId} className="border-b border-gray-700/30">
                                    <td className="px-4 py-2 text-gray-300">
                                      <div className="flex items-center">
                                        {column.isPrimaryKey && <Key className="h-3 w-3 mr-2 text-amber-500" />}
                                        {column.name}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-gray-300">{getColumnTypeName(column.type)}</td>
                                    <td className="px-4 py-2 text-gray-300">
                                      {column.isRequired && (
                                        <span className="text-xs bg-gray-700/50 px-2 py-1 rounded">Required</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                      <div className="flex justify-end gap-1">
                                        <FuturisticButton
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setEditingColumn({ ...column })}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </FuturisticButton>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <FuturisticButton variant="ghost" size="icon">
                                              <Trash2 className="h-4 w-4" />
                                            </FuturisticButton>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="glass-card">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-gray-100">
                                                Are you sure?
                                              </AlertDialogTitle>
                                              <AlertDialogDescription className="text-gray-300">
                                                This will permanently delete the column and all its data.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                className="glass-button bg-red-500/20"
                                                onClick={() => handleDeleteColumn(column.columnId)}
                                              >
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
                          <div className="text-center py-8 border border-gray-700/30 rounded-md backdrop-blur-sm bg-gray-800/20">
                            <p className="text-gray-300">No columns defined yet</p>
                            <p className="text-sm text-gray-400">Add columns in the Structure tab first</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium text-gray-200">Table Data</h3>
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
                                    <FuturisticButton size="sm">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Row
                                    </FuturisticButton>
                                  </DialogTrigger>

                                  <DialogContent className="glass-card">
                                    <DialogHeader>
                                      <DialogTitle className="text-gray-100">Add New Row</DialogTitle>
                                      <DialogDescription className="text-gray-300">
                                        Enter values for each column in the new row.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      {activeTable.columns.map((column) => (
                                        <div key={column.columnId} className="space-y-2">
                                          <label
                                            htmlFor={`column-${column.columnId}`}
                                            className="text-sm font-medium text-gray-200"
                                          >
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
                                              <Label htmlFor={`column-${column.columnId}`} className="text-gray-200">
                                                {newRowData[column.columnId] ? "Yes" : "No"}
                                              </Label>
                                            </div>
                                          ) : column.type === ColumnType.Date ? (
                                            <Input
                                              id={`column-${column.columnId}`}
                                              className="glass-input"
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
                                              className="glass-input"
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
                                              className="glass-input"
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
                                      <FuturisticButton onClick={handleAddRow}>Add Row</FuturisticButton>
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
                </FuturisticCard>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Table Dialog */}
      <Dialog open={!!editingTable} onOpenChange={(open) => !open && setEditingTable(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Edit Table</DialogTitle>
            <DialogDescription className="text-gray-300">Update the details for your table.</DialogDescription>
          </DialogHeader>
          {editingTable && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-table-name" className="text-sm font-medium text-gray-200">
                  Name
                </label>
                <Input
                  id="edit-table-name"
                  className="glass-input"
                  value={editingTable.name}
                  onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
                  placeholder="Table name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-table-description" className="text-sm font-medium text-gray-200">
                  Description
                </label>
                <Textarea
                  id="edit-table-description"
                  className="glass-input"
                  value={editingTable.description}
                  onChange={(e) => setEditingTable({ ...editingTable, description: e.target.value })}
                  placeholder="Table description"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <FuturisticButton onClick={handleUpdateTable}>Update Table</FuturisticButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog open={!!editingColumn} onOpenChange={(open) => !open && setEditingColumn(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Edit Column</DialogTitle>
            <DialogDescription className="text-gray-300">Update the properties for your column.</DialogDescription>
          </DialogHeader>
          {editingColumn && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-column-name" className="text-sm font-medium text-gray-200">
                  Name
                </label>
                <Input
                  id="edit-column-name"
                  className="glass-input"
                  value={editingColumn.name}
                  onChange={(e) => setEditingColumn({ ...editingColumn, name: e.target.value })}
                  placeholder="Column name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-column-type" className="text-sm font-medium text-gray-200">
                  Type
                </label>
                <ExtendedColumnTypeSelectComponent
                  id="edit-column-type"
                  className="glass-input"
                  value={editingColumn.type.toString()}
                  onValueChange={(value) => setEditingColumn({ ...editingColumn, type: Number(value) as ColumnType })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-column-primary"
                  checked={editingColumn.isPrimaryKey}
                  onCheckedChange={(checked) => setEditingColumn({ ...editingColumn, isPrimaryKey: checked })}
                />
                <Label htmlFor="edit-column-primary" className="text-gray-200">
                  Primary Key
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-column-required"
                  checked={editingColumn.isRequired}
                  onCheckedChange={(checked) => setEditingColumn({ ...editingColumn, isRequired: checked })}
                />
                <Label htmlFor="edit-column-required" className="text-gray-200">
                  Required
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <FuturisticButton onClick={handleUpdateColumn}>Update Column</FuturisticButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

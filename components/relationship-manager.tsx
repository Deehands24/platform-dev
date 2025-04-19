"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useStore } from "@/lib/store"
import { type Database, type Table, type Relationship, RelationshipType } from "@/lib/types"
import { FuturisticButton } from "@/components/futuristic-button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, DatabaseIcon, ArrowRight } from "lucide-react"

interface RelationshipManagerProps {
  activeDatabase: Database | null
}

export default function RelationshipManager({ activeDatabase }: RelationshipManagerProps) {
  const { createRelationship, updateRelationship, deleteRelationship } = useStore()
  const [newRelationship, setNewRelationship] = useState<Partial<Relationship>>({
    name: "",
    type: RelationshipType.OneToMany,
    sourceTableId: 0,
    sourceColumnId: 0,
    targetTableId: 0,
    targetColumnId: 0,
  })
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [tablePositions, setTablePositions] = useState<Record<number, { x: number; y: number }>>({})
  const [draggingTable, setDraggingTable] = useState<{ tableId: number; offsetX: number; offsetY: number } | null>(null)
  const [drawingRelationship, setDrawingRelationship] = useState<{
    sourceTableId: number
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
  } | null>(null)

  // Initialize table positions
  useEffect(() => {
    if (activeDatabase && canvasRef.current) {
      const canvas = canvasRef.current
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      setCanvasSize({ width, height })

      // Create initial positions for tables if they don't exist
      const positions: Record<number, { x: number; y: number }> = { ...tablePositions }
      let needsUpdate = false

      activeDatabase.tables.forEach((table, index) => {
        if (!positions[table.tableId]) {
          // Calculate position in a grid layout
          const cols = Math.ceil(Math.sqrt(activeDatabase.tables.length))
          const row = Math.floor(index / cols)
          const col = index % cols
          const spacing = 200
          const startX = width / 2 - ((cols - 1) * spacing) / 2
          const startY = 100

          positions[table.tableId] = {
            x: startX + col * spacing,
            y: startY + row * spacing,
          }
          needsUpdate = true
        }
      })

      if (needsUpdate) {
        setTablePositions(positions)
      }
    }
  }, [activeDatabase, canvasRef, tablePositions])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleCreateRelationship = () => {
    if (!activeDatabase) return

    if (
      !newRelationship.name ||
      !newRelationship.sourceTableId ||
      !newRelationship.targetTableId ||
      !newRelationship.sourceColumnId ||
      !newRelationship.targetColumnId
    ) {
      return
    }

    createRelationship({
      ...newRelationship,
      databaseId: activeDatabase.databaseId,
    })

    setNewRelationship({
      name: "",
      type: RelationshipType.OneToMany,
      sourceTableId: 0,
      sourceColumnId: 0,
      targetTableId: 0,
      targetColumnId: 0,
    })
  }

  const handleUpdateRelationship = () => {
    if (!editingRelationship) return

    updateRelationship(editingRelationship)
    setEditingRelationship(null)
  }

  const handleDeleteRelationship = (relationshipId: number) => {
    if (!activeDatabase) return

    deleteRelationship(activeDatabase.databaseId, relationshipId)
  }

  const getRelationshipTypeName = (type: RelationshipType): string => {
    switch (type) {
      case RelationshipType.OneToOne:
        return "One-to-One"
      case RelationshipType.OneToMany:
        return "One-to-Many"
      case RelationshipType.ManyToMany:
        return "Many-to-Many"
      default:
        return "Unknown"
    }
  }

  const getTableById = (tableId: number): Table | undefined => {
    return activeDatabase?.tables.find((t) => t.tableId === tableId)
  }

  const getColumnNameById = (tableId: number, columnId: number): string => {
    const table = getTableById(tableId)
    const column = table?.columns.find((c) => c.columnId === columnId)
    return column?.name || "Unknown"
  }

  const handleMouseDown = (e: React.MouseEvent, tableId: number) => {
    if (!tablePositions[tableId]) return

    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    setDraggingTable({ tableId, offsetX, offsetY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingTable && canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left - draggingTable.offsetX
      const y = e.clientY - rect.top - draggingTable.offsetY

      setTablePositions((prev) => ({
        ...prev,
        [draggingTable.tableId]: { x, y },
      }))
    }
  }

  const handleMouseUp = () => {
    setDraggingTable(null)
  }

  const handleStartDrawingRelationship = (e: React.MouseEvent, tableId: number) => {
    if (!tablePositions[tableId] || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const sourceX = tablePositions[tableId].x + 75 // Assuming table width is 150px
    const sourceY = tablePositions[tableId].y + 30 // Assuming table header height

    setDrawingRelationship({
      sourceTableId: tableId,
      sourceX,
      sourceY,
      targetX: e.clientX - rect.left,
      targetY: e.clientY - rect.top,
    })
  }

  const handleDrawRelationship = (e: React.MouseEvent) => {
    if (drawingRelationship && canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()

      setDrawingRelationship({
        ...drawingRelationship,
        targetX: e.clientX - rect.left,
        targetY: e.clientY - rect.top,
      })
    }
  }

  const handleFinishDrawingRelationship = (e: React.MouseEvent, targetTableId: number) => {
    if (!drawingRelationship || !activeDatabase) return

    // Only create relationship if source and target are different
    if (drawingRelationship.sourceTableId !== targetTableId) {
      // Find primary key columns for both tables
      const sourceTable = getTableById(drawingRelationship.sourceTableId)
      const targetTable = getTableById(targetTableId)

      const sourcePrimaryKey = sourceTable?.columns.find((c) => c.isPrimaryKey)
      const targetPrimaryKey = targetTable?.columns.find((c) => c.isPrimaryKey)

      if (sourcePrimaryKey && targetPrimaryKey) {
        setNewRelationship({
          name: `${sourceTable?.name || "Source"} to ${targetTable?.name || "Target"}`,
          type: RelationshipType.OneToMany,
          sourceTableId: drawingRelationship.sourceTableId,
          sourceColumnId: sourcePrimaryKey.columnId,
          targetTableId: targetTableId,
          targetColumnId: targetPrimaryKey.columnId,
        })

        // Open the dialog
        document.getElementById("create-relationship-trigger")?.click()
      }
    }

    setDrawingRelationship(null)
  }

  const renderRelationships = () => {
    if (!activeDatabase || !canvasRef.current) return null

    return activeDatabase.relationships.map((relationship) => {
      const sourcePos = tablePositions[relationship.sourceTableId]
      const targetPos = tablePositions[relationship.targetTableId]

      if (!sourcePos || !targetPos) return null

      // Calculate connection points
      const sourceX = sourcePos.x + 150 // Right side of source
      const sourceY = sourcePos.y + 30 // Middle of source
      const targetX = targetPos.x // Left side of target
      const targetY = targetPos.y + 30 // Middle of target

      // Draw arrow
      const path = `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${targetX - 50},${targetY} ${targetX},${targetY}`

      // Determine marker based on relationship type
      let markerEnd = "url(#arrow)"
      if (relationship.type === RelationshipType.OneToMany) {
        markerEnd = "url(#arrow-many)"
      } else if (relationship.type === RelationshipType.ManyToMany) {
        markerEnd = "url(#arrow-many-many)"
      }

      return (
        <g key={relationship.relationshipId}>
          <path d={path} stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" fill="none" markerEnd={markerEnd} />
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 10}
            textAnchor="middle"
            className="text-xs fill-white bg-gray-800/50 px-1"
          >
            {relationship.name}
          </text>
        </g>
      )
    })
  }

  const handleNewRelationshipClick = () => {
    document.getElementById("create-relationship-trigger")?.click()
  }

  return (
    <div className="space-y-4">
      {!activeDatabase ? (
        <div className="text-center py-12 border border-gray-700 rounded-lg backdrop-blur-sm bg-gray-800/20 grid-lines">
          <DatabaseIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-300">No database selected</h3>
          <p className="mt-1 text-sm text-gray-400">Please select a database to manage relationships.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-300">
              Relationships in {activeDatabase.name}
            </h2>
            <FuturisticButton onClick={handleNewRelationshipClick} className="text-white">
              <Plus className="mr-1 h-4 w-4" /> Add Relationship
            </FuturisticButton>
            <Dialog>
              <DialogTrigger asChild>
                <FuturisticButton id="create-relationship-trigger">
                  <Plus className="h-4 w-4 mr-2" />
                  New Relationship
                </FuturisticButton>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Create New Relationship</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Define a relationship between two tables.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="relationship-name" className="text-gray-200">
                      Name
                    </Label>
                    <Input
                      id="relationship-name"
                      className="glass-input"
                      value={newRelationship.name}
                      onChange={(e) => setNewRelationship({ ...newRelationship, name: e.target.value })}
                      placeholder="Relationship name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship-type" className="text-gray-200">
                      Type
                    </Label>
                    <Select
                      value={newRelationship.type?.toString()}
                      onValueChange={(value) =>
                        setNewRelationship({ ...newRelationship, type: Number(value) as RelationshipType })
                      }
                    >
                      <SelectTrigger id="relationship-type" className="glass-select">
                        <SelectValue placeholder="Select relationship type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={RelationshipType.OneToOne.toString()}>One-to-One</SelectItem>
                        <SelectItem value={RelationshipType.OneToMany.toString()}>One-to-Many</SelectItem>
                        <SelectItem value={RelationshipType.ManyToMany.toString()}>Many-to-Many</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="source-table" className="text-gray-200">
                        Source Table
                      </Label>
                      <Select
                        value={newRelationship.sourceTableId?.toString()}
                        onValueChange={(value) => {
                          const tableId = Number(value)
                          setNewRelationship({
                            ...newRelationship,
                            sourceTableId: tableId,
                            sourceColumnId: 0, // Reset column when table changes
                          })
                        }}
                      >
                        <SelectTrigger id="source-table" className="glass-select">
                          <SelectValue placeholder="Select source table" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeDatabase.tables.map((table) => (
                            <SelectItem key={table.tableId} value={table.tableId.toString()}>
                              {table.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source-column" className="text-gray-200">
                        Source Column
                      </Label>
                      <Select
                        value={newRelationship.sourceColumnId?.toString()}
                        onValueChange={(value) =>
                          setNewRelationship({ ...newRelationship, sourceColumnId: Number(value) })
                        }
                        disabled={!newRelationship.sourceTableId}
                      >
                        <SelectTrigger id="source-column" className="glass-select">
                          <SelectValue placeholder="Select source column" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTableById(newRelationship.sourceTableId || 0)?.columns.map((column) => (
                            <SelectItem key={column.columnId} value={column.columnId.toString()}>
                              {column.name} {column.isPrimaryKey && "(PK)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target-table" className="text-gray-200">
                        Target Table
                      </Label>
                      <Select
                        value={newRelationship.targetTableId?.toString()}
                        onValueChange={(value) => {
                          const tableId = Number(value)
                          setNewRelationship({
                            ...newRelationship,
                            targetTableId: tableId,
                            targetColumnId: 0, // Reset column when table changes
                          })
                        }}
                      >
                        <SelectTrigger id="target-table" className="glass-select">
                          <SelectValue placeholder="Select target table" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeDatabase.tables.map((table) => (
                            <SelectItem key={table.tableId} value={table.tableId.toString()}>
                              {table.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target-column" className="text-gray-200">
                        Target Column
                      </Label>
                      <Select
                        value={newRelationship.targetColumnId?.toString()}
                        onValueChange={(value) =>
                          setNewRelationship({ ...newRelationship, targetColumnId: Number(value) })
                        }
                        disabled={!newRelationship.targetTableId}
                      >
                        <SelectTrigger id="target-column" className="glass-select">
                          <SelectValue placeholder="Select target column" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTableById(newRelationship.targetTableId || 0)?.columns.map((column) => (
                            <SelectItem key={column.columnId} value={column.columnId.toString()}>
                              {column.name} {column.isPrimaryKey && "(PK)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <FuturisticButton onClick={handleCreateRelationship}>Create Relationship</FuturisticButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Relationships List */}
            <div className="lg:col-span-1">
              <FuturisticCard className="h-full">
                <CardHeader>
                  <CardTitle className="text-gray-100">Relationships</CardTitle>
                  <CardDescription className="text-gray-300">Connections between tables</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeDatabase.relationships.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>No relationships defined</p>
                      <p className="text-sm">Create your first relationship to connect tables</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeDatabase.relationships.map((relationship) => {
                        const sourceTable = getTableById(relationship.sourceTableId)
                        const targetTable = getTableById(relationship.targetTableId)

                        return (
                          <div
                            key={relationship.relationshipId}
                            className="p-3 border border-gray-700/50 rounded-md bg-gray-800/30 backdrop-blur-sm"
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium text-gray-200">{relationship.name}</h3>
                              <div className="flex gap-1">
                                <FuturisticButton
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingRelationship({ ...relationship })}
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
                                      <AlertDialogTitle className="text-gray-100">Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-300">
                                        This will permanently delete this relationship.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="glass-button">Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="glass-button bg-red-500/20"
                                        onClick={() => handleDeleteRelationship(relationship.relationshipId)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {getRelationshipTypeName(relationship.type)}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                              <span>{sourceTable?.name || "Unknown"}</span>
                              <ArrowRight className="h-3 w-3" />
                              <span>{targetTable?.name || "Unknown"}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {getColumnNameById(relationship.sourceTableId, relationship.sourceColumnId)} →{" "}
                              {getColumnNameById(relationship.targetTableId, relationship.targetColumnId)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </FuturisticCard>
            </div>

            {/* Relationship Diagram */}
            <div className="lg:col-span-3">
              <FuturisticCard className="h-full">
                <CardHeader>
                  <CardTitle className="text-gray-100">Relationship Diagram</CardTitle>
                  <CardDescription className="text-gray-300">
                    Drag tables to position them. Drag from one table to another to create relationships.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    ref={canvasRef}
                    className="w-full h-[500px] border border-gray-700/50 rounded-md relative overflow-auto bg-gray-900/30 backdrop-blur-sm grid-lines"
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {/* SVG for relationships */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                      <defs>
                        <marker
                          id="arrow"
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                          markerUnits="strokeWidth"
                        >
                          <path d="M0,0 L0,6 L9,3 z" fill="rgba(255, 255, 255, 0.7)" />
                        </marker>
                        <marker
                          id="arrow-many"
                          markerWidth="15"
                          markerHeight="15"
                          refX="9"
                          refY="5"
                          orient="auto"
                          markerUnits="strokeWidth"
                        >
                          <path d="M0,0 L0,10 M5,0 L5,10" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1.5" />
                          <path d="M9,5 L0,10 L0,0 z" fill="rgba(255, 255, 255, 0.7)" />
                        </marker>
                        <marker
                          id="arrow-many-many"
                          markerWidth="20"
                          markerHeight="20"
                          refX="10"
                          refY="5"
                          orient="auto"
                          markerUnits="strokeWidth"
                        >
                          <path d="M0,0 L0,10 M5,0 L5,10" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1.5" />
                          <path d="M10,5 L0,10 L0,0 z" fill="rgba(255, 255, 255, 0.7)" />
                        </marker>
                      </defs>

                      {/* Render relationships */}
                      {renderRelationships()}

                      {/* Render drawing relationship */}
                      {drawingRelationship && (
                        <path
                          d={`M${drawingRelationship.sourceX},${drawingRelationship.sourceY} L${drawingRelationship.targetX},${drawingRelationship.targetY}`}
                          stroke="rgba(255, 255, 255, 0.5)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          fill="none"
                        />
                      )}
                    </svg>

                    {/* Render tables */}
                    {activeDatabase.tables.map((table) => {
                      const position = tablePositions[table.tableId] || { x: 0, y: 0 }

                      return (
                        <div
                          key={table.tableId}
                          className="absolute glass-card w-[150px] cursor-move"
                          style={{
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                          }}
                          onMouseDown={(e) => handleMouseDown(e, table.tableId)}
                        >
                          <div
                            className="p-2 border-b border-gray-700/50 bg-gray-800/50 flex justify-between items-center"
                            onMouseDown={(e) => handleStartDrawingRelationship(e, table.tableId)}
                          >
                            <span className="font-medium text-sm text-gray-200">{table.name}</span>
                            <div
                              className="w-3 h-3 rounded-full bg-gray-400"
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                handleStartDrawingRelationship(e, table.tableId)
                              }}
                            />
                          </div>
                          <div className="p-2 max-h-[150px] overflow-y-auto">
                            {table.columns.map((column) => (
                              <div
                                key={column.columnId}
                                className="text-xs py-1 text-gray-300 flex items-center"
                                onMouseUp={(e) => {
                                  e.stopPropagation()
                                  if (drawingRelationship) {
                                    handleFinishDrawingRelationship(e, table.tableId)
                                  }
                                }}
                              >
                                {column.isPrimaryKey && (
                                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-1" />
                                )}
                                {column.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </FuturisticCard>
            </div>
          </div>

          {/* Edit Relationship Dialog */}
          <Dialog open={!!editingRelationship} onOpenChange={(open) => !open && setEditingRelationship(null)}>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Edit Relationship</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Update the details for your relationship.
                </DialogDescription>
              </DialogHeader>
              {editingRelationship && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-relationship-name" className="text-gray-200">
                      Name
                    </Label>
                    <Input
                      id="edit-relationship-name"
                      className="glass-input"
                      value={editingRelationship.name}
                      onChange={(e) => setEditingRelationship({ ...editingRelationship, name: e.target.value })}
                      placeholder="Relationship name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-relationship-type" className="text-gray-200">
                      Type
                    </Label>
                    <Select
                      value={editingRelationship.type.toString()}
                      onValueChange={(value) =>
                        setEditingRelationship({ ...editingRelationship, type: Number(value) as RelationshipType })
                      }
                    >
                      <SelectTrigger id="edit-relationship-type" className="glass-select">
                        <SelectValue placeholder="Select relationship type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={RelationshipType.OneToOne.toString()}>One-to-One</SelectItem>
                        <SelectItem value={RelationshipType.OneToMany.toString()}>One-to-Many</SelectItem>
                        <SelectItem value={RelationshipType.ManyToMany.toString()}>Many-to-Many</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-source-table" className="text-gray-200">
                        Source Table
                      </Label>
                      <Select
                        value={editingRelationship.sourceTableId.toString()}
                        onValueChange={(value) => {
                          const tableId = Number(value)
                          setEditingRelationship({
                            ...editingRelationship,
                            sourceTableId: tableId,
                            sourceColumnId: 0, // Reset column when table changes
                          })
                        }}
                      >
                        <SelectTrigger id="edit-source-table" className="glass-select">
                          <SelectValue placeholder="Select source table" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeDatabase.tables.map((table) => (
                            <SelectItem key={table.tableId} value={table.tableId.toString()}>
                              {table.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-source-column" className="text-gray-200">
                        Source Column
                      </Label>
                      <Select
                        value={editingRelationship.sourceColumnId.toString()}
                        onValueChange={(value) =>
                          setEditingRelationship({ ...editingRelationship, sourceColumnId: Number(value) })
                        }
                      >
                        <SelectTrigger id="edit-source-column" className="glass-select">
                          <SelectValue placeholder="Select source column" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTableById(editingRelationship.sourceTableId)?.columns.map((column) => (
                            <SelectItem key={column.columnId} value={column.columnId.toString()}>
                              {column.name} {column.isPrimaryKey && "(PK)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-target-table" className="text-gray-200">
                        Target Table
                      </Label>
                      <Select
                        value={editingRelationship.targetTableId.toString()}
                        onValueChange={(value) => {
                          const tableId = Number(value)
                          setEditingRelationship({
                            ...editingRelationship,
                            targetTableId: tableId,
                            targetColumnId: 0, // Reset column when table changes
                          })
                        }}
                      >
                        <SelectTrigger id="edit-target-table" className="glass-select">
                          <SelectValue placeholder="Select target table" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeDatabase.tables.map((table) => (
                            <SelectItem key={table.tableId} value={table.tableId.toString()}>
                              {table.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-target-column" className="text-gray-200">
                        Target Column
                      </Label>
                      <Select
                        value={editingRelationship.targetColumnId.toString()}
                        onValueChange={(value) =>
                          setEditingRelationship({ ...editingRelationship, targetColumnId: Number(value) })
                        }
                      >
                        <SelectTrigger id="edit-target-column" className="glass-select">
                          <SelectValue placeholder="Select target column" />
                        </SelectTrigger>
                        <SelectContent>
                          {getTableById(editingRelationship.targetTableId)?.columns.map((column) => (
                            <SelectItem key={column.columnId} value={column.columnId.toString()}>
                              {column.name} {column.isPrimaryKey && "(PK)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <FuturisticButton onClick={handleUpdateRelationship}>Update Relationship</FuturisticButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}

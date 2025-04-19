"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FuturisticButton } from "./futuristic-button"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/types"

interface DatabaseCodeEditorProps {
  onClose: () => void
  activeDatabase: Database | null
  onDatabaseCreated: (database: Database) => void
}

export function DatabaseCodeEditor({ onClose, activeDatabase, onDatabaseCreated }: DatabaseCodeEditorProps) {
  const [activeTab, setActiveTab] = useState<"json" | "sql" | "csv">("json")
  const [code, setCode] = useState<string>("")
  const { importData, createDatabase } = useStore()
  const { toast } = useToast()

  const handleExecute = () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to execute",
        variant: "destructive",
      })
      return
    }

    try {
      if (activeTab === "json") {
        // Parse JSON and create database
        const data = JSON.parse(code)
        const success = importData(JSON.stringify({ databases: [data] }))

        if (success) {
          toast({
            title: "Success",
            description: "Database created successfully from JSON",
          })
          onClose()
        } else {
          toast({
            title: "Error",
            description: "Failed to create database from JSON",
            variant: "destructive",
          })
        }
      } else if (activeTab === "sql") {
        // Basic SQL parsing (simplified for demo)
        const createMatch = code.match(/CREATE\s+DATABASE\s+([a-zA-Z0-9_]+)/i)
        if (createMatch && createMatch[1]) {
          const dbName = createMatch[1]
          const newDb = createDatabase(dbName, "Created from SQL")
          onDatabaseCreated(newDb)
          toast({
            title: "Success",
            description: `Database "${dbName}" created successfully from SQL`,
          })
        } else {
          toast({
            title: "Error",
            description: "Invalid SQL. Expected CREATE DATABASE statement",
            variant: "destructive",
          })
        }
      } else if (activeTab === "csv") {
        // CSV parsing (simplified for demo)
        const lines = code.trim().split("\n")
        if (lines.length > 0) {
          const headers = lines[0].split(",")
          if (headers.length > 0) {
            const dbName = headers[0].trim()
            const newDb = createDatabase(dbName, "Created from CSV")
            onDatabaseCreated(newDb)
            toast({
              title: "Success",
              description: `Database "${dbName}" created successfully from CSV`,
            })
          }
        } else {
          toast({
            title: "Error",
            description: "Invalid CSV format",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to parse ${activeTab.toUpperCase()}: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="tabs-list-futuristic w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="json" className="tab-trigger-futuristic text-white">
            JSON
          </TabsTrigger>
          <TabsTrigger value="sql" className="tab-trigger-futuristic text-white">
            SQL
          </TabsTrigger>
          <TabsTrigger value="csv" className="tab-trigger-futuristic text-white">
            CSV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json" className="space-y-2">
          <p className="text-sm text-gray-300">Create a database by defining its structure in JSON format.</p>
          <Textarea
            className="min-h-[400px] font-mono text-sm glass-input"
            placeholder={`{
  "name": "MyDatabase",
  "description": "My database description",
  "tables": [
    {
      "name": "Users",
      "description": "User information",
      "columns": [
        {
          "name": "id",
          "type": 0,
          "isPrimaryKey": true,
          "isRequired": true
        },
        {
          "name": "name",
          "type": 0,
          "isRequired": true
        }
      ]
    }
  ]
}`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </TabsContent>

        <TabsContent value="sql" className="space-y-2">
          <p className="text-sm text-gray-300">Create a database using SQL commands.</p>
          <Textarea
            className="min-h-[400px] font-mono text-sm glass-input"
            placeholder={`CREATE DATABASE MyDatabase;

CREATE TABLE Users (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE
);`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </TabsContent>

        <TabsContent value="csv" className="space-y-2">
          <p className="text-sm text-gray-300">Create a database structure from CSV format.</p>
          <Textarea
            className="min-h-[400px] font-mono text-sm glass-input"
            placeholder={`DatabaseName,Description
TableName,ColumnName,Type,IsPrimaryKey,IsRequired
Users,id,0,true,true
Users,name,0,false,true
Users,email,0,false,false`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <FuturisticButton variant="outline" onClick={onClose} className="text-white">
          Cancel
        </FuturisticButton>
        <FuturisticButton onClick={handleExecute} className="text-white">
          Execute
        </FuturisticButton>
      </div>
    </div>
  )
}

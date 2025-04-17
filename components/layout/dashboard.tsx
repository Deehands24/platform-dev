"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FuturisticCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/futuristic/futuristic-card"
import DatabaseManager from "@/components/database/database-manager"
import FormBuilder from "@/components/forms/form-builder"
import TableManager from "@/components/tables/table-manager"
import RelationshipManager from "@/components/layout/relationship-manager"
import type { Database, Table, Form } from "@/lib/types"

export default function Dashboard() {
  const [activeDatabase, setActiveDatabase] = useState<Database | null>(null)
  const [activeTable, setActiveTable] = useState<Table | null>(null)
  const [activeForm, setActiveForm] = useState<Form | null>(null)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <FuturisticCard floatingEffect>
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-300">
            Dynamic Database & Form Builder
          </CardTitle>
          <CardDescription className="text-gray-300">
            Create and manage databases, tables, forms, and relationships in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="databases" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="databases" className="glass-button data-[state=active]:bg-gray-700/50">
                Databases
              </TabsTrigger>
              <TabsTrigger value="tables" className="glass-button data-[state=active]:bg-gray-700/50">
                Tables
              </TabsTrigger>
              <TabsTrigger value="forms" className="glass-button data-[state=active]:bg-gray-700/50">
                Forms
              </TabsTrigger>
              <TabsTrigger value="relationships" className="glass-button data-[state=active]:bg-gray-700/50">
                Relationships
              </TabsTrigger>
            </TabsList>

            <TabsContent value="databases" className="space-y-4">
              <DatabaseManager onSelectDatabase={setActiveDatabase} activeDatabase={activeDatabase} />
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              <TableManager activeDatabase={activeDatabase} onSelectTable={setActiveTable} activeTable={activeTable} />
            </TabsContent>

            <TabsContent value="forms" className="space-y-4">
              <FormBuilder
                activeDatabase={activeDatabase}
                activeForm={activeForm}
                onSelectForm={setActiveForm}
                tables={activeDatabase?.tables || []}
              />
            </TabsContent>

            <TabsContent value="relationships" className="space-y-4">
              <RelationshipManager activeDatabase={activeDatabase} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </FuturisticCard>
    </div>
  )
}

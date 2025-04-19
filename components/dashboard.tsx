"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FuturisticCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/futuristic-card"
import DatabaseManager from "./database-manager"
import FormBuilder from "./form-builder"
import TableManager from "./table-manager"
import RelationshipManager from "./relationship-manager"
import type { Database, Table, Form } from "@/lib/types"
import { FuturisticSidebar } from "./futuristic-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Code } from "lucide-react"
import { DatabaseCodeEditor } from "./database-code-editor"

export default function Dashboard() {
  const [activeDatabase, setActiveDatabase] = useState<Database | null>(null)
  const [activeTable, setActiveTable] = useState<Table | null>(null)
  const [activeForm, setActiveForm] = useState<Form | null>(null)
  const [activeSection, setActiveSection] = useState<string>("databases")
  const [showCodeEditor, setShowCodeEditor] = useState<boolean>(false)

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    setShowCodeEditor(false)
  }

  const toggleCodeEditor = () => {
    setShowCodeEditor(!showCodeEditor)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        <FuturisticSidebar currentSection={activeSection} onNavigate={handleSectionChange} />
        <SidebarInset className="bg-transparent">
          <div className="container py-6 px-4 space-y-6 h-full overflow-y-auto">
            <FuturisticCard floatingEffect className="backdrop-blur-lg bg-black/30 border-gray-700/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                      Dynamic Database & Form Builder
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Create and manage databases, tables, forms, and relationships in one place
                    </CardDescription>
                  </div>
                  <button
                    onClick={toggleCodeEditor}
                    className="button-futuristic flex items-center gap-2 px-3 py-2 rounded-md text-white"
                  >
                    <Code className="h-4 w-4" />
                    {showCodeEditor ? "Hide Code Editor" : "Code Editor"}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {showCodeEditor ? (
                  <DatabaseCodeEditor
                    onClose={() => setShowCodeEditor(false)}
                    activeDatabase={activeDatabase}
                    onDatabaseCreated={(db) => {
                      setActiveDatabase(db)
                      setShowCodeEditor(false)
                    }}
                  />
                ) : (
                  <Tabs
                    defaultValue="databases"
                    value={activeSection}
                    onValueChange={handleSectionChange}
                    className="space-y-4"
                  >
                    <TabsList className="grid grid-cols-4 w-full tabs-list-futuristic">
                      <TabsTrigger value="databases" className="tab-trigger-futuristic text-white">
                        Databases
                      </TabsTrigger>
                      <TabsTrigger value="tables" className="tab-trigger-futuristic text-white">
                        Tables
                      </TabsTrigger>
                      <TabsTrigger value="forms" className="tab-trigger-futuristic text-white">
                        Forms
                      </TabsTrigger>
                      <TabsTrigger value="relationships" className="tab-trigger-futuristic text-white">
                        Relationships
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-4">
                      <div className="text-center py-12 border border-gray-700/30 rounded-lg backdrop-blur-sm bg-gray-800/20">
                        <h3 className="text-lg font-medium text-gray-300">
                          Welcome to the Dynamic Database & Form Builder
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">Select a section from the sidebar to get started</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="databases" className="space-y-4">
                      <DatabaseManager onSelectDatabase={setActiveDatabase} activeDatabase={activeDatabase} />
                    </TabsContent>

                    <TabsContent value="tables" className="space-y-4">
                      <TableManager
                        activeDatabase={activeDatabase}
                        onSelectTable={setActiveTable}
                        activeTable={activeTable}
                      />
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

                    <TabsContent value="settings" className="space-y-4">
                      <div className="text-center py-12 border border-gray-700/30 rounded-lg backdrop-blur-sm bg-gray-800/20">
                        <h3 className="text-lg font-medium text-gray-300">Settings</h3>
                        <p className="mt-1 text-sm text-gray-400">Configure your application settings</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </FuturisticCard>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

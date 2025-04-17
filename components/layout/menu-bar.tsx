"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type { Form, ComboBoxItemsSource } from "@/lib/types"
import { ComboBoxItemsSourceDialog } from "./combo-box-items-source-dialog"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"

interface MenuBarProps {
  createNewForm: () => void
  currentForm: Form | null
  itemsSources: ComboBoxItemsSource[]
  setItemsSources: (sources: ComboBoxItemsSource[]) => void
  loadFormFromJson: (jsonData: string) => boolean
  exportFormToJson: () => string
  isPreviewMode: boolean
  togglePreviewMode: () => void
}

export default function MenuBar({
  createNewForm,
  currentForm,
  itemsSources,
  setItemsSources,
  loadFormFromJson,
  exportFormToJson,
  isPreviewMode,
  togglePreviewMode,
}: MenuBarProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState("")
  const [jsonOutput, setJsonOutput] = useState("")
  const { toast } = useToast()

  const handleImport = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter valid JSON data",
        variant: "destructive",
      })
      return
    }

    const success = loadFormFromJson(jsonInput)
    if (success) {
      setImportDialogOpen(false)
      setJsonInput("")
      toast({
        title: "Success",
        description: "Form imported successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to import form. Please check the JSON format.",
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    const json = exportFormToJson()
    setJsonOutput(json)
    setExportDialogOpen(true)
  }

  return (
    <div className="bg-background border-b flex items-center p-2 gap-2">
      <Button variant="outline" onClick={createNewForm}>
        New Form
      </Button>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Import Form</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Form from JSON</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your JSON here..."
              className="min-h-[300px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <Button onClick={handleImport}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" disabled={!currentForm} onClick={handleExport}>
        Export Form
      </Button>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Export Form as JSON</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea className="min-h-[300px] font-mono text-sm" value={jsonOutput} readOnly />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(jsonOutput)
                toast({
                  title: "Copied",
                  description: "JSON copied to clipboard",
                })
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant={isPreviewMode ? "default" : "outline"}
        onClick={togglePreviewMode}
        disabled={!currentForm}
        className="ml-2"
      >
        {isPreviewMode ? (
          <>
            <EyeOff className="h-4 w-4 mr-2" />
            Exit Preview
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Preview Form
          </>
        )}
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <ComboBoxItemsSourceDialog itemsSources={itemsSources} setItemsSources={setItemsSources} />
      </div>
    </div>
  )
}

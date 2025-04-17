"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Trash2 } from "lucide-react"
import type { ComboBoxItem, ComboBoxItemsSource } from "@/lib/types"

interface ComboBoxItemsSourceDialogProps {
  itemsSources: ComboBoxItemsSource[]
  setItemsSources: (sources: ComboBoxItemsSource[]) => void
}

export function ComboBoxItemsSourceDialog({ itemsSources, setItemsSources }: ComboBoxItemsSourceDialogProps) {
  const [open, setOpen] = useState(false)
  const [sourceName, setSourceName] = useState("")
  const [currentSourceId, setCurrentSourceId] = useState<number | null>(null)
  const [value, setValue] = useState("")
  const [displayText, setDisplayText] = useState("")
  const [items, setItems] = useState<ComboBoxItem[]>([])

  const handleCreateSource = () => {
    if (!sourceName) return

    const newSourceId = Date.now()
    setCurrentSourceId(newSourceId)
    setItemsSources([
      ...itemsSources,
      {
        itemsSourceId: newSourceId,
        name: sourceName,
        items: [],
      },
    ])
    setItems([])
  }

  const handleAddItem = () => {
    if (!value || !displayText || !currentSourceId) return

    const newItem = { value, displayText }
    setItems([...items, newItem])

    // Update the items source
    setItemsSources(
      itemsSources.map((source) =>
        source.itemsSourceId === currentSourceId ? { ...source, items: [...source.items, newItem] } : source,
      ),
    )

    setValue("")
    setDisplayText("")
  }

  const handleSelectSource = (sourceId: number) => {
    setCurrentSourceId(sourceId)
    const source = itemsSources.find((s) => s.itemsSourceId === sourceId)
    if (source) {
      setSourceName(source.name || "")
      setItems(source.items)
    }
  }

  const handleDeleteSource = (sourceId: number) => {
    setItemsSources(itemsSources.filter((source) => source.itemsSourceId !== sourceId))
    if (currentSourceId === sourceId) {
      setCurrentSourceId(null)
      setSourceName("")
      setItems([])
    }
  }

  const handleDeleteItem = (index: number) => {
    if (!currentSourceId) return

    const updatedItems = [...items]
    updatedItems.splice(index, 1)
    setItems(updatedItems)

    setItemsSources(
      itemsSources.map((source) =>
        source.itemsSourceId === currentSourceId ? { ...source, items: updatedItems } : source,
      ),
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage ComboBox Sources</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage ComboBox Items Sources</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 border rounded-md p-4">
            <h3 className="font-medium mb-2">Sources</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Source Name" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
                <Button size="sm" onClick={handleCreateSource}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1 mt-4">
                {itemsSources.map((source) => (
                  <div key={source.itemsSourceId} className="flex items-center justify-between">
                    <Button
                      variant={currentSourceId === source.itemsSourceId ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleSelectSource(source.itemsSourceId)}
                    >
                      {source.name}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSource(source.itemsSourceId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-2 border rounded-md p-4">
            <h3 className="font-medium mb-2">Items</h3>
            {currentSourceId ? (
              <>
                <div className="flex gap-2 mb-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="displayText">Display Text</Label>
                    <Input
                      id="displayText"
                      placeholder="Display Text"
                      value={displayText}
                      onChange={(e) => setDisplayText(e.target.value)}
                    />
                  </div>
                  <Button className="self-end" onClick={handleAddItem}>
                    Add
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Value</TableHead>
                      <TableHead>Display Text</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.value}</TableCell>
                        <TableCell>{item.displayText}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Select or create a source to manage items</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

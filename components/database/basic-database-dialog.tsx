"use client"

import * as React from "react"
import { useState } from "react"
import { useStore } from "@/lib/store"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

export function BasicDatabaseDialog({ onDatabaseCreated }: { onDatabaseCreated?: (databaseId: number) => void }) {
  const { createDatabase } = useStore()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [open, setOpen] = React.useState(false)

  const handleCreateDatabase = () => {
    if (!name.trim()) return

    const newDatabase = createDatabase(name, description)
    setName("")
    setDescription("")
    setOpen(false)

    if (onDatabaseCreated) {
      onDatabaseCreated(newDatabase.databaseId)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Database
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-md bg-white p-6 shadow-lg">
          <DialogPrimitive.Title className="text-lg font-bold">Create New Database</DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm text-gray-500">
            Enter the details for your new database.
          </DialogPrimitive.Description>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Database name"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Database description"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDatabase}>Create Database</Button>
          </div>

          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 opacity-70 hover:opacity-100">
            <span className="sr-only">Close</span>✕
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

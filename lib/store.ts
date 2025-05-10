"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Database,
  Table,
  TableColumn,
  TableRow,
  Form,
  FormElement,
  Relationship,
  FormTableLink,
  ComboBoxItemsSource,
} from "./types"

interface StoreState {
  databases: Database[]
  comboBoxItemsSources: ComboBoxItemsSource[]

  // Database operations
  createDatabase: (name: string, description: string) => Database
  updateDatabase: (database: Database) => void
  deleteDatabase: (databaseId: number) => void

  // Table operations
  createTable: (databaseId: number, name: string, description: string) => Table
  updateTable: (table: Table) => void
  deleteTable: (databaseId: number, tableId: number) => void

  // Column operations
  addColumn: (tableId: number, column: Partial<TableColumn>) => TableColumn
  updateColumn: (column: TableColumn) => void
  deleteColumn: (tableId: number, columnId: number) => void

  // Row operations
  addRow: (tableId: number, data: Record<string, any>) => TableRow
  updateRow: (tableId: number, rowId: number, data: Record<string, any>) => void
  deleteRow: (tableId: number, rowId: number) => void

  // Form operations
  createForm: (databaseId: number, name: string, description: string) => Form
  updateForm: (form: Form) => void
  deleteForm: (databaseId: number, formId: number) => void

  // Form element operations
  addFormElement: (formId: number, element: Partial<FormElement>) => FormElement
  updateFormElement: (element: FormElement) => void
  deleteFormElement: (formId: number, elementId: number) => void

  // Relationship operations
  createRelationship: (relationship: Partial<Relationship>) => Relationship
  updateRelationship: (relationship: Relationship) => void
  deleteRelationship: (databaseId: number, relationshipId: number) => void

  // Form-Table link operations
  createFormTableLink: (link: Partial<FormTableLink>) => FormTableLink
  updateFormTableLink: (link: FormTableLink) => void
  deleteFormTableLink: (formId: number, linkId: number) => void

  // ComboBox items source operations
  addComboBoxItemsSource: (source: Partial<ComboBoxItemsSource>) => ComboBoxItemsSource
  updateComboBoxItemsSource: (source: ComboBoxItemsSource) => void
  deleteComboBoxItemsSource: (sourceId: number) => void

  // Import/Export
  importData: (data: string) => boolean
  exportData: () => string
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      databases: [],
      comboBoxItemsSources: [],

      // Database operations
      createDatabase: (name: string, description: string) => {
        const tempId = Date.now();
        const newDatabase: Database = {
          databaseId: tempId,
          name,
          description,
          createdDate: new Date(),
          updatedDate: new Date(),
          tables: [],
          forms: [],
          relationships: [],
        };

        set((state) => ({
          databases: [...state.databases, newDatabase],
        }));

        // Call the API to create the database in Neon
        fetch('/api/db/create-database', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, description }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to create database in Neon');
          }
          return response.json();
        })
        .then(data => {
          // Update local state with the actual database ID from Neon
          set((state) => ({
            databases: state.databases.map(db => 
              db.databaseId === tempId 
                ? { ...db, databaseId: parseInt(data.database.id) } 
                : db
            ),
          }));
        })
        .catch(error => {
          console.error('Error creating database:', error);
          // Remove the database from local state if API call fails
          set((state) => ({
            databases: state.databases.filter(db => db.databaseId !== tempId),
          }));
        });

        return newDatabase;
      },

      updateDatabase: (database) => {
        set((state) => ({
          databases: state.databases.map((db) =>
            db.databaseId === database.databaseId ? { ...database, updatedDate: new Date() } : db,
          ),
        }))
      },

      deleteDatabase: (databaseId) => {
        set((state) => ({
          databases: state.databases.filter((db) => db.databaseId !== databaseId),
        }))
      },

      // Table operations
      createTable: (databaseId: number, name: string, description: string) => {
        const newTable: Table = {
          tableId: Date.now(),
          databaseId,
          name,
          description,
          createdDate: new Date(),
          updatedDate: new Date(),
          columns: [],
          rows: [],
        };

        set((state) => ({
          databases: state.databases.map((db) => {
            if (db.databaseId === databaseId) {
              return {
                ...db,
                tables: [...db.tables, newTable],
                updatedDate: new Date(),
              };
            }
            return db;
          }),
        }));

        // Call the API to create the table in Neon
        fetch('/api/db/create-table', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ databaseId, name, description }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to create table in Neon');
          }
          return response.json();
        })
        .then(data => {
          // Update local state with the table ID from Neon
          set((state) => ({
            databases: state.databases.map(db => {
              if (db.databaseId === databaseId) {
                return {
                  ...db,
                  tables: db.tables.map(t => 
                    t.tableId === newTable.tableId 
                      ? { ...t, tableId: data.table.id } 
                      : t
                  ),
                };
              }
              return db;
            }),
          }));
        })
        .catch(error => {
          console.error('Error creating table:', error);
          // Optionally, remove the table from local state if API call fails
          set((state) => ({
            databases: state.databases.map(db => {
              if (db.databaseId === databaseId) {
                return {
                  ...db,
                  tables: db.tables.filter(t => t.tableId !== newTable.tableId),
                };
              }
              return db;
            }),
          }));
        });

        return newTable;
      },

      updateTable: (table) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            if (db.databaseId === table.databaseId) {
              return {
                ...db,
                tables: db.tables.map((t) => (t.tableId === table.tableId ? { ...table, updatedDate: new Date() } : t)),
                updatedDate: new Date(),
              }
            }
            return db
          }),
        }));

        // Call the API to update the table in Neon
        fetch('/api/db/update-table', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tableId: table.tableId,
            name: table.name,
            description: table.description,
          }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update table in Neon');
          }
          return response.json();
        })
        .catch(error => {
          console.error('Error updating table:', error);
        });
      },

      deleteTable: (databaseId, tableId) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            if (db.databaseId === databaseId) {
              return {
                ...db,
                tables: db.tables.filter((t) => t.tableId !== tableId),
                updatedDate: new Date(),
              }
            }
            return db
          }),
        }));

        // Call the API to delete the table from Neon
        fetch('/api/db/delete-table', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tableId,
          }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete table from Neon');
          }
          return response.json();
        })
        .catch(error => {
          console.error('Error deleting table:', error);
        });
      },

      // Column operations
      addColumn: (tableId: number, columnData: Partial<TableColumn>) => {
        const newColumn: TableColumn = {
          columnId: Date.now(),
          tableId,
          name: columnData.name || "New Column",
          type: columnData.type || 0,
          isPrimaryKey: columnData.isPrimaryKey || false,
          isRequired: columnData.isRequired || false,
          defaultValue: columnData.defaultValue,
          validationRules: columnData.validationRules || [],
        };

        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              tables: db.tables.map((table) => {
                if (table.tableId === tableId) {
                  return {
                    ...table,
                    columns: [...table.columns, newColumn],
                    updatedDate: new Date(),
                  };
                }
                return table;
              }),
              updatedDate: new Date(),
            };
          }),
        }));

        // Call the API to create the column in Neon
        fetch('/api/db/create-column', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tableId,
            name: newColumn.name,
            type: newColumn.type,
            isPrimaryKey: newColumn.isPrimaryKey,
            isRequired: newColumn.isRequired,
            defaultValue: newColumn.defaultValue,
            validationRules: newColumn.validationRules,
          }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to create column in Neon');
          }
          return response.json();
        })
        .then(data => {
          // Update local state with the column ID from Neon
          set((state) => ({
            databases: state.databases.map(db => {
              return {
                ...db,
                tables: db.tables.map(table => {
                  if (table.tableId === tableId) {
                    return {
                      ...table,
                      columns: table.columns.map(c => 
                        c.columnId === newColumn.columnId 
                          ? { ...c, columnId: data.column.id } 
                          : c
                      ),
                    };
                  }
                  return table;
                }),
              };
            }),
          }));
        })
        .catch(error => {
          console.error('Error creating column:', error);
          // Optionally, remove the column from local state if API call fails
          set((state) => ({
            databases: state.databases.map(db => {
              return {
                ...db,
                tables: db.tables.map(table => {
                  if (table.tableId === tableId) {
                    return {
                      ...table,
                      columns: table.columns.filter(c => c.columnId !== newColumn.columnId),
                    };
                  }
                  return table;
                }),
              };
            }),
          }));
        });

        return newColumn;
      },

      updateColumn: (column) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              tables: db.tables.map((table) => {
                if (table.tableId === column.tableId) {
                  return {
                    ...table,
                    columns: table.columns.map((c) => (c.columnId === column.columnId ? column : c)),
                    updatedDate: new Date(),
                  }
                }
                return table
              }),
              updatedDate: new Date(),
            }
          }),
        }))
      },

      deleteColumn: (tableId, columnId) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              tables: db.tables.map((table) => {
                if (table.tableId === tableId) {
                  return {
                    ...table,
                    columns: table.columns.filter((c) => c.columnId !== columnId),
                    updatedDate: new Date(),
                  }
                }
                return table
              }),
              updatedDate: new Date(),
            }
          }),
        }))
      },

      // Row operations
      addRow: (tableId, data) => {
        const newRow: TableRow = {
          rowId: Date.now(),
          tableId,
          data,
        }

        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              tables: db.tables.map((table) => {
                if (table.tableId === tableId) {
                  return {
                    ...table,
                    rows: [...table.rows, newRow],
                    updatedDate: new Date(),
                  }
                }
                return table
              }),
              updatedDate: new Date(),
            }
          }),
        }))

        return newRow
      },

      updateRow: (tableId, rowId, data) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              tables: db.tables.map((table) => {
                if (table.tableId === tableId) {
                  return {
                    ...table,
                    rows: table.rows.map((row) => (row.rowId === rowId ? { ...row, data } : row)),
                    updatedDate: new Date(),
                  }
                }
                return table
              }),
              updatedDate: new Date(),
            }
          }),
        }))
      },

      deleteRow: (tableId, rowId) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              tables: db.tables.map((table) => {
                if (table.tableId === tableId) {
                  return {
                    ...table,
                    rows: table.rows.filter((row) => row.rowId !== rowId),
                    updatedDate: new Date(),
                  }
                }
                return table
              }),
              updatedDate: new Date(),
            }
          }),
        }))
      },

      // Form operations
      createForm: (databaseId: number, name: string, description: string) => {
        const newForm: Form = {
          formId: Date.now(),
          databaseId,
          name,
          description,
          createdDate: new Date(),
          updatedDate: new Date(),
          isActive: true,
          elements: [],
          interactionRules: [],
          tableLinks: [],
        };

        set((state) => ({
          databases: state.databases.map((db) => {
            if (db.databaseId === databaseId) {
              return {
                ...db,
                forms: [...db.forms, newForm],
                updatedDate: new Date(),
              };
            }
            return db;
          }),
        }));

        // Call the API to create the form in Neon
        fetch('/api/db/create-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ databaseId, name, description, isActive: true }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to create form in Neon');
          }
          return response.json();
        })
        .then(data => {
          // Update local state with the form ID from Neon
          set((state) => ({
            databases: state.databases.map(db => {
              if (db.databaseId === databaseId) {
                return {
                  ...db,
                  forms: db.forms.map(f => 
                    f.formId === newForm.formId 
                      ? { ...f, formId: data.form.id } 
                      : f
                  ),
                };
              }
              return db;
            }),
          }));
        })
        .catch(error => {
          console.error('Error creating form:', error);
          // Optionally, remove the form from local state if API call fails
          set((state) => ({
            databases: state.databases.map(db => {
              if (db.databaseId === databaseId) {
                return {
                  ...db,
                  forms: db.forms.filter(f => f.formId !== newForm.formId),
                };
              }
              return db;
            }),
          }));
        });

        return newForm;
      },

      updateForm: (form) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            if (db.databaseId === form.databaseId) {
              return {
                ...db,
                forms: db.forms.map((f) => (f.formId === form.formId ? { ...form, updatedDate: new Date() } : f)),
                updatedDate: new Date(),
              }
            }
            return db
          }),
        }))
      },

      deleteForm: (databaseId, formId) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            if (db.databaseId === databaseId) {
              return {
                ...db,
                forms: db.forms.filter((f) => f.formId !== formId),
                updatedDate: new Date(),
              }
            }
            return db
          }),
        }))
      },

      // Form element operations
      addFormElement: (formId: number, elementData: Partial<FormElement>) => {
        const newElement: FormElement = {
          elementId: Date.now(),
          formId,
          label: elementData.label || "New Element",
          placeholder: elementData.placeholder || "",
          defaultValue: elementData.defaultValue || "",
          order: elementData.order !== undefined ? elementData.order : 0,
          type: elementData.type !== undefined ? elementData.type : 0,
          isRequired: elementData.isRequired !== undefined ? elementData.isRequired : false,
          isVisible: elementData.isVisible !== undefined ? elementData.isVisible : true,
          isEnabled: elementData.isEnabled !== undefined ? elementData.isEnabled : true,
          validationRules: elementData.validationRules || [],
          tableLink: elementData.tableLink,
        };

        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              forms: db.forms.map((form) => {
                if (form.formId === formId) {
                  return {
                    ...form,
                    elements: [...form.elements, newElement],
                    updatedDate: new Date(),
                  };
                }
                return form;
              }),
              updatedDate: new Date(),
            };
          }),
        }));

        // Call the API to create the form element in Neon
        fetch('/api/db/create-form-element', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formId,
            label: newElement.label,
            placeholder: newElement.placeholder,
            defaultValue: newElement.defaultValue,
            order: newElement.order,
            type: newElement.type,
            isRequired: newElement.isRequired,
            isVisible: newElement.isVisible,
            isEnabled: newElement.isEnabled,
            validationRules: newElement.validationRules,
          }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to create form element in Neon');
          }
          return response.json();
        })
        .then(data => {
          // Update local state with the element ID from Neon
          set((state) => ({
            databases: state.databases.map(db => {
              return {
                ...db,
                forms: db.forms.map(form => {
                  if (form.formId === formId) {
                    return {
                      ...form,
                      elements: form.elements.map(e => 
                        e.elementId === newElement.elementId 
                          ? { ...e, elementId: data.formElement.id } 
                          : e
                      ),
                    };
                  }
                  return form;
                }),
              };
            }),
          }));
        })
        .catch(error => {
          console.error('Error creating form element:', error);
          // Optionally, remove the element from local state if API call fails
          set((state) => ({
            databases: state.databases.map(db => {
              return {
                ...db,
                forms: db.forms.map(form => {
                  if (form.formId === formId) {
                    return {
                      ...form,
                      elements: form.elements.filter(e => e.elementId !== newElement.elementId),
                    };
                  }
                  return form;
                }),
              };
            }),
          }));
        });

        return newElement;
      },

      updateFormElement: (element) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              forms: db.forms.map((form) => {
                if (form.formId === element.formId) {
                  return {
                    ...form,
                    elements: form.elements.map((e) => (e.elementId === element.elementId ? element : e)),
                    updatedDate: new Date(),
                  }
                }
                return form
              }),
              updatedDate: new Date(),
            }
          }),
        }))
      },

      deleteFormElement: (formId, elementId) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              forms: db.forms.map((form) => {
                if (form.formId === formId) {
                  return {
                    ...form,
                    elements: form.elements.filter((e) => e.elementId !== elementId),
                    updatedDate: new Date(),
                  }
                }
                return form
              }),
              updatedDate: new Date(),
            }
          }),
        }))
      },

      // Relationship operations
      createRelationship: (relationshipData) => {
        const newRelationship: Relationship = {
          relationshipId: Date.now(),
          databaseId: relationshipData.databaseId || 0,
          name: relationshipData.name || "New Relationship",
          sourceTableId: relationshipData.sourceTableId || 0,
          sourceColumnId: relationshipData.sourceColumnId || 0,
          targetTableId: relationshipData.targetTableId || 0,
          targetColumnId: relationshipData.targetColumnId || 0,
          type: relationshipData.type !== undefined ? relationshipData.type : 0,
        }

        set((state) => ({
          databases: state.databases.map((db) => {
            if (db.databaseId === newRelationship.databaseId) {
              return {
                ...db,
                relationships: [...db.relationships, newRelationship],
                updatedDate: new Date(),
              }
            }
            return db
          }),
        }))

        return newRelationship
      },

      updateRelationship: (relationship) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            if (db.databaseId === relationship.databaseId) {
              return {
                ...db,
                relationships: db.relationships.map((r) =>
                  r.relationshipId === relationship.relationshipId ? relationship : r,
                ),
                updatedDate: new Date(),
              }
            }
            return db
          }),
        }))
      },

      deleteRelationship: (databaseId, relationshipId) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            if (db.databaseId === databaseId) {
              return {
                ...db,
                relationships: db.relationships.filter((r) => r.relationshipId !== relationshipId),
                updatedDate: new Date(),
              }
            }
            return db
          }),
        }))
      },

      // Form-Table link operations
      createFormTableLink: (linkData) => {
        const newLink: FormTableLink = {
          linkId: Date.now(),
          formId: linkData.formId || 0,
          elementId: linkData.elementId || 0,
          tableId: linkData.tableId || 0,
          columnId: linkData.columnId || 0,
        }

        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              forms: db.forms.map((form) => {
                if (form.formId === newLink.formId) {
                  return {
                    ...form,
                    tableLinks: [...form.tableLinks, newLink],
                    updatedDate: new Date(),
                  }
                }
                return form
              }),
              updatedDate: new Date(),
            }
          }),
        }))

        return newLink
      },

      updateFormTableLink: (link) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              forms: db.forms.map((form) => {
                if (form.formId === link.formId) {
                  return {
                    ...form,
                    tableLinks: form.tableLinks.map((l) => (l.linkId === link.linkId ? link : l)),
                    updatedDate: new Date(),
                  }
                }
                return form
              }),
              updatedDate: new Date(),
            }
          }),
        }))
      },

      deleteFormTableLink: (formId, linkId) => {
        set((state) => ({
          databases: state.databases.map((db) => {
            return {
              ...db,
              forms: db.forms.map((form) => {
                if (form.formId === formId) {
                  return {
                    ...form,
                    tableLinks: form.tableLinks.filter((l) => l.linkId !== linkId),
                    updatedDate: new Date(),
                  }
                }
                return form
              }),
              updatedDate: new Date(),
            }
          }),
        }))
      },

      // ComboBox items source operations
      addComboBoxItemsSource: (sourceData) => {
        const newSource: ComboBoxItemsSource = {
          itemsSourceId: Date.now(),
          name: sourceData.name || "New Items Source",
          items: sourceData.items || [],
          parentId: sourceData.parentId,
        }

        set((state) => ({
          comboBoxItemsSources: [...state.comboBoxItemsSources, newSource],
        }))

        return newSource
      },

      updateComboBoxItemsSource: (source) => {
        set((state) => ({
          comboBoxItemsSources: state.comboBoxItemsSources.map((s) =>
            s.itemsSourceId === source.itemsSourceId ? source : s,
          ),
        }))
      },

      deleteComboBoxItemsSource: (sourceId) => {
        set((state) => ({
          comboBoxItemsSources: state.comboBoxItemsSources.filter((s) => s.itemsSourceId !== sourceId),
        }))
      },

      // Import/Export
      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData)

          if (data.databases && Array.isArray(data.databases)) {
            // Convert date strings to Date objects
            const databases = data.databases.map((db: any) => ({
              ...db,
              createdDate: new Date(db.createdDate),
              updatedDate: new Date(db.updatedDate),
              tables: db.tables.map((table: any) => ({
                ...table,
                createdDate: new Date(table.createdDate),
                updatedDate: new Date(table.updatedDate),
              })),
              forms: db.forms.map((form: any) => ({
                ...form,
                createdDate: form.createdDate ? new Date(form.createdDate) : undefined,
                updatedDate: form.updatedDate ? new Date(form.updatedDate) : undefined,
              })),
            }))

            set({ databases })
          }

          if (data.comboBoxItemsSources && Array.isArray(data.comboBoxItemsSources)) {
            set({ comboBoxItemsSources: data.comboBoxItemsSources })
          }

          return true
        } catch (error) {
          console.error("Error importing data:", error)
          return false
        }
      },

      exportData: () => {
        const { databases, comboBoxItemsSources } = get()
        return JSON.stringify({ databases, comboBoxItemsSources }, null, 2)
      },
    }),
    {
      name: "dynamic-db-form-builder-storage",
    },
  ),
)

import { executeQuery, executeSQL } from '../db';
import type { Database, Table, TableColumn, Relationship, Form, FormElement } from '../types';

// Database Operations
export async function getAllDatabases(): Promise<Database[]> {
  try {
    const result = await executeSQL`
      SELECT * FROM databases ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting all databases:', error);
    throw error;
  }
}

export async function getDatabaseById(id: number): Promise<Database | null> {
  try {
    const result = await executeSQL`
      SELECT * FROM databases WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0];
  } catch (error) {
    console.error(`Error getting database with id ${id}:`, error);
    throw error;
  }
}

export async function createDatabase(name: string, description: string): Promise<Database> {
  try {
    const result = await executeSQL`
      INSERT INTO databases (name, description)
      VALUES (${name}, ${description})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

export async function updateDatabase(id: number, name: string, description: string): Promise<Database> {
  try {
    const result = await executeSQL`
      UPDATE databases
      SET name = ${name}, description = ${description}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw new Error(`Database with id ${id} not found`);
    }
    
    return result[0];
  } catch (error) {
    console.error(`Error updating database with id ${id}:`, error);
    throw error;
  }
}

export async function deleteDatabase(id: number): Promise<boolean> {
  try {
    const result = await executeSQL`
      DELETE FROM databases
      WHERE id = ${id}
      RETURNING id
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting database with id ${id}:`, error);
    throw error;
  }
}

// Table Operations
export async function getTablesForDatabase(databaseId: number): Promise<Table[]> {
  try {
    const result = await executeSQL`
      SELECT * FROM tables
      WHERE database_id = ${databaseId}
      ORDER BY created_at DESC
    `;
    
    return result;
  } catch (error) {
    console.error(`Error getting tables for database ${databaseId}:`, error);
    throw error;
  }
}

export async function createTable(
  databaseId: number, 
  name: string, 
  description: string
): Promise<Table> {
  try {
    const result = await executeSQL`
      INSERT INTO tables (database_id, name, description)
      VALUES (${databaseId}, ${name}, ${description})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

export async function deleteTable(id: number): Promise<boolean> {
  try {
    const result = await executeSQL`
      DELETE FROM tables
      WHERE id = ${id}
      RETURNING id
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting table with id ${id}:`, error);
    throw error;
  }
}

// Column Operations
export async function getColumnsForTable(tableId: number): Promise<TableColumn[]> {
  try {
    const result = await executeSQL`
      SELECT * FROM columns
      WHERE table_id = ${tableId}
      ORDER BY id ASC
    `;
    
    return result;
  } catch (error) {
    console.error(`Error getting columns for table ${tableId}:`, error);
    throw error;
  }
}

export async function createColumn(
  tableId: number,
  name: string,
  type: number,
  isPrimaryKey: boolean,
  isRequired: boolean,
  defaultValue?: string
): Promise<TableColumn> {
  try {
    const result = await executeSQL`
      INSERT INTO columns (table_id, name, type, is_primary_key, is_required, default_value)
      VALUES (${tableId}, ${name}, ${type}, ${isPrimaryKey}, ${isRequired}, ${defaultValue})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating column:', error);
    throw error;
  }
}

export async function deleteColumn(id: number): Promise<boolean> {
  try {
    const result = await executeSQL`
      DELETE FROM columns
      WHERE id = ${id}
      RETURNING id
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting column with id ${id}:`, error);
    throw error;
  }
}

// Row Operations
export async function getRowsForTable(tableId: number): Promise<any[]> {
  try {
    const result = await executeSQL`
      SELECT * FROM rows
      WHERE table_id = ${tableId}
      ORDER BY created_at DESC
    `;
    
    return result;
  } catch (error) {
    console.error(`Error getting rows for table ${tableId}:`, error);
    throw error;
  }
}

export async function createRow(tableId: number, data: Record<string, any>): Promise<any> {
  try {
    const result = await executeSQL`
      INSERT INTO rows (table_id, data)
      VALUES (${tableId}, ${JSON.stringify(data)})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating row:', error);
    throw error;
  }
}

export async function updateRow(id: number, data: Record<string, any>): Promise<any> {
  try {
    const result = await executeSQL`
      UPDATE rows
      SET data = ${JSON.stringify(data)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      throw new Error(`Row with id ${id} not found`);
    }
    
    return result[0];
  } catch (error) {
    console.error(`Error updating row with id ${id}:`, error);
    throw error;
  }
}

export async function deleteRow(id: number): Promise<boolean> {
  try {
    const result = await executeSQL`
      DELETE FROM rows
      WHERE id = ${id}
      RETURNING id
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting row with id ${id}:`, error);
    throw error;
  }
}

// Relationship Operations
export async function getRelationshipsForDatabase(databaseId: number): Promise<Relationship[]> {
  try {
    const result = await executeSQL`
      SELECT * FROM relationships
      WHERE database_id = ${databaseId}
      ORDER BY created_at DESC
    `;
    
    return result;
  } catch (error) {
    console.error(`Error getting relationships for database ${databaseId}:`, error);
    throw error;
  }
}

export async function createRelationship(
  databaseId: number,
  name: string,
  sourceTableId: number,
  sourceColumnId: number,
  targetTableId: number,
  targetColumnId: number,
  type: number
): Promise<Relationship> {
  try {
    const result = await executeSQL`
      INSERT INTO relationships 
      (database_id, name, source_table_id, source_column_id, target_table_id, target_column_id, type)
      VALUES (${databaseId}, ${name}, ${sourceTableId}, ${sourceColumnId}, ${targetTableId}, ${targetColumnId}, ${type})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating relationship:', error);
    throw error;
  }
}

export async function deleteRelationship(id: number): Promise<boolean> {
  try {
    const result = await executeSQL`
      DELETE FROM relationships
      WHERE id = ${id}
      RETURNING id
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting relationship with id ${id}:`, error);
    throw error;
  }
}

// Form Operations
export async function getFormsForDatabase(databaseId: number): Promise<Form[]> {
  try {
    const result = await executeSQL`
      SELECT * FROM forms
      WHERE database_id = ${databaseId}
      ORDER BY created_at DESC
    `;
    
    return result;
  } catch (error) {
    console.error(`Error getting forms for database ${databaseId}:`, error);
    throw error;
  }
}

export async function createForm(
  databaseId: number,
  name: string,
  description: string,
  isActive: boolean = true
): Promise<Form> {
  try {
    const result = await executeSQL`
      INSERT INTO forms (database_id, name, description, is_active)
      VALUES (${databaseId}, ${name}, ${description}, ${isActive})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating form:', error);
    throw error;
  }
}

export async function deleteForm(id: number): Promise<boolean> {
  try {
    const result = await executeSQL`
      DELETE FROM forms
      WHERE id = ${id}
      RETURNING id
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting form with id ${id}:`, error);
    throw error;
  }
}

// Form Element Operations
export async function getElementsForForm(formId: number): Promise<FormElement[]> {
  try {
    const result = await executeSQL`
      SELECT * FROM form_elements
      WHERE form_id = ${formId}
      ORDER BY element_order ASC
    `;
    
    return result;
  } catch (error) {
    console.error(`Error getting elements for form ${formId}:`, error);
    throw error;
  }
}

export async function createFormElement(
  formId: number,
  label: string,
  placeholder: string,
  defaultValue: string,
  elementOrder: number,
  type: number,
  isRequired: boolean,
  isVisible: boolean,
  isEnabled: boolean,
  typeSpecificData: Record<string, any> = {}
): Promise<FormElement> {
  try {
    const result = await executeSQL`
      INSERT INTO form_elements 
      (form_id, label, placeholder, default_value, element_order, type, is_required, is_visible, is_enabled, type_specific_data)
      VALUES (${formId}, ${label}, ${placeholder}, ${defaultValue}, ${elementOrder}, ${type}, ${isRequired}, ${isVisible}, ${isEnabled}, ${JSON.stringify(typeSpecificData)})
      RETURNING *
    `;
    
    return result[0];
  } catch (error) {
    console.error('Error creating form element:', error);
    throw error;
  }
}

export async function deleteFormElement(id: number): Promise<boolean> {
  try {
    const result = await executeSQL`
      DELETE FROM form_elements
      WHERE id = ${id}
      RETURNING id
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error(`Error deleting form element with id ${id}:`, error);
    throw error;
  }
} 
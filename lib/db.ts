import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Global variable to store the database connection
let sql: NeonQueryFunction<any>;

// Initialize the database connection
export function getNeonConnection() {
  if (!sql) {
    // Check if we have a database URL
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    // Initialize the connection
    sql = neon(databaseUrl);
  }
  
  return sql;
}

// Execute a database query with parameters
export async function executeQuery<T = any>(
  query: string, 
  params: any[] = []
): Promise<T> {
  const sql = getNeonConnection();
  return sql(query, params) as Promise<T>;
}

// Execute a SQL template literal query
export async function executeSQL<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T> {
  const sql = getNeonConnection();
  return sql(strings, ...values) as Promise<T>;
}

// Initialize the database schema if it doesn't exist
export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await executeSQL`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS databases (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        database_id INTEGER REFERENCES databases(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS columns (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type INTEGER NOT NULL,
        is_primary_key BOOLEAN DEFAULT FALSE,
        is_required BOOLEAN DEFAULT FALSE,
        default_value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS rows (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS relationships (
        id SERIAL PRIMARY KEY,
        database_id INTEGER REFERENCES databases(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        source_table_id INTEGER REFERENCES tables(id) ON DELETE CASCADE,
        source_column_id INTEGER REFERENCES columns(id) ON DELETE CASCADE,
        target_table_id INTEGER REFERENCES tables(id) ON DELETE CASCADE,
        target_column_id INTEGER REFERENCES columns(id) ON DELETE CASCADE,
        type INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS forms (
        id SERIAL PRIMARY KEY,
        database_id INTEGER REFERENCES databases(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS form_elements (
        id SERIAL PRIMARY KEY,
        form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        placeholder TEXT,
        default_value TEXT,
        element_order INTEGER NOT NULL,
        type INTEGER NOT NULL,
        is_required BOOLEAN DEFAULT FALSE,
        is_visible BOOLEAN DEFAULT TRUE,
        is_enabled BOOLEAN DEFAULT TRUE,
        type_specific_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS form_table_links (
        id SERIAL PRIMARY KEY,
        form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
        element_id INTEGER REFERENCES form_elements(id) ON DELETE CASCADE,
        table_id INTEGER REFERENCES tables(id) ON DELETE CASCADE,
        column_id INTEGER REFERENCES columns(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create the initial admin user if not exists
      INSERT INTO admins (username, password)
      SELECT 
        '${process.env.ADMIN_USERNAME || 'admin'}', 
        '${process.env.ADMIN_PASSWORD || 'adminpassword'}'
      WHERE NOT EXISTS (
        SELECT 1 FROM admins WHERE username = '${process.env.ADMIN_USERNAME || 'admin'}'
      );
    `;
    
    console.log('Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
} 
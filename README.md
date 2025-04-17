# Dynamic Database Builder

A futuristic interface for creating and managing databases, tables, forms, and relationships. This application allows users to build dynamic database systems with a visual interface and connects to Neon PostgreSQL as the backend.

## Features

- **Database Management**: Create and manage multiple databases
- **Table Builder**: Design database schemas with various column types
- **Relationship Manager**: Define relationships between tables with visual connections
- **Form Builder**: Create forms that connect to your database tables
- **Admin Authentication**: Secure admin login for database management

## Tech Stack

- **Frontend**: Next.js 15.2, React 19, Tailwind CSS
- **Backend**: Neon PostgreSQL, Next.js API Routes
- **State Management**: Zustand for local UI state
- **Database Connection**: @neondatabase/serverless
- **UI Components**: Custom futuristic components + Radix UI

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Neon PostgreSQL account and project (https://neon.tech)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dynamic-database-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with your Neon database connection:
   ```
   DATABASE_URL="postgresql://<user>:<password>@<endpoint_hostname>.neon.tech:<port>/<dbname>?sslmode=require"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="secure-password"
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Initialize the database schema by visiting `http://localhost:3000/api/init` once or running:
   ```bash
   npm run db:init
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Deployment

This project can be deployed to Vercel with the following steps:

1. Push your repository to GitHub.
2. Connect to Vercel and import the repository.
3. Configure the environment variables in the Vercel dashboard.
4. Deploy the project.

## Project Structure

```
/
├── app/                # Next.js app directory
│   ├── api/            # API routes
│   │   ├── admin/      # Admin authentication
│   │   ├── databases/  # Database CRUD operations
│   │   └── init/       # Database initialization
│   ├── admin/          # Admin dashboard
│   └── page.tsx        # Landing page
├── components/         # React components
│   ├── admin/          # Admin-specific components
│   ├── database/       # Database management components
│   ├── forms/          # Form building components
│   ├── layout/         # Layout and global UI components
│   ├── tables/         # Table management components
│   └── ui/             # Reusable UI components
│       └── futuristic/ # Futuristic-themed UI components
├── lib/                # Utility functions
│   ├── db.ts           # Database connection
│   ├── providers/      # React context providers
│   ├── services/       # Database services
│   ├── store.ts        # Global state management 
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Utility functions
├── public/             # Static assets
└── styles/             # Global styles
    ├── globals.css     # Global CSS
    ├── futuristic.css  # Futuristic theme CSS
    └── themes/         # Theme configurations
```

## License

This project is licensed under the MIT License.

## Acknowledgments

- Neon PostgreSQL for serverless database hosting
- Vercel for application deployment 
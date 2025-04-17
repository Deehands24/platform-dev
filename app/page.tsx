import Link from "next/link";
import { FuturisticButton } from "@/components/futuristic-button";
import { FuturisticCard } from "@/components/futuristic-card";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Dynamic Database Builder
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create, manage, and visualize databases with our futuristic interface. 
            Build tables, forms, and relationships in one place.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <FuturisticCard>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-100 mb-3">Database Management</h2>
              <p className="text-gray-300">
                Create and manage multiple databases with intuitive controls.
              </p>
            </div>
          </FuturisticCard>

          <FuturisticCard>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-100 mb-3">Table Builder</h2>
              <p className="text-gray-300">
                Design database schemas with support for various column types.
              </p>
            </div>
          </FuturisticCard>

          <FuturisticCard>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-100 mb-3">Relationship Manager</h2>
              <p className="text-gray-300">
                Define relationships between tables with visual connections.
              </p>
            </div>
          </FuturisticCard>
        </div>

        <div className="text-center">
          <Link href="/admin">
            <FuturisticButton className="px-8 py-4 text-lg">
              Launch Dashboard
            </FuturisticButton>
          </Link>
        </div>
      </div>
    </div>
  );
}

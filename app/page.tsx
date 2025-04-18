import Dashboard from "@/components/dashboard"

export default function Home() {
  return (
    <main className="min-h-screen py-8 relative">
      {/* Futuristic background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grey gradient backdrop */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>

        {/* Subtle light effects */}
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-gray-500/10 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-gray-400/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gray-600/5 blur-3xl"></div>

        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(200,200,200,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,200,200,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Checker pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(200,200,200,0.03)_25%,transparent_25%,transparent_75%,rgba(200,200,200,0.03)_75%)] bg-[size:20px_20px]"></div>
      </div>

      <Dashboard />
    </main>
  )
}

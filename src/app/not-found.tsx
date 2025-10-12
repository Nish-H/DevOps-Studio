export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-300">404 - Page Not Found</h2>
        <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  )
}
import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3001";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setResult("");

    try {
      const response = await fetch(
        `${API_URL}/api/cards/search?name=${encodeURIComponent(searchTerm)}&game=Pokemon`
      );
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(
        JSON.stringify(
          { error: error instanceof Error ? error.message : "Failed to fetch" },
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pokemon Card Search</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Enter card name..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white text-black"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <textarea
        readOnly
        value={result}
        placeholder="Results will appear here..."
        className="w-full h-[500px] p-3 font-mono text-sm border border-gray-300 rounded bg-gray-900 text-green-400"
      />
    </div>
  );
}

export default App;
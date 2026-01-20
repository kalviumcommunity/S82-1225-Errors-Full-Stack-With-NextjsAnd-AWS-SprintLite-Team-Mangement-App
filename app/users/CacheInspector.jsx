"use client";

import { useSWRConfig } from "swr";
import { useState } from "react";

/**
 * CacheInspector Component
 *
 * Demonstrates:
 * - SWR cache inspection
 * - Cache hits vs misses
 * - Cache key management
 *
 * This component shows what's currently cached by SWR,
 * helping developers understand caching behavior.
 */

export default function CacheInspector() {
  const { cache } = useSWRConfig();
  const [isExpanded, setIsExpanded] = useState(false);
  const [cacheData, setCacheData] = useState([]);

  const inspectCache = () => {
    console.log("🔍 Inspecting SWR Cache...");

    // Get all cache keys
    const keys = Array.from(cache.keys());
    console.log("📦 Cache Keys:", keys);

    // Get cache data for each key
    const data = keys.map((key) => {
      const value = cache.get(key);
      console.log(`📊 Cache[${key}]:`, value);

      return {
        key: key.toString(),
        hasData: !!value?.data,
        isValidating: value?.isValidating || false,
        error: value?.error ? "Has Error" : null,
        dataPreview: value?.data ? JSON.stringify(value.data).slice(0, 100) + "..." : "No data",
      };
    });

    setCacheData(data);
    setIsExpanded(true);
  };

  const clearCache = () => {
    console.log("🗑️ Clearing SWR cache...");

    // Clear all cache entries
    const keys = Array.from(cache.keys());
    keys.forEach((key) => {
      cache.delete(key);
      console.log(`❌ Deleted cache key: ${key}`);
    });

    setCacheData([]);
    alert("Cache cleared! Refresh to see cache miss.");
  };

  return (
    <div className="my-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">🔍 Cache Inspector</h2>
          <p className="text-sm text-gray-600 mt-1">View SWR cache keys, hits, and misses</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={inspectCache}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
          >
            Inspect Cache
          </button>

          <button
            onClick={clearCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {isExpanded && cacheData.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Cached Entries: {cacheData.length}</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Collapse ▲
            </button>
          </div>

          {cacheData.map((item, index) => (
            <div key={index} className="p-3 bg-white border border-yellow-200 rounded">
              <div className="flex justify-between items-start mb-2">
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{item.key}</code>

                <div className="flex gap-2">
                  {item.hasData && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      ✅ Has Data
                    </span>
                  )}
                  {item.isValidating && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      🔄 Validating
                    </span>
                  )}
                  {item.error && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                      ❌ Error
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600 mt-2">
                <strong>Preview:</strong> {item.dataPreview}
              </div>
            </div>
          ))}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="font-semibold text-blue-800 mb-2">📚 Cache Hit vs Cache Miss:</p>
            <ul className="text-blue-700 space-y-1 ml-4 list-disc">
              <li>
                <strong>Cache Hit:</strong> Data returned instantly from cache (stale data)
              </li>
              <li>
                <strong>Cache Miss:</strong> No cached data, must fetch from API (loading state)
              </li>
              <li>
                <strong>Revalidation:</strong> Background fetch to update stale data
              </li>
            </ul>
          </div>
        </div>
      )}

      {isExpanded && cacheData.length === 0 && (
        <div className="mt-4 p-4 bg-white border border-yellow-200 rounded text-center">
          <p className="text-gray-600">No cache entries found</p>
          <p className="text-sm text-gray-500 mt-1">
            This is a <strong>Cache Miss</strong> - Data will be fetched from API
          </p>
        </div>
      )}
    </div>
  );
}

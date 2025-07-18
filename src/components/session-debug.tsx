"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export function SessionDebug() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm"
      >
        {isVisible ? "Hide" : "Show"} Session Debug
      </button>
      
      {isVisible && (
        <div className="mt-2 p-4 bg-black/80 text-white rounded-md max-w-md max-h-96 overflow-auto">
          <h3 className="text-lg font-bold mb-2">Session Status: {status}</h3>
          {session ? (
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(session, null, 2)}
            </pre>
          ) : (
            <p>No session data available</p>
          )}
        </div>
      )}
    </div>
  );
} 
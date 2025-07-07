// src/components/WeeklySummaryModal.tsx
import React from "react";

type WeeklySummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: string | null;
};

export function WeeklySummaryModal({
  isOpen,
  onClose,
  summary,
}: WeeklySummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      {/* Modal content */}
      <div className="bg-white dark:bg-[#1a1a2e] rounded-xl shadow-xl p-6 max-w-2xl w-[90%] relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Weekly Summary
        </h2>

        <div className="text-sm text-gray-700 dark:text-gray-300 max-h-[60vh] overflow-y-auto whitespace-pre-line leading-relaxed">
          {summary ? (
            <p>{summary}</p>
          ) : (
            <p className="italic text-muted-foreground">
              No summary available for this week.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// src/components/PreviousWeeks.tsx
import React, { useState } from "react";
import { eachDayOfInterval, format } from "date-fns";
import LiveMoodLineChart from "./LiveMoodLineChart";
import type { WeeklyReport } from "@/pages/Reports";

interface Props {
  weeklyReports: WeeklyReport[];
}

export default function PreviousWeeks({ weeklyReports }: Props) {
  // default to the most recent week (id === 1)
  const [activeWeekId, setActiveWeekId] = useState<number>(
    weeklyReports[0]?.id ?? 1
  );
  const report = weeklyReports.find((r) => r.id === activeWeekId)!;

  return (
    <div className="space-y-6">
      {/* 1️⃣ Week selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {weeklyReports.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveWeekId(r.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition ${
              r.id === activeWeekId
                ? "bg-diary-purple text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {r.dateRange}
          </button>
        ))}
      </div>

      {/* 2️⃣ Writing Days */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Writing Days</h3>
        <div className="flex space-x-1">
          {eachDayOfInterval({
            start: report.startDate,
            end: report.endDate,
          }).map((day) => {
            const dayNum = day.getDate();
            const hasEntry = report.daysWithEntries.includes(dayNum);
            return (
              <div
                key={day.toISOString()}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  hasEntry
                    ? "bg-diary-purple text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3️⃣ Summary */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Summary</h3>
        <p className="text-gray-800 dark:text-gray-200">{report.summary}</p>
      </section>

      {/* 4️⃣ Mood Trend */}
      {report.moodByDate && report.moodByDate.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-2">Mood Trend</h3>
          <LiveMoodLineChart data={report.moodByDate} />
        </section>
      )}
    </div>
  );
}

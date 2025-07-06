import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";

type TodoItem = {
  task: string;
  completed: boolean;
};

type Entry = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  todos: TodoItem[];
  images: string[];
  created_at: string;
  updated_at: string;
};

type WeeklySummaryData = {
  summary: string;
  emotionalPatterns: string;
  achievements: string[];
  improvement: string;
  goalProgress: string;
  notable: string;
};

// Convert UTC to IST
const toIST = (date: Date) => new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
// Convert IST to UTC
const fromIST = (date: Date) => new Date(date.getTime() - 5.5 * 60 * 60 * 1000);

const startOfWeekIST = (date: Date) => {
  const ist = toIST(date);
  const start = startOfWeek(ist, { weekStartsOn: 1 });
  return fromIST(start);
};

const endOfWeekIST = (date: Date) => {
  const ist = toIST(date);
  const end = endOfWeek(ist, { weekStartsOn: 1 });
  end.setHours(23, 59, 59, 999);
  return fromIST(end);
};

export default function WeeklySummary() {
  const [summaryData, setSummaryData] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const start = startOfWeekIST(new Date());
      const end = endOfWeekIST(new Date());

      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching entries:", error);
        setError("Failed to load weekly summary.");
        setLoading(false);
        return;
      }

      const entries: Entry[] = (data || []).map((entry: any) => ({
        id: entry.id,
        user_id: entry.user_id,
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        tags: Array.isArray(entry.tags) ? entry.tags : [],
        todos: Array.isArray(entry.todos) ? (entry.todos as TodoItem[]) : [],
        images: Array.isArray(entry.images) ? (entry.images as string[]) : [],
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      }));

      if (entries.length === 0) {
        setError("No diary entries found for this week.");
        setLoading(false);
        return;
      }

      const formatted = entries
        .map((entry) => {
          return `Date: ${format(new Date(entry.created_at), "yyyy-MM-dd")}
Mood: ${entry.mood}
Tags: ${entry.tags?.join(", ") || "None"}
To-dos: ${
            entry.todos?.map((t) => `${t.task} [${t.completed ? "✓" : "✗"}]`).join(", ") || "None"
          }
Text: ${entry.content?.slice(0, 500) || "No content"}
Images: ${entry.images?.length || 0}\n`;
        })
        .join("\n---\n");

      const prompt = `Based on the following diary entries, generate a weekly analysis object with this exact JSON format:

{
  "summary": "...",
  "emotionalPatterns": "...",
  "achievements": ["...", "..."],
  "improvement": "...",
  "goalProgress": "...",
  "notable": "..."
}

Avoid any explanation or formatting, just return valid JSON. Analyze this:

${formatted}
`;

      try {
        const response = await fetch("https://api.together.xyz/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
            messages: [
              {
                role: "system",
                content: "You are an assistant that returns only JSON structured summaries of diary entries.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        const result = await response.json();
        const aiText = result.choices?.[0]?.message?.content;
        const jsonMatch = aiText?.match(/{[\s\S]*}/);
        if (!jsonMatch) throw new Error("No JSON found in AI response");

        const parsed = JSON.parse(jsonMatch[0]) as WeeklySummaryData;
        setSummaryData(parsed);
      } catch (err) {
        console.error("Error generating summary:", err);
        setError("Failed to generate summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Analyzing entries and generating summary...</p>;
  }

  if (error) {
    return <p className="text-red-500 font-medium">{error}</p>;
  }

  if (!summaryData) {
    return <p className="text-gray-500 italic">No summary available.</p>;
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md dark:bg-gray-900">
      <section>
        <h2 className="text-2xl font-bold text-blue-600">📝 Summary</h2>
        <p className="mt-2 text-lg text-gray-800 dark:text-gray-200">{summaryData.summary}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-green-600">💬 Emotional Patterns</h2>
        <p className="mt-2 text-lg text-gray-800 dark:text-gray-200">{summaryData.emotionalPatterns}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-purple-600">🏆 Achievements</h2>
        {summaryData.achievements.length > 0 ? (
          <ul className="list-disc ml-6 mt-2 text-lg text-gray-800 dark:text-gray-200">
            {summaryData.achievements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-lg text-gray-500 italic">No achievements mentioned.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-yellow-600">🔧 Areas for Improvement</h2>
        <p className="mt-2 text-lg text-gray-800 dark:text-gray-200">{summaryData.improvement}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-pink-600">🎯 Goal Progress</h2>
        <p className="mt-2 text-lg text-gray-800 dark:text-gray-200">{summaryData.goalProgress}</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-indigo-600">🌟 Notable Observations</h2>
        <p className="mt-2 text-lg text-gray-800 dark:text-gray-200">{summaryData.notable}</p>
      </section>
    </div>
  );
}

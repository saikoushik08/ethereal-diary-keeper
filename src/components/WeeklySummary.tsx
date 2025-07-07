// src/components/WeeklySummary.tsx
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
    async function fetchAndGenerateSummary() {
      const start = startOfWeekIST(new Date());
      const end = endOfWeekIST(new Date());

      const {
        data: {
          user
        },
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const userId = user.id;

      // Check for existing summary
      const { data: existing, error: fetchError } = await supabase
        .from("weekly_summaries")
        .select("summary")
        .eq("user_id", userId)
        .eq("week_start", format(start, "yyyy-MM-dd"))
        .eq("week_end", format(end, "yyyy-MM-dd"))
        .maybeSingle();

      if (existing?.summary) {
        try {
          const parsed = typeof existing.summary === "string"
            ? JSON.parse(existing.summary)
            : existing.summary;
          setSummaryData(parsed);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Error parsing stored summary:", e);
        }
      }

      // Fetch entries if no summary exists
      const { data, error: fetchEntriesError } = await supabase
        .from("entries")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

      if (fetchEntriesError) {
        console.error("Error fetching entries:", fetchEntriesError);
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
        todos: Array.isArray(entry.todos) ? entry.todos as TodoItem[] : [],
        images: Array.isArray(entry.images) ? entry.images as string[] : [],
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      }));

      if (entries.length === 0) {
        setError("No diary entries found for this week.");
        setLoading(false);
        return;
      }

      const formatted = entries
        .map((entry) => `Date: ${format(new Date(entry.created_at), "yyyy-MM-dd")}
Mood: ${entry.mood}
Tags: ${entry.tags.join(", ") || "None"}
To-dos: ${entry.todos.map((t) => `${t.task} [${t.completed ? "✓" : "✗"}]`).join(", ") || "None"}
Text: ${entry.content.slice(0, 500) || "No content"}
Images: ${entry.images.length}\n`)
        .join("\n---\n");

      const prompt = `You are an expert diary analyst. Based on the following diary entries, return a JSON object exactly in this shape:

{
  "summary": "...",
  "emotionalPatterns": "...",
  "achievements": ["...", "..."],
  "improvement": "...",
  "goalProgress": "...",
  "notable": "..."
}

**Requirements**:
- The **summary** field must be a detailed paragraph of **3 to 5 complete sentences**, discussing mood trends, any changes over the week, and high-level takeaways.
- **EmotionalPatterns**: At least 2 sentences describing how emotions shifted or stayed consistent.
- **Achievements**: List any key wins or milestones.
- **Improvement**: 1–2 sentences with actionable suggestions.
- **GoalProgress**: 1–2 sentences on progress toward any goals.
- **Notable**: 1–2 sentences highlighting anything unusual or interesting.

Return **only** the valid JSON—no extra text. Here are the entries to analyze:

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
              { role: "system", content: "You output exactly JSON, no fluff." },
              { role: "user", content: prompt },
            ],
            temperature: 0.6,
          }),
        });

        const json = await response.json();
        const aiText = json.choices?.[0]?.message?.content ?? "";
        const match = aiText.match(/{[\s\S]*}/);
        if (!match) throw new Error("No JSON in AI response");
        const parsed = JSON.parse(match[0]) as WeeklySummaryData;
        setSummaryData(parsed);

        // Save to Supabase
        await supabase.from("weekly_summaries").insert([
          {
            user_id: userId,
            week_start: format(start, "yyyy-MM-dd"),
            week_end: format(end, "yyyy-MM-dd"),
            summary: parsed,
          },
        ]);
      } catch (e) {
        console.error("Error generating or saving summary:", e);
        setError("Failed to generate or store the summary.");
      } finally {
        setLoading(false);
      }
    }

    fetchAndGenerateSummary();
  }, []);

  if (loading) return <p className="text-muted-foreground">Analyzing entries and generating summary…</p>;
  if (error) return <p className="text-red-500 font-medium">{error}</p>;
  if (!summaryData) return <p className="text-gray-500 italic">No summary available.</p>;

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
            {summaryData.achievements.map((a, i) => (
              <li key={i}>{a}</li>
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

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

const startOfWeekUTC = (date: Date) => {
  const local = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
};

const endOfWeekUTC = (date: Date) => {
  const local = endOfWeek(date, { weekStartsOn: 1 });
  return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate(), 23, 59, 59));
};

export default function WeeklySummary() {
  const [summary, setSummary] = useState<string>("Generating summary...");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEntries = async () => {
      const start = startOfWeekUTC(new Date());
      const end = endOfWeekUTC(new Date());

      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching entries:", error);
        setSummary("Failed to load weekly summary.");
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
        setSummary("No diary entries found for this week.");
        setLoading(false);
        return;
      }

      const formatted = entries
        .map((entry) => {
          return `Date: ${format(new Date(entry.created_at), "yyyy-MM-dd")}
Mood: ${entry.mood}
Tags: ${entry.tags?.join(", ") || "None"}
To-dos: ${entry.todos
              ?.map((t) => `${t.task} [${t.completed ? "✓" : "✗"}]`)
              .join(", ") || "None"}
Text: ${entry.content?.slice(0, 500) || "No content"}
Images: ${entry.images?.length || 0}\n`;
        })
        .join("\n---\n");

      const prompt = `You are a helpful assistant that generates a detailed weekly summary from a user's diary data.

Analyze the following diary entries and summarize the week in structured format. Include:
- General mood and emotions
- Frequent tags or themes
- Progress on to-do tasks
- Significant events or thoughts
- Any visual/image-related insights

### Diary Entries:
${formatted}

### Summary:
`;

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are an expert at analyzing human diary data." },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        const json = await response.json();
        const aiSummary = json.choices?.[0]?.message?.content;

        setSummary(aiSummary || "AI could not generate a summary.");
      } catch (err) {
        console.error("AI request error:", err);
        setSummary("Failed to generate summary using AI.");
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-muted-foreground">Analyzing entries and generating summary...</p>
      ) : (
        <pre className="whitespace-pre-wrap text-sm">{summary}</pre>
      )}
    </div>
  );
}

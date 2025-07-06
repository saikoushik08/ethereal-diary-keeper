export async function generateWeeklySummary(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // you can change to gpt-4 if you have access
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that summarizes users' diary entries weekly in a well-structured way including mood trends, highlights, goals, tags, and productivity patterns.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  const json = await response.json();
  return json.choices[0].message.content.trim();
}

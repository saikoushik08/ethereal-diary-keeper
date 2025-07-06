export async function generateTogetherSummary(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;

  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes diary entries into a weekly report with emotional tone, tags, habits, productivity, and insights.",
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
    throw new Error(`Together AI API error: ${errorText}`);
  }

  const json = await response.json();
  return json.choices[0].message.content.trim();
}

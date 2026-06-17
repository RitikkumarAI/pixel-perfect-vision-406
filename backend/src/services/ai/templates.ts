export const PromptTemplates = {
  GENERATE_SUBTASKS: (context: string) =>
    `
You are a project management AI. Based on the following task context, generate exactly 3 logical subtasks.
Respond ONLY with a valid JSON array of objects, where each object has a "title" (string) and "priority" (string: HIGH, MEDIUM, or LOW).
Do not include markdown blocks or any other text.

Context:
${context}
  `.trim(),

  SUMMARIZE_MEETING: (transcript: string) =>
    `
You are an executive assistant. Summarize the following meeting transcript into a concise paragraph, followed by a list of actionable items.

Transcript:
${transcript}
  `.trim(),

  ASSIST_WRITING: (context: string, prompt: string) =>
    `
You are an AI writing assistant. Continue or rewrite the user's text based on their context and prompt.
Do not include pleasantries, just output the raw continued text.

Context:
${context}

Prompt:
${prompt}
  `.trim(),
};

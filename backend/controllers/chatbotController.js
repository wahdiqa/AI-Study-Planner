const Groq = require("groq-sdk");
const Task = require("../models/Task");
const Event = require("../models/Event");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─────────────────────────────
// Fetch context
// ─────────────────────────────
const fetchAppState = async () => {
  const tasks = await Task.find().sort({ createdAt: -1 }).lean();
  const events = await Event.find().sort({ date: 1 }).lean();
  return { tasks, events };
};

// ─────────────────────────────
// Execute AI action safely
// ─────────────────────────────
const executeAction = async (action) => {
  if (!action?.type || action.type === "NONE") {
    return { success: false, message: null };
  }

  const { type, payload = {} } = action;

  try {
    switch (type) {
      case "CREATE_TASK": {
        const task = await Task.create({
          title: payload.title,
          description: payload.description || "",
          priority: payload.priority || "medium",
          deadline: payload.deadline ? new Date(payload.deadline) : null,
          subject: payload.subject || "",
        });

        return {
          success: true,
          message: `✅ Task created: ${task.title}`,
        };
      }

      case "DELETE_TASK": {
        const task = await Task.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!task) {
          return { success: false, message: `❌ Task not found` };
        }

        await task.deleteOne();

        return {
          success: true,
          message: `🗑️ Task deleted`,
        };
      }

      case "MARK_TASK_DONE": {
        const task = await Task.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!task) {
          return { success: false, message: `❌ Task not found` };
        }

        task.completed = true;
        await task.save();

        return {
          success: true,
          message: `✅ Task marked as done`,
        };
      }

      case "MARK_TASK_UNDONE": {
        const task = await Task.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!task) {
          return { success: false, message: `❌ Task not found` };
        }

        task.completed = false;
        await task.save();

        return {
          success: true,
          message: `↩️ Task marked as pending`,
        };
      }

      case "UPDATE_TASK": {
        const task = await Task.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!task) {
          return { success: false, message: `❌ Task not found` };
        }

        if (payload.newTitle) task.title = payload.newTitle;
        if (payload.priority) task.priority = payload.priority;
        if (payload.deadline) task.deadline = new Date(payload.deadline);
        if (payload.description) task.description = payload.description;

        await task.save();

        return {
          success: true,
          message: `✏️ Task updated`,
        };
      }

      case "CREATE_EVENT": {
        const event = await Event.create({
          title: payload.title,
          date: new Date(payload.date),
          type: payload.type || "other",
          important: payload.important || false,
        });

        return {
          success: true,
          message: `📅 Event created: ${event.title}`,
        };
      }

      case "DELETE_EVENT": {
        const event = await Event.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!event) {
          return { success: false, message: `❌ Event not found` };
        }

        await event.deleteOne();

        return {
          success: true,
          message: `🗑️ Event deleted`,
        };
      }

      default:
        return { success: false, message: null };
    }
  } catch (err) {
    console.error("Action error:", err);
    return { success: false, message: "⚠️ Action failed" };
  }
};

// ─────────────────────────────
// CHAT CONTROLLER
// ─────────────────────────────
const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message required",
      });
    }

    const { tasks, events } = await fetchAppState();
    const now = new Date();

    // ── IMPROVED SYSTEM PROMPT ──
    const systemPrompt = `
You are an intelligent, friendly, and encouraging AI study assistant.
Your goal is to help students manage their tasks, events, and study schedules efficiently.

CURRENT DATE & TIME: ${now.toLocaleString()}

CURRENT TASKS:
${tasks.length === 0 ? "No tasks currently." : tasks.map((t) => `- [${t._id}] "${t.title}" | Priority: ${t.priority} | Completed: ${t.completed} | Deadline: ${t.deadline ? new Date(t.deadline).toLocaleDateString() : "None"}`).join("\n")}

CURRENT EVENTS:
${events.length === 0 ? "No events currently." : events.map((e) => `- [${e._id}] "${e.title}" | Date: ${new Date(e.date).toLocaleDateString()} | Type: ${e.type} | Important: ${e.important}`).join("\n")}

YOUR CAPABILITIES:
- You can create, delete, mark as done/undone, or update tasks.
- You can create or delete events.
- You can answer general questions and provide study tips.
- You can analyze the user's schedule and suggest priorities.

STRICT RESPONSE FORMAT:
Always respond with a valid JSON object. Do not include any text outside the JSON.
{
  "reply": "Your conversational response here. Be helpful, warm, and brief.",
  "action": {
    "type": "CREATE_TASK | DELETE_TASK | MARK_TASK_DONE | MARK_TASK_UNDONE | UPDATE_TASK | CREATE_EVENT | DELETE_EVENT | NONE",
    "payload": { ... }
  }
}

ACTION RULES:
- For CREATE_TASK: { "title": "...", "description": "...", "priority": "low|medium|high", "deadline": "ISO date", "subject": "..." }
- For DELETE_TASK/MARK_TASK_DONE/MARK_TASK_UNDONE: { "title": "Exact or partial title" }
- For UPDATE_TASK: { "title": "Current title", "newTitle": "...", "priority": "...", "deadline": "...", "description": "..." }
- For CREATE_EVENT: { "title": "...", "date": "ISO date", "type": "exam|school|personal|deadline|other", "important": boolean }
- For DELETE_EVENT: { "title": "Exact or partial title" }
- If no database action is needed, set type to "NONE" and payload to {}.

CONVERSATIONAL GUIDELINES:
- If you are performing an action, acknowledge it in the "reply" (e.g., "Sure, I've added that to your list!").
- If the user asks a question about their schedule, use the provided context to answer.
- Be encouraging! Use emojis like 📚, ✅, 🎓, 🚀.
- Handle relative dates (e.g., "tomorrow", "next Friday") by calculating them from the CURRENT DATE.
`;

    const messages = [
      ...history.map(h => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content;

    // ── SAFE JSON PARSE ──
    let parsed;
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: extract JSON if there's text around it
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = { reply: raw, action: { type: "NONE", payload: {} } };
        }
      } else {
        parsed = { reply: raw, action: { type: "NONE", payload: {} } };
      }
    }

    const action = parsed.action || { type: "NONE", payload: {} };
    const actionResult = await executeAction(action);

    // ── COMBINED REPLY ──
    let finalReply = parsed.reply || "I've processed your request.";
    
    // If there was an action error, inform the user
    if (action.type !== "NONE" && !actionResult.success && actionResult.message) {
      finalReply += `\n\n(Note: ${actionResult.message})`;
    }

    return res.json({
      success: true,
      reply: finalReply,
      actionResult: actionResult.message ? actionResult : null,
      action,
    });

  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({
      success: false,
      message: "I'm having trouble connecting right now. Please try again later.",
    });
  }
};

module.exports = { chat };
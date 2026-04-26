const Anthropic = require("@anthropic-ai/sdk");
const Task = require("../models/Task");
const Event = require("../models/Event");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─────────────────────────────────────────────
// Fetch current app state
// ─────────────────────────────────────────────
const fetchAppState = async () => {
  const tasks = await Task.find().sort({ createdAt: -1 }).lean();
  const events = await Event.find().sort({ date: 1 }).lean();
  return { tasks, events };
};

// ─────────────────────────────────────────────
// Execute action
// ─────────────────────────────────────────────
const executeAction = async (action) => {
  if (!action?.type || action.type === "NONE") {
    return { ok: true, message: null };
  }

  const { type, payload = {} } = action;

  try {
    switch (type) {
      // ───────── TASKS ─────────
      case "CREATE_TASK": {
        const task = await Task.create({
          title: payload.title,
          description: payload.description || "",
          priority: payload.priority || "medium",
          deadline: payload.deadline ? new Date(payload.deadline) : null,
          subject: payload.subject || "",
        });

        return {
          ok: true,
          message: `✅ Task "${task.title}" created.`,
          data: task,
        };
      }

      case "DELETE_TASK": {
        const task = await Task.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!task) return { ok: false, message: `❌ Task not found.` };

        await task.deleteOne();
        return { ok: true, message: `🗑️ Task deleted.` };
      }

      case "MARK_TASK_DONE": {
        const task = await Task.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!task) return { ok: false, message: `❌ Task not found.` };

        task.completed = true;
        await task.save();

        return { ok: true, message: `✅ Task marked as done.` };
      }

      case "MARK_TASK_UNDONE": {
        const task = await Task.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!task) return { ok: false, message: `❌ Task not found.` };

        task.completed = false;
        await task.save();

        return { ok: true, message: `↩️ Task marked as pending.` };
      }

      case "UPDATE_TASK": {
        const task = await Task.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!task) return { ok: false, message: `❌ Task not found.` };

        if (payload.newTitle) task.title = payload.newTitle;
        if (payload.priority) task.priority = payload.priority;
        if (payload.deadline) task.deadline = new Date(payload.deadline);
        if (payload.description) task.description = payload.description;

        await task.save();

        return { ok: true, message: `✏️ Task updated.` };
      }

      // ───────── EVENTS ─────────
      case "CREATE_EVENT": {
        const event = await Event.create({
          title: payload.title,
          description: payload.description || "",
          date: new Date(payload.date),
          type: payload.type || "other",
          important: payload.important || false,
          color: payload.color || "#6366f1",
        });

        return {
          ok: true,
          message: `📅 Event "${event.title}" created.`,
          data: event,
        };
      }

      case "DELETE_EVENT": {
        const event = await Event.findOne({
          title: { $regex: payload.title, $options: "i" },
        });

        if (!event) return { ok: false, message: `❌ Event not found.` };

        await event.deleteOne();
        return { ok: true, message: `🗑️ Event deleted.` };
      }

      default:
        return { ok: true, message: null };
    }
  } catch (err) {
    console.error("Action execution error:", err);
    return { ok: false, message: "⚠️ Action failed." };
  }
};

// ─────────────────────────────────────────────
// MAIN CHAT CONTROLLER
// ─────────────────────────────────────────────
const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const { tasks, events } = await fetchAppState();

    const systemPrompt = `
You are an AI study assistant.

CURRENT DATE: ${new Date().toISOString()}

TASKS:
${tasks.length ? tasks.map(t => `- ${t.title} (${t.completed ? "done" : "pending"})`).join("\n") : "None"}

EVENTS:
${events.length ? events.map(e => `- ${e.title} (${e.date})`).join("\n") : "None"}

IMPORTANT RULES:
- ALWAYS return ONLY valid JSON (no markdown, no explanation)
- DO NOT include confirmation messages like "Task created"
- Backend will handle confirmations

FORMAT:
{
  "reply": "",
  "action": {
    "type": "CREATE_TASK | DELETE_TASK | MARK_TASK_DONE | MARK_TASK_UNDONE | UPDATE_TASK | CREATE_EVENT | DELETE_EVENT | NONE",
    "payload": {}
  }
}

If no action needed:
{ "type": "NONE", "payload": {} }
`;

    const safeHistory = history.slice(-10);

    const messages = [
      ...safeHistory.map(h => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const rawText = response.content[0].text;

    let parsed;

    try {
      const cleaned = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        reply: "",
        action: { type: "NONE", payload: {} },
      };
    }

    const action = parsed.action || { type: "NONE", payload: {} };

    const actionResult = await executeAction(action);

    return res.json({
      success: true,
      reply: actionResult.message || "Done ✔️",
      action,
    });

  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { chat };
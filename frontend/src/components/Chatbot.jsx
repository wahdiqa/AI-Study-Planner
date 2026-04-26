import React, { useState, useRef, useEffect } from "react";
import { chatbotAPI } from "../services/api";

const SUGGESTIONS = [
  "Add task 'Math homework' due tomorrow",
  "Mark 'Physics homework' as done",
  "What tasks are overdue?",
  "Delete my English task",
  "Add exam 'Chemistry' next Monday",
  "Show me my high priority tasks",
];

const formatTime = (date) =>
  date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const WELCOME_MSG = {
  id: "welcome",
  role: "bot",
  content: "Hi! I'm your AI study assistant \n\nI can help you manage tasks and events using natural language. Try saying:\n• \"Add task 'read chapter 5' due Friday\"\n• \"Mark physics homework as done\"\n• \"Delete my math task\"",
  time: new Date(),
};

const Chatbot = ({ onDataChange }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const buildHistory = () =>
    messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content }));

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now(), role: "user", content: trimmed, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await chatbotAPI.send(trimmed, buildHistory());

      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        content: data.reply,
        actionResult: data.actionResult || null,
        time: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);

      // If an action was performed, refresh the parent data
      if (data.action && data.action.type !== "NONE") {
        onDataChange();
      }
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        role: "bot",
        content: "Sorry, I ran into an error. Please check your API key or try again.",
        time: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className="chatbot-fab"
        onClick={() => setOpen((o) => !o)}
        title="Open AI Assistant"
      >
        {open ? "✕" : "✧"}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-avatar">✧</div>
            <div>
              <div className="chatbot-name">Study Assistant</div>
              <div className="chatbot-status">Online</div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.role}`}>
                <div
                  className="chat-bubble"
                  style={{
                    whiteSpace: "pre-wrap",
                    ...(msg.error ? { borderColor: "var(--red)", color: "var(--red)" } : {}),
                  }}
                >
                  {msg.content}
                </div>
                {msg.actionResult && (
                  <div className={`chat-action-result ${msg.actionResult.success ? "" : "error"}`}>
                    {msg.actionResult.message}
                  </div>
                )}
                <span className="chat-time">{formatTime(new Date(msg.time))}</span>
              </div>
            ))}

            {loading && (
              <div className="chat-msg bot">
                <div className="typing-dots">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {messages.length <= 2 && (
            <div className="suggestion-chips">
              {SUGGESTIONS.slice(0, 3).map((s) => (
                <button key={s} className="chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              className="chatbot-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

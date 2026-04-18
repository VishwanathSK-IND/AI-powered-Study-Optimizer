// src/pages/Insights.jsx
// Chat history persists across navigation using localStorage

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useStudy } from "../context/StudyContext";
import { useAuth } from "../context/AuthContext";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const callGroq = async (messages) => {
  if (!GROQ_API_KEY) throw new Error("API key not found. Set VITE_GROQ_API_KEY in your .env file.");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

export default function Insights() {
  const { currentUser } = useAuth();
  const { subjects, sessions, goals } = useStudy();

  const [insight, setInsight]         = useState("");
  const [generating, setGenerating]   = useState(false);
  const [aiError, setAiError]         = useState("");

  // ── Chat state — loaded from localStorage on mount ────────
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError]     = useState("");

  const chatBottomRef = useRef(null);

  // localStorage key is per user so different users don't share history
  const chatKey = currentUser ? `studyos_${currentUser.uid}_chat` : null;

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    if (!chatKey) return;
    try {
      const saved = localStorage.getItem(chatKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch {
      // corrupted data — start fresh
      localStorage.removeItem(chatKey);
    }
  }, [chatKey]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (!chatKey || messages.length === 0) return;
    try {
      // Keep only last 40 messages so localStorage doesn't fill up
      const toSave = messages.slice(-40);
      localStorage.setItem(chatKey, JSON.stringify(toSave));
    } catch {
      // localStorage full — silently skip
    }
  }, [messages, chatKey]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // ── Build study data summary ──────────────────────────────
  const buildSummary = useCallback(() => {
    const totalMins = sessions.reduce((s, sess) => s + (sess.duration || 0), 0);

    const subjectLines = subjects.map((sub) => {
      const mins = sessions
        .filter((s) => s.subjectId === sub.id)
        .reduce((a, b) => a + (b.duration || 0), 0);
      return `  - ${sub.name}: ${(mins / 60).toFixed(1)}h studied`;
    });

    const pendingGoals = goals
      .filter((g) => !g.completed)
      .map((g) => `  - ${g.title} (${g.priority} priority)`);

    return [
      `Total study time: ${(totalMins / 60).toFixed(1)} hours across ${sessions.length} sessions`,
      `Subjects (${subjects.length}):`,
      subjectLines.length ? subjectLines.join("\n") : "  None added yet",
      `Pending goals (${pendingGoals.length}):`,
      pendingGoals.length ? pendingGoals.join("\n") : "  None",
      `Completed goals: ${goals.filter((g) => g.completed).length}`,
    ].join("\n");
  }, [subjects, sessions, goals]);

  const systemPrompt = `You are an encouraging and practical study coach.
You help students understand their study patterns and give specific, actionable advice.
Keep responses concise and practical. Use numbered points when listing multiple items.`;

  // ── Generate analysis ──────────────────────────────────────
  const generateInsights = async () => {
    setGenerating(true);
    setAiError("");
    setInsight("");

    try {
      const text = await callGroq([
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is my study data:\n\n${buildSummary()}\n\nGive me 3-4 specific, actionable insights about my study habits and what I should focus on next.`,
        },
      ]);
      setInsight(text);
    } catch (err) {
      setAiError(
        err.message.includes("401")
          ? "Invalid API key. Regenerate at console.groq.com and update .env"
          : err.message
      );
    } finally {
      setGenerating(false);
    }
  };

  // ── Chat ──────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;

    const userMsg = { role: "user", content: text };
    const updatedMsgs = [...messages, userMsg];

    setMessages(updatedMsgs);
    setInput("");
    setChatLoading(true);
    setChatError("");

    try {
      const reply = await callGroq([
        {
          role: "system",
          content: `${systemPrompt}\n\nStudent's current study data:\n${buildSummary()}`,
        },
        // Send full history so AI remembers previous messages
        ...updatedMsgs,
      ]);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setChatError(
        err.message.includes("401")
          ? "Invalid API key — check .env file."
          : `Failed: ${err.message}`
      );
      // Revert on error so user can retry
      setMessages(messages);
      setInput(text);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    if (!window.confirm("Clear all chat history?")) return;
    setMessages([]);
    if (chatKey) localStorage.removeItem(chatKey);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Study Insights</h1>
          <p className="page-subtitle">Powered by Groq · Llama 3</p>
        </div>
      </div>

      {/* ── Analysis panel ─────────────────────────────────── */}
      <div className="card insights-card">
        <div className="insights-header">
          <div>
            <h2 className="card-title">Study Analysis</h2>
            <p className="card-subtitle">
              {sessions.length} sessions · {subjects.length} subjects ·{" "}
              {goals.filter((g) => !g.completed).length} active goals
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={generateInsights}
            disabled={generating || sessions.length === 0}
            title={sessions.length === 0 ? "Log sessions first to get insights" : ""}
          >
            {generating ? "Analyzing..." : "Generate Insights"}
          </button>
        </div>

        {sessions.length === 0 && (
          <div className="empty-state">
            <p>Log study sessions using the Focus Timer to get AI insights.</p>
          </div>
        )}

        {aiError && <div className="error-banner">{aiError}</div>}

        {generating && (
          <div className="ai-loading">
            <div className="spinner" />
            <p>Analyzing your study data...</p>
          </div>
        )}

        {insight && !generating && (
          <div className="insight-output">
            {insight.split("\n").map((line, i) => {
              if (!line.trim()) return null;
              const isHeading =
                line.startsWith("#") ||
                line.startsWith("**") ||
                /^\d+\./.test(line);
              return (
                <p key={i} className={isHeading ? "insight-heading" : "insight-para"}>
                  {line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
                </p>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Chatbot ────────────────────────────────────────── */}
      <div className="card chat-card">
        <div className="card-header-row">
          <div>
            <h2 className="card-title" style={{ marginBottom: 0 }}>Ask Your Study Coach</h2>
            <p className="card-subtitle" style={{ marginTop: 4, marginBottom: 0 }}>
              Chat history is saved automatically
            </p>
          </div>
          {messages.length > 0 && (
            <button className="btn-ghost" onClick={clearHistory} style={{ fontSize: "0.78rem", padding: "5px 12px" }}>
              Clear history
            </button>
          )}
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-placeholder">
              <p>Try: "Which subject needs the most attention?" or "How should I plan my week?"</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "ai-bubble"}`}
            >
              <span className="bubble-label">
                {msg.role === "user" ? "You" : "AI Coach"}
              </span>
              <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
            </div>
          ))}

          {chatLoading && (
            <div className="chat-bubble ai-bubble">
              <span className="bubble-label">AI Coach</span>
              <p className="typing-indicator">Thinking...</p>
            </div>
          )}

          {/* Invisible div to scroll to */}
          <div ref={chatBottomRef} />
        </div>

        {chatError && (
          <div className="error-banner" style={{ marginTop: 8 }}>
            {chatError}
          </div>
        )}

        <div className="chat-input-row">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Enter to send)"
            rows={2}
            disabled={chatLoading}
          />
          <button
            className="btn-primary"
            onClick={sendMessage}
            disabled={chatLoading || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

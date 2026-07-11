import { useState } from "react";
import { askCareerChat } from "../Services/ChatService";
import type { ChatMessage } from "../types/chat";

const SUGGESTIONS = [
  "How do I negotiate a higher salary?",
  "What skills are in demand for 2025?",
  "Tips for acing technical interviews",
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => "session_" + Date.now());
  const [streamText, setStreamText] = useState("");

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStreamText("");

    try {
      const response = await askCareerChat(text, sessionId);
      let current = "";
      for (let i = 0; i < response.length; i++) {
        current += response[i];
        setStreamText(current);
        await new Promise((r) => setTimeout(r, 8));
      }
      setMessages((prev) => [...prev, { role: "bot", content: response }]);
      setStreamText("");
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Could not reach the AI. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="page-container" style={{ maxWidth: 780 }}>
      <div className="page-header">
        <h2 className="gradient-text">AI Career Coach</h2>
        <p>Powered by Llama 3.3 — ask anything about your career journey</p>
      </div>

      <div className="chat-window">
        <div className="chat-messages">
          {messages.length === 0 && !loading && (
            <div style={{ margin: "auto", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
              <p style={{ color: "var(--text-h)", fontWeight: 600, marginBottom: "0.5rem" }}>
                How can I help your career today?
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-dim)", marginBottom: "1.5rem" }}>
                Try one of these prompts:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    style={{
                      background: "rgba(124,58,237,0.1)",
                      border: "1px solid rgba(124,58,237,0.25)",
                      color: "var(--accent-2)",
                      fontSize: "0.82rem",
                      padding: "0.5rem 1rem",
                      borderRadius: "100px",
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role === "user" ? "chat-user" : "chat-bot"}`}>
              <div className="chat-role">{msg.role === "user" ? "You" : "AI Coach"}</div>
              <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.content}</p>
            </div>
          ))}

          {streamText && (
            <div className="chat-message chat-bot">
              <div className="chat-role">AI Coach</div>
              <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{streamText}<span className="animate-pulse" style={{ display: "inline-block", width: 2, height: "1em", background: "var(--accent-2)", marginLeft: 2, verticalAlign: "text-bottom" }} /></p>
            </div>
          )}

          {loading && !streamText && (
            <div className="chat-message chat-bot">
              <div className="chat-role">AI Coach</div>
              <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="animate-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-dim)", display: "inline-block", animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-bar">
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", width: "100%", background: "none", border: "none", boxShadow: "none", padding: 0, margin: 0, maxWidth: "none" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about careers, skills, interviews…"
              disabled={loading}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary"
              style={{ padding: "0.6rem 1.25rem", flexShrink: 0 }}
            >
              Send ↑
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";

const BG = "hsl(222,47%,11%)";
const BG2 = "hsl(222,47%,14%)";
const BG3 = "hsl(222,47%,17%)";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "hsl(210,40%,96%)";
const TEXT_MUTED = "hsl(215,20%,65%)";

const OPENAI_MODELS = [
  "gpt-5.2", "gpt-5-mini", "gpt-5-nano", "o4-mini", "o3",
];

const ANTHROPIC_MODELS = [
  "claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5",
];

const ENDPOINTS = [
  {
    method: "GET",
    path: "/v1/models",
    label: "List Models",
    tag: "Both",
    tagColor: "#6b7280",
    desc: "Returns all available OpenAI and Anthropic models.",
  },
  {
    method: "POST",
    path: "/v1/chat/completions",
    label: "Chat Completions",
    tag: "OpenAI",
    tagColor: "#2563eb",
    desc: "OpenAI-compatible chat completions. Routes to OpenAI (gpt-/o models) or Anthropic (claude- models) automatically.",
  },
  {
    method: "POST",
    path: "/v1/messages",
    label: "Messages",
    tag: "Anthropic",
    tagColor: "#d97706",
    desc: "Anthropic Messages API format. Accepts claude- models directly or converts OpenAI models on the fly.",
  },
];

const STEPS = [
  {
    num: 1,
    title: "Add Provider",
    desc: "In CherryStudio Settings → AI Providers, click + to add a new provider.",
  },
  {
    num: 2,
    title: "Select Type",
    desc: 'Choose "OpenAI" for chat/completions endpoint, or "Anthropic" for the native messages endpoint.',
  },
  {
    num: 3,
    title: "Enter Base URL",
    desc: 'Set the API Base URL to your deployment domain (window.location.origin). For OpenAI type append /v1.',
  },
  {
    num: 4,
    title: "Enter API Key",
    desc: "Set the API Key to your PROXY_API_KEY value. Save and test the connection.",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={copy}
      style={{
        background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : BORDER}`,
        color: copied ? "#4ade80" : TEXT_MUTED,
        borderRadius: 6,
        padding: "3px 10px",
        fontSize: 12,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function StatusDot({ online }: { online: boolean | null }) {
  const color = online === null ? "#6b7280" : online ? "#4ade80" : "#f87171";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: online ? `0 0 6px ${color}` : undefined,
          display: "inline-block",
        }}
      />
      <span style={{ fontSize: 13, color }}>
        {online === null ? "Checking..." : online ? "Online" : "Offline"}
      </span>
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: BG2,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: TEXT_MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function App() {
  const [online, setOnline] = useState<boolean | null>(null);
  const baseUrl = window.location.origin;

  useEffect(() => {
    fetch("/api/healthz")
      .then((r) => setOnline(r.ok))
      .catch(() => setOnline(false));
  }, []);

  const curlExample = `curl ${baseUrl}/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_PROXY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-sonnet-4-6",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: TEXT,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "0 0 60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${BORDER}`,
          background: BG2,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              ⚡
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>AI Proxy API</span>
          </div>
          <StatusDot online={online} />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px 0" }}>
        {/* Connection Details */}
        <Section title="Connection Details">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: BG3,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "10px 14px",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 2 }}>BASE URL</div>
                <div style={{ fontSize: 14, fontFamily: "monospace" }}>{baseUrl}</div>
              </div>
              <CopyButton text={baseUrl} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: BG3,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "10px 14px",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 2 }}>AUTH HEADER</div>
                <div style={{ fontSize: 14, fontFamily: "monospace" }}>
                  Authorization: Bearer <span style={{ color: "#a78bfa" }}>YOUR_PROXY_API_KEY</span>
                </div>
              </div>
              <CopyButton text="Authorization: Bearer YOUR_PROXY_API_KEY" />
            </div>
          </div>
        </Section>

        {/* Endpoints */}
        <Section title="API Endpoints">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ENDPOINTS.map((ep) => (
              <div
                key={ep.path}
                style={{
                  background: BG3,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background:
                        ep.method === "GET"
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(139,92,246,0.15)",
                      color: ep.method === "GET" ? "#4ade80" : "#a78bfa",
                      border: `1px solid ${ep.method === "GET" ? "rgba(34,197,94,0.3)" : "rgba(139,92,246,0.3)"}`,
                      borderRadius: 4,
                      padding: "2px 7px",
                    }}
                  >
                    {ep.method}
                  </span>
                  <span
                    style={{ fontFamily: "monospace", fontSize: 14, flex: 1 }}
                  >
                    {baseUrl}
                    <span style={{ color: "#e2e8f0" }}>{ep.path}</span>
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      background: `${ep.tagColor}22`,
                      color: ep.tagColor,
                      border: `1px solid ${ep.tagColor}44`,
                      borderRadius: 4,
                      padding: "2px 7px",
                    }}
                  >
                    {ep.tag}
                  </span>
                  <CopyButton text={`${baseUrl}${ep.path}`} />
                </div>
                <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>{ep.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Available Models */}
        <Section title="Available Models">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 8,
            }}
          >
            {OPENAI_MODELS.map((m) => (
              <div
                key={m}
                style={{
                  background: BG3,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 13 }}>{m}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#60a5fa",
                    background: "rgba(37,99,235,0.15)",
                    border: "1px solid rgba(37,99,235,0.3)",
                    borderRadius: 4,
                    padding: "1px 6px",
                    alignSelf: "flex-start",
                  }}
                >
                  OpenAI
                </span>
              </div>
            ))}
            {ANTHROPIC_MODELS.map((m) => (
              <div
                key={m}
                style={{
                  background: BG3,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 13 }}>{m}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#fbbf24",
                    background: "rgba(217,119,6,0.15)",
                    border: "1px solid rgba(217,119,6,0.3)",
                    borderRadius: 4,
                    padding: "1px 6px",
                    alignSelf: "flex-start",
                  }}
                >
                  Anthropic
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* CherryStudio Setup */}
        <Section title="CherryStudio Setup (4 Steps)">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {STEPS.map((s) => (
              <div
                key={s.num}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {s.num}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Quick Test */}
        <Section title="Quick Test (curl)">
          <div
            style={{
              background: "hsl(222,47%,8%)",
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "14px 16px",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 10, right: 12 }}>
              <CopyButton text={curlExample} />
            </div>
            <pre
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.6,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                fontFamily: "Menlo, Monaco, Consolas, monospace",
              }}
            >
              <span style={{ color: "#94a3b8" }}>curl </span>
              <span style={{ color: "#4ade80" }}>{baseUrl}/v1/chat/completions</span>
              {" \\\n  "}
              <span style={{ color: "#94a3b8" }}>-H </span>
              <span style={{ color: "#fbbf24" }}>"Authorization: Bearer YOUR_PROXY_API_KEY"</span>
              {" \\\n  "}
              <span style={{ color: "#94a3b8" }}>-H </span>
              <span style={{ color: "#fbbf24" }}>"Content-Type: application/json"</span>
              {" \\\n  "}
              <span style={{ color: "#94a3b8" }}>-d </span>
              <span style={{ color: "#a78bfa" }}>&apos;&#123;</span>
              {"\n    "}
              <span style={{ color: "#60a5fa" }}>"model"</span>
              <span style={{ color: "#a78bfa" }}>: </span>
              <span style={{ color: "#4ade80" }}>"claude-sonnet-4-6"</span>
              <span style={{ color: "#a78bfa" }}>,</span>
              {"\n    "}
              <span style={{ color: "#60a5fa" }}>"messages"</span>
              <span style={{ color: "#a78bfa" }}>: [&#123;</span>
              <span style={{ color: "#60a5fa" }}>"role"</span>
              <span style={{ color: "#a78bfa" }}>: </span>
              <span style={{ color: "#4ade80" }}>"user"</span>
              <span style={{ color: "#a78bfa" }}>, </span>
              <span style={{ color: "#60a5fa" }}>"content"</span>
              <span style={{ color: "#a78bfa" }}>: </span>
              <span style={{ color: "#4ade80" }}>"Hello!"</span>
              <span style={{ color: "#a78bfa" }}>&#125;]</span>
              {"\n  "}
              <span style={{ color: "#a78bfa" }}>&#125;&apos;</span>
            </pre>
          </div>
        </Section>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            color: TEXT_MUTED,
            fontSize: 12,
            marginTop: 8,
          }}
        >
          Powered by Replit AI Integrations — OpenAI + Anthropic, billed to your Replit credits. No separate API keys needed.
        </div>
      </div>
    </div>
  );
}

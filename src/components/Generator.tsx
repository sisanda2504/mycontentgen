import { useState, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { AuthModal } from "./AuthModal";
import { GeneratedContent, LoadingAnimation } from "./GeneratedContent";
import { PromptLibraryPanel } from "./PromptLibrary";
import { PicMix } from "./PicMix";
import { savePrompt } from "@/lib/auth";
import {
  Sparkles, FileText, Image as ImageIcon, Code, Layers, BookOpen,
  Send, LogOut, User, Wand2
} from "lucide-react";


type Mode = "text" | "image" | "code" | "picmix";

export function Generator() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate`;

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || mode === "picmix") return;

    // Save prompt if user logged in
    if (user) {
      savePrompt({ userId: user.id, text: prompt, category: mode as "text" | "image" | "code" });
    }

    setLoading(true);
    setContent("");
    setIsStreaming(false);

    try {
      const resp = await fetch(FUNC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          mode,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(err.error || "Generation failed");
      }

      if (mode === "image") {
        const data = await resp.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imageUrl) {
          setContent(imageUrl);
        } else {
          throw new Error("No image generated");
        }
      } else {
        // Stream text/code
        if (!resp.body) throw new Error("No response body");
        setIsStreaming(true);
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nlIdx: number;
          while ((nlIdx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, nlIdx);
            buffer = buffer.slice(nlIdx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                setContent(accumulated);
              }
            } catch { /* partial json */ }
          }
        }
        setIsStreaming(false);
      }
    } catch (e: any) {
      setContent("");
      alert(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }, [prompt, mode, user, FUNC_URL]);

  const handlePromptSelect = (text: string, category: "text" | "image" | "code") => {
    setPrompt(text + " ");
    setMode(category);
  };

  const modes: { key: Mode; label: string; icon: React.ReactNode }[] = [
    { key: "text", label: "Text", icon: <FileText className="h-4 w-4" /> },
    { key: "image", label: "Image", icon: <ImageIcon className="h-4 w-4" /> },
    { key: "code", label: "Code", icon: <Code className="h-4 w-4" /> },
    { key: "picmix", label: "PicMix", icon: <Layers className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 animate-float">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-xl font-bold gradient-text">GenMix</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <BookOpen className="h-4 w-4" /> Prompts
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
                <button onClick={logout} className="rounded-xl bg-secondary p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn-glow rounded-xl px-4 py-2 text-sm flex items-center gap-1.5">
                <User className="h-4 w-4" /> Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Mode Tabs */}
        <div className="flex gap-2 flex-wrap">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                mode === m.key
                  ? "btn-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        {mode !== "picmix" && (
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    mode === "text" ? "Describe the content you want to generate..."
                    : mode === "image" ? "Describe the image you want to create..."
                    : "Describe the code you want to write..."
                  }
                  className="w-full rounded-xl bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleGenerate();
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {mode === "image" ? "⚡ AI-powered image generation" : "Press Ctrl+Enter to generate"}
              </p>
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="btn-glow rounded-xl px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Wand2 className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Send className="h-4 w-4" /> Generate</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        {mode === "picmix" ? (
          <PicMix />
        ) : loading && !content ? (
          <LoadingAnimation />
        ) : (
          <GeneratedContent type={mode} content={content} isStreaming={isStreaming} />
        )}

        {/* Quick prompts */}
        {!content && !loading && mode !== "picmix" && (
          <div className="space-y-3 animate-fade-up">
            <p className="text-sm text-muted-foreground font-medium">✨ Quick starts</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { text: "Write a viral tweet about AI", cat: "text" as const },
                { text: "A cyberpunk city at sunset, neon lights", cat: "image" as const },
                { text: "Create a responsive navbar in React", cat: "code" as const },
                { text: "Write a motivational LinkedIn post", cat: "text" as const },
                { text: "A cute robot reading a book, watercolor style", cat: "image" as const },
                { text: "Build a REST API with authentication in Node.js", cat: "code" as const },
              ].filter(q => mode === "text" ? q.cat === "text" : mode === "image" ? q.cat === "image" : q.cat === "code").map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setPrompt(q.text); setMode(q.cat); }}
                  className="rounded-xl bg-card p-4 text-left text-sm text-foreground hover:bg-card/80 transition-colors border border-border/50 hover:border-primary/30"
                >
                  <span className="text-muted-foreground">{q.cat === "text" ? "📝" : q.cat === "image" ? "🎨" : "💻"}</span>
                  <p className="mt-1">{q.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAuth && !user && <AuthModal onClose={() => setShowAuth(false)} />}
      <PromptLibraryPanel isOpen={showLibrary} onClose={() => setShowLibrary(false)} onSelect={handlePromptSelect} />
    </div>
  );
}

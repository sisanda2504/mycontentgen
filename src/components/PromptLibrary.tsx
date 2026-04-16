import { useState } from "react";
import { promptLibrary, type PromptTemplate } from "@/lib/prompt-library";
import { getSavedPrompts, savePrompt, deletePrompt, type SavedPrompt } from "@/lib/auth";
import { useAuth } from "./AuthProvider";
import { BookOpen, Bookmark, Trash2, Plus, FileText, Image, Code, X } from "lucide-react";

interface PromptLibraryPanelProps {
  onSelect: (prompt: string, category: "text" | "image" | "code") => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptLibraryPanel({ onSelect, isOpen, onClose }: PromptLibraryPanelProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "text" | "image" | "code" | "saved">("all");
  const [newPrompt, setNewPrompt] = useState("");
  const [newCat, setNewCat] = useState<"text" | "image" | "code">("text");
  const [showAdd, setShowAdd] = useState(false);

  const savedPrompts: SavedPrompt[] = user ? getSavedPrompts(user.id) : [];

  const filteredLibrary = filter === "all"
    ? promptLibrary
    : filter === "saved"
      ? []
      : promptLibrary.filter((p) => p.category === filter);

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case "text": return <FileText className="h-4 w-4" />;
      case "image": return <Image className="h-4 w-4" />;
      case "code": return <Code className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleSave = () => {
    if (!user || !newPrompt.trim()) return;
    savePrompt({ userId: user.id, text: newPrompt, category: newCat });
    setNewPrompt("");
    setShowAdd(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-md h-full glass border-l border-border overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 glass z-10 p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold text-foreground">Prompt Library</h2>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-secondary">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {(["all", "text", "image", "code", "saved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {f === "saved" ? "My Prompts" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {filter !== "saved" && filteredLibrary.map((t) => (
            <button
              key={t.id}
              onClick={() => { onSelect(t.prompt, t.category); onClose(); }}
              className="w-full rounded-xl bg-card p-4 text-left hover:bg-card/80 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{t.icon}</span>
                <span className="font-medium text-foreground text-sm">{t.title}</span>
                <span className="ml-auto text-xs text-muted-foreground capitalize">{t.category}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground transition-colors">{t.prompt}...</p>
            </button>
          ))}

          {(filter === "saved" || filter === "all") && savedPrompts.length > 0 && (
            <>
              {filter === "all" && <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-4">My Saved Prompts</p>}
              {savedPrompts.map((p) => (
                <div key={p.id} className="rounded-xl bg-card p-4 flex items-start justify-between gap-2">
                  <button onClick={() => { onSelect(p.text, p.category); onClose(); }} className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      {categoryIcon(p.category)}
                      <span className="text-sm text-foreground">{p.text}</span>
                    </div>
                  </button>
                  <button onClick={() => deletePrompt(p.id)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </>
          )}

          {filter === "saved" && savedPrompts.length === 0 && !showAdd && (
            <div className="text-center py-8 text-muted-foreground">
              <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved prompts yet</p>
            </div>
          )}

          {user && (
            <div>
              {!showAdd ? (
                <button onClick={() => setShowAdd(true)} className="w-full rounded-xl border border-dashed border-border p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
                  <Plus className="h-4 w-4" /> Save a custom prompt
                </button>
              ) : (
                <div className="rounded-xl bg-card p-4 space-y-3 animate-fade-up">
                  <textarea
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    placeholder="Type your prompt..."
                    className="w-full rounded-lg bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    {(["text", "image", "code"] as const).map((c) => (
                      <button key={c} onClick={() => setNewCat(c)} className={`rounded-lg px-3 py-1 text-xs capitalize ${newCat === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-glow rounded-lg px-4 py-1.5 text-sm">Save</button>
                    <button onClick={() => setShowAdd(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

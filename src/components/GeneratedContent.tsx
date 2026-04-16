import { useState, useRef } from "react";
import { Copy, Download, Check, Share2, Send, Twitter, Facebook, Linkedin, Instagram, Loader2 } from "lucide-react";

interface GeneratedContentProps {
  type: "text" | "image" | "code";
  content: string;
  isStreaming?: boolean;
}

export function GeneratedContent({ type, content, isStreaming }: GeneratedContentProps) {
  const [copied, setCopied] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!content && !isStreaming) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (type === "image" && content.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = content;
      a.download = `genmix-${Date.now()}.png`;
      a.click();
    } else {
      const ext = type === "code" ? "txt" : "md";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `genmix-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const socialPlatforms = [
    { icon: Twitter, key: "twitter", label: "Twitter" },
    { icon: Facebook, key: "facebook", label: "Facebook" },
    { icon: Linkedin, key: "linkedin", label: "LinkedIn" },
    { icon: Instagram, key: "instagram", label: "Instagram" },
  ];

  const handleShare = () => {
    if (!selectedPlatform) return;
    const shareUrl = encodeURIComponent(window.location.href);
    const shareText = encodeURIComponent(caption || "Check out what I created with GenMix! 🚀");

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      instagram: `https://www.instagram.com/`,
    };

    const url = urls[selectedPlatform];
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderContent = () => {
    if (type === "image" && content.startsWith("data:")) {
      return <img src={content} alt="Generated" className="w-full rounded-xl max-h-[500px] object-contain" />;
    }
    if (type === "code") {
      return (
        <pre className="overflow-auto rounded-xl bg-background p-4 text-sm font-mono text-foreground max-h-[500px]">
          <code>{content}</code>
        </pre>
      );
    }
    return (
      <div ref={contentRef} className="prose prose-invert max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
        {content}
        {isStreaming && <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />}
      </div>
    );
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-up space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Generated Content</h3>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors">
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors">
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </div>

      {renderContent()}

      {/* Social Share Section */}
      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Share2 className="h-4 w-4" />
          <span className="font-medium">Share to</span>
        </div>

        {/* Step 1: Select Platform */}
        <div className="flex gap-3">
          {socialPlatforms.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedPlatform(selectedPlatform === s.key ? null : s.key)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                selectedPlatform === s.key
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                  : "bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80"
              }`}
              title={s.label}
            >
              <s.icon className="h-5 w-5" />
            </button>
          ))}
        </div>

        {/* Step 2: Write message & share (shown after selecting platform) */}
        {selectedPlatform && (
          <div className="flex gap-2 items-center animate-fade-up">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={`Write a message for ${socialPlatforms.find(p => p.key === selectedPlatform)?.label}...`}
              className="flex-1 rounded-xl bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleShare}
              className="btn-glow rounded-xl px-4 py-2.5 flex items-center gap-1.5 text-sm"
            >
              <Send className="h-4 w-4" /> Share
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingAnimation() {
  return (
    <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center gap-4 animate-fade-up">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-spin-slow" />
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-foreground">Generating magic...</p>
        <p className="text-sm text-muted-foreground mt-1">This may take a moment</p>
      </div>
    </div>
  );
}

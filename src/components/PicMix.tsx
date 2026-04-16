import { useState, useRef, useCallback, useEffect } from "react";
import { Layers, Move, ZoomIn, ZoomOut, RotateCw, Trash2, Download, Upload, Image as ImageIcon } from "lucide-react";

interface PicLayer {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export function PicMix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [layers, setLayers] = useState<PicLayer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 400;
        const ratio = img.width / img.height;
        const w = Math.min(img.width, maxW);
        const h = w / ratio;
        const layer: PicLayer = {
          id: crypto.randomUUID(),
          src: e.target?.result as string,
          x: 50 + layers.length * 20,
          y: 50 + layers.length * 20,
          width: w,
          height: h,
          rotation: 0,
          opacity: 1,
        };
        setLayers((prev) => [...prev, layer]);
        setSelected(layer.id);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(addImage);
    e.target.value = "";
  };

  const updateLayer = (id: string, updates: Partial<PicLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selected === id) setSelected(null);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    layers.forEach((layer) => {
      const img = new Image();
      img.src = layer.src;
      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.drawImage(img, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
      if (layer.id === selected) {
        ctx.strokeStyle = "#00d4ff";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
      }
      ctx.restore();
    });
  }, [layers, selected]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height) {
        setSelected(l.id);
        setDragging(true);
        setDragOffset({ x: x - l.x, y: y - l.y });
        return;
      }
    }
    setSelected(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !selected) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX - dragOffset.x;
    const y = (e.clientY - rect.top) * scaleY - dragOffset.y;
    updateLayer(selected, { x, y });
  };

  const handleCanvasMouseUp = () => setDragging(false);

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Redraw without selection border
    const prev = selected;
    setSelected(null);
    setTimeout(() => {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `genmix-picmix-${Date.now()}.png`;
      a.click();
      setSelected(prev);
    }, 50);
  };

  const selectedLayer = layers.find((l) => l.id === selected);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">PicMix Studio</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()} className="btn-glow rounded-xl px-4 py-2 text-sm flex items-center gap-1.5">
            <Upload className="h-4 w-4" /> Add Images
          </button>
          {layers.length > 0 && (
            <button onClick={exportCanvas} className="btn-accent rounded-xl px-4 py-2 text-sm flex items-center gap-1.5">
              <Download className="h-4 w-4" /> Export
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      </div>

      <div className="rounded-2xl overflow-hidden border border-border relative">
        {layers.length === 0 ? (
          <div
            className="h-[400px] flex flex-col items-center justify-center gap-3 bg-card cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Click to add images and start mixing!</p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full cursor-move"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        )}
      </div>

      {selectedLayer && (
        <div className="glass rounded-xl p-4 space-y-3 animate-fade-up">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Move className="h-4 w-4 text-primary" /> Layer Controls
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="text-xs text-muted-foreground">Size</label>
              <div className="flex gap-1 mt-1">
                <button onClick={() => updateLayer(selected!, { width: selectedLayer.width * 1.1, height: selectedLayer.height * 1.1 })} className="rounded-lg bg-secondary p-2 hover:bg-secondary/80">
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button onClick={() => updateLayer(selected!, { width: selectedLayer.width * 0.9, height: selectedLayer.height * 0.9 })} className="rounded-lg bg-secondary p-2 hover:bg-secondary/80">
                  <ZoomOut className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Rotate</label>
              <button onClick={() => updateLayer(selected!, { rotation: selectedLayer.rotation + 15 })} className="mt-1 rounded-lg bg-secondary p-2 hover:bg-secondary/80">
                <RotateCw className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedLayer.opacity}
                onChange={(e) => updateLayer(selected!, { opacity: parseFloat(e.target.value) })}
                className="mt-2 w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Remove</label>
              <button onClick={() => removeLayer(selected!)} className="mt-1 rounded-lg bg-destructive/20 p-2 text-destructive hover:bg-destructive/30">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {layers.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {layers.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setSelected(l.id)}
              className={`rounded-lg border-2 overflow-hidden w-14 h-14 ${l.id === selected ? "border-primary" : "border-border"}`}
            >
              <img src={l.src} alt={`Layer ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

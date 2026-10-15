"use client";

import { useRef, useState } from "react";
import { Camera, ImageUp, Loader2, X } from "lucide-react";
import { compressImage } from "@/lib/compress";
import { cn } from "@/lib/utils";

export interface PhotoValue {
  file: File | null;
  preview: string | null;
}

export function PhotoPicker({
  label = "Foto de evidencia",
  required,
  onReady,
}: {
  label?: string;
  required?: boolean;
  onReady: (value: PhotoValue) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const url = URL.createObjectURL(compressed);
      setPreview(url);
      onReady({ file: compressed, preview: url });
    } catch {
      setError("No se pudo procesar la imagen");
    } finally {
      setProcessing(false);
    }
  };

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    onReady({ file: null, preview: null });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </span>

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Previsualización"
            className="h-44 w-full object-cover"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900"
            aria-label="Quitar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-brand-400 hover:bg-brand-50/40",
          )}
        >
          {processing ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          ) : (
            <ImageUp className="h-6 w-6" />
          )}
          <span className="text-xs font-medium">
            {processing ? "Optimizando imagen…" : "Tomar o subir foto"}
          </span>
          <span className="text-[10px] text-slate-400">
            Se comprime automáticamente antes de subirla
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {error ? <p className="mt-1 text-[11px] text-rose-600">{error}</p> : null}
      {!preview && !error ? (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
          <Camera className="h-3 w-3" /> Obligatoria para la inspección física.
        </p>
      ) : null}
    </div>
  );
}

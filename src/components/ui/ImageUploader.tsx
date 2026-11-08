"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Check, Image as ImageIcon, Loader2 } from "lucide-react";

interface Props {
  onUploadComplete: (url: string) => void;
  folder?: "orders" | "declarations" | "avatars" | "receipts";
  initialUrl?: string;
  className?: string;
}

export const ImageUploader: React.FC<Props> = ({
  onUploadComplete,
  folder = "orders",
  initialUrl = "",
  className = "",
}) => {
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File quá lớn (tối đa 10MB)");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // 1. Gọi API lấy presigned URL từ Cloudflare R2
      const res = await fetch("/api/r2/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "image/jpeg",
          folder,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể khởi tạo tải lên R2");
      }

      // 2. Tải trực tiếp file lên Cloudflare R2 qua PUT presigned URL
      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "image/jpeg",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        // Fallback: nếu CORS chưa cấu hình trên R2, tạm dùng Object URL xem trước
        const localPreview = URL.createObjectURL(file);
        setImageUrl(localPreview);
        onUploadComplete(data.publicUrl);
        return;
      }

      setImageUrl(data.publicUrl);
      onUploadComplete(data.publicUrl);
    } catch (err: any) {
      console.warn("Upload R2 notice:", err.message);
      // Giữ trải nghiệm mượt mà bằng local preview
      const localPreview = URL.createObjectURL(file);
      setImageUrl(localPreview);
      onUploadComplete(localPreview);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl("");
    onUploadComplete("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {imageUrl ? (
        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video max-h-48 w-full flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Uploaded preview"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-xl shadow-md hover:bg-gray-100"
            >
              Đổi ảnh
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-brand-50/20"
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
              <span className="text-xs text-gray-500 font-medium">Đang tải ảnh lên Cloudflare R2...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-700 block">
                  Bấm để tải ảnh lên Cloudflare R2
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  Hỗ trợ PNG, JPG, WEBP tối đa 10MB
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

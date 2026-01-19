"use client";

import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string; // Current image URL
  onChange: (url: string | undefined) => void;
  type: "logo" | "background"; // Type of image being uploaded
  label?: string;
  className?: string;
  maxSizeMB?: number;
  aspectRatio?: string; // e.g., "16/9", "1/1"
}

export function ImageUpload({
  value,
  onChange,
  type,
  label,
  className,
  maxSizeMB = 5,
  aspectRatio,
}: ImageUploadProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      if (!user) {
        throw new Error("You must be logged in to upload images");
      }

      // Generate unique filename inside user's folder
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${type}-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("form-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // If bucket doesn't exist, provide a more helpful error message
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "Storage bucket 'form-assets' not found. Please create it in your Supabase project dashboard as per STORAGE_SETUP.md.",
          );
        }
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("form-assets").getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    setError(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <div className="space-y-2">
        {value ? (
          <div className="relative group">
            <div
              className={cn(
                "relative overflow-hidden rounded-lg border border-border bg-muted",
                type === "logo"
                  ? "w-32 h-32 flex items-center justify-center"
                  : "w-full h-48",
                aspectRatio && `aspect-[${aspectRatio}]`,
              )}
            >
              <img
                src={value}
                alt={type === "logo" ? "Logo" : "Background"}
                className={cn(
                  "object-contain",
                  type === "logo"
                    ? "max-w-full max-h-full"
                    : "w-full h-full object-cover",
                )}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  className="h-8"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className={cn(
              "border-2 border-dashed border-border rounded-lg p-6 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5",
              uploading && "opacity-50 cursor-not-allowed",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      Click to upload{" "}
                      {type === "logo" ? "logo" : "background image"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to {maxSizeMB}MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}

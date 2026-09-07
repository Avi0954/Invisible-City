import React, { useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ImageUploaderProps {
  files: File[];
  onFilesSelect: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  maxFiles?: number;
  accept?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  files,
  onFilesSelect,
  onFileRemove,
  maxFiles = 5,
  accept = 'image/jpeg,image/png,image/webp',
  isUploading = false,
  uploadProgress,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      onFilesSelect(selected);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = Array.from(e.dataTransfer.files);
      onFilesSelect(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4 font-sans">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#d0cdc5] hover:border-[#06291b] bg-[#fcf9f2] rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="h-10 w-10 rounded-full bg-[#f1eee7] group-hover:bg-[#e5e2da] text-[#06291b] flex items-center justify-center mx-auto transition-colors">
          <Upload className="h-5 w-5" />
        </div>

        <div>
          <span className="text-xs font-bold text-[#06291b] group-hover:underline">
            Click to upload photos
          </span>
          <span className="text-xs text-[#787770]"> or drag and drop</span>
        </div>

        <p className="text-[11px] text-[#787770]">
          PNG, JPG, or WEBP up to 10MB (max {maxFiles} files)
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-semibold">
          {error}
        </div>
      )}

      {isUploading && uploadProgress !== undefined && (
        <div className="space-y-1.5 p-3 rounded-xl border border-[#e5e2da] bg-[#f1eee7]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#06291b]">
            <span>Uploading photo evidence...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-[#e5e2da] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#06291b] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative group border border-[#e5e2da] rounded-xl overflow-hidden bg-[#fcf9f2] p-2 space-y-1.5"
            >
              <div className="h-24 w-full bg-[#f1eee7] rounded-lg overflow-hidden flex items-center justify-center relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove(idx);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full opacity-90 hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="truncate text-[10px] text-[#484742] font-mono px-0.5">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

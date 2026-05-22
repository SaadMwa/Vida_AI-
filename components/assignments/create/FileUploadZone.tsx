'use client';

import { useCallback, useRef, useState } from 'react';
import { CloudUpload } from 'lucide-react';

interface FileUploadZoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const ACCEPT = 'image/jpeg,image/png,image/jpg';
const MAX_SIZE_MB = 10;

export function FileUploadZone({ file, onFileChange }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = useCallback(
    (f: File | null) => {
      setError(null);
      if (!f) {
        onFileChange(null);
        return;
      }
      if (!f.type.match(/^image\/(jpeg|png|jpg)$/)) {
        setError('Only JPEG or PNG files are allowed');
        return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File must be under ${MAX_SIZE_MB}MB`);
        return;
      }
      onFileChange(f);
    },
    [onFileChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-colors ${
          dragOver
            ? 'border-gray-400 bg-gray-50'
            : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0] ?? null)}
        />
        <CloudUpload size={32} className="text-gray-400 mb-3" strokeWidth={1.5} />
        <p className="text-sm font-medium text-gray-800 text-center">
          Choose a file or drag & drop it here
        </p>
        <p className="text-xs text-gray-400 mt-1 mb-4">JPEG, PNG, upto {MAX_SIZE_MB}MB</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition"
        >
          Browse Files
        </button>
        {file && (
          <p className="mt-3 text-xs text-green-700 font-medium">{file.name}</p>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Upload images of your preferred document/image
      </p>
      {error && <p className="text-xs text-red-600 mt-1 text-center">{error}</p>}
    </div>
  );
}

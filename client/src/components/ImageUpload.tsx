import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageIcon, UploadIcon } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function ImageUpload({ currentImageUrl, onUpload, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div
          className={`relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'
          }`}
          onClick={handleClick}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          {!disabled && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center">
              <UploadIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <Label htmlFor="image-upload">Image</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            ref={fileInputRef}
            className="hidden"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {isUploading ? 'Uploading...' : 'Click to upload an image (max 5MB)'}
          </p>
        </div>
      </div>
    </div>
  );
}
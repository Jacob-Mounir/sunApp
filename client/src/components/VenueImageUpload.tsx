import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Camera, Loader2 } from 'lucide-react';

interface VenueImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

export function VenueImageUpload({ currentImageUrl, onUpload, isUploading }: VenueImageUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    await onUpload(file);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Current Image or Placeholder */}
        <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt="Venue"
              className="w-full h-full object-cover"
              onError={() => setError('Failed to load image')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Upload Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id="venue-image-upload"
          />
          <Label
            htmlFor="venue-image-upload"
            className={`
              inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
              ${isUploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
              }
            `}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                {currentImageUrl ? 'Change Image' : 'Upload Image'}
              </>
            )}
          </Label>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
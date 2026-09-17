import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CLOUDINARY_CLOUD_NAME } from '@/lib/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  maxSizeMB?: number;
}

export default function ImageUploader({
  value,
  onChange,
  folder = 'uploads',
  label = 'Image',
  placeholder = 'Upload or paste image URL',
  className,
  aspectRatio = 'auto',
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, and GIF images are allowed');
      return;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Image size must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      // Try Cloudinary direct CDN upload first
      try {
        const cloudForm = new FormData();
        cloudForm.append('file', file);
        cloudForm.append('upload_preset', 'edtech_preset');
        cloudForm.append('folder', folder);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME || 'u1tmgtke'}/image/upload`, {
          method: 'POST',
          body: cloudForm,
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.secure_url) {
            onChange(cloudData.secure_url);
            toast.success('Image uploaded successfully');
            return;
          }
        }
      } catch (cErr) {
        console.warn('Cloudinary upload fallback to storage:', cErr);
      }

      // Fallback: Generate unique filename and upload to Supabase Storage
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${folder}/${timestamp}-${randomStr}.${ext}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media-uploads')
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      // Basic URL validation
      try {
        new URL(urlInput);
        onChange(urlInput.trim());
        setUrlInput('');
        setShowUrlInput(false);
        toast.success('Image URL added');
      } catch {
        toast.error('Invalid URL');
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: 'min-h-[200px]',
  }[aspectRatio];

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}

      {value ? (
        // Preview with options
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative group">
            <div className={cn('relative', aspectRatioClass)}>
              <img
                src={value}
                alt="Uploaded"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
            {/* URL display */}
            <div className="p-2 bg-muted/50 text-xs text-muted-foreground truncate">
              {value}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Upload zone
        <div
          className={cn(
            'border-2 border-dashed rounded-lg transition-colors',
            aspectRatioClass,
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag & drop an image here, or click to browse
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Browse
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    Use URL
                  </Button>
                </div>

                {showUrlInput && (
                  <div className="flex gap-2 mt-4 w-full max-w-sm">
                    <Input
                      placeholder={placeholder}
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    />
                    <Button type="button" size="sm" onClick={handleUrlSubmit}>
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowUrlInput(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-4">
                  JPG, PNG, WebP, GIF • Max {maxSizeMB}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}

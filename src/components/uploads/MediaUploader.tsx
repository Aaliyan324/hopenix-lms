import React, { useState } from 'react';
import { Media, MediaType } from '../../types';
import { apiFetch } from '../../lib/api';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import {
  Image,
  Video,
  FileText,
  UploadCloud,
  Trash2,
  ExternalLink,
  Download,
  Eye,
} from 'lucide-react';

interface MediaUploaderProps {
  lessonId: string;
  mediaList: Media[];
  onMediaChanged: () => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  lessonId,
  mediaList,
  onMediaChanged,
}) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'IMAGE' | 'PDF'>('IMAGE');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size and mime type
    if (selectedType === 'IMAGE' && !file.type.startsWith('image/')) {
      toast('Selected file is not an image (PNG, JPG, WEBP).', 'error');
      return;
    }
    if (selectedType === 'PDF' && file.type !== 'application/pdf') {
      toast('Selected file is not a PDF document.', 'error');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);

      const formData = new FormData();
      formData.append('lessonId', lessonId);
      formData.append('type', selectedType);
      formData.append('file', file);

      setUploadProgress(70);

      await apiFetch('/media/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(100);
      toast(`${selectedType} uploaded successfully!`, 'success');
      onMediaChanged();
    } catch (err: any) {
      toast(err.message || 'File upload failed.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async () => {
    if (!mediaToDelete) return;
    try {
      setDeleting(true);
      await apiFetch(`/media/${mediaToDelete.id}`, { method: 'DELETE' });
      toast('Media deleted successfully.', 'success');
      onMediaChanged();
    } catch (err: any) {
      toast(err.message || 'Failed to delete media.', 'error');
    } finally {
      setDeleting(false);
      setMediaToDelete(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Upload Controls */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <h4 className="text-base font-semibold text-white mb-4">Upload Lesson Media (Images & PDFs)</h4>

        {/* Media Type Tabs */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit">
          <button
            type="button"
            onClick={() => setSelectedType('IMAGE')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedType === 'IMAGE' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Image className="w-4 h-4" />
            Image (PNG/JPG/WEBP)
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('PDF')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedType === 'PDF' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            PDF Document
          </button>
        </div>

        {/* Dropzone Box */}
        <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 hover:border-brand-500 bg-slate-950/50 hover:bg-slate-950 rounded-2xl cursor-pointer transition-all">
          <UploadCloud className="w-10 h-10 text-brand-400 mb-2 animate-bounce" />
          <p className="text-sm font-medium text-white mb-1">
            Click to upload or drag & drop {selectedType.toLowerCase()} file
          </p>
          <p className="text-xs text-slate-400">
            {selectedType === 'IMAGE' && 'PNG, JPG, WEBP up to 10MB'}
            {selectedType === 'PDF' && 'PDF files up to 25MB'}
          </p>

          <input
            type="file"
            className="hidden"
            accept={
              selectedType === 'IMAGE'
                ? 'image/png,image/jpeg,image/webp'
                : 'application/pdf'
            }
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Uploading {selectedType}...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Media Attachments List */}
      <div>
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Attached Lesson Media ({mediaList.length})</h4>
        {mediaList.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
            No media attachments uploaded for this lesson yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className="group relative p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-2 text-xs font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20">
                      {item.type === 'IMAGE' && <Image className="w-3.5 h-3.5" />}
                      {item.type === 'VIDEO' && <Video className="w-3.5 h-3.5" />}
                      {item.type === 'PDF' && <FileText className="w-3.5 h-3.5" />}
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatFileSize(item.size)}</span>
                  </div>

                  {/* Thumbnail / File Box */}
                  {item.type === 'IMAGE' && (
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-950 border border-slate-800 relative">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {item.type === 'VIDEO' && (
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-950 border border-slate-800 relative">
                      <video src={item.url} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {item.type === 'PDF' && (
                    <div className="w-full h-32 rounded-lg mb-3 bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 text-slate-400">
                      <FileText className="w-10 h-10 text-rose-400 mb-1" />
                      <span className="text-xs text-slate-300 font-medium truncate max-w-full">{item.name}</span>
                    </div>
                  )}

                  <p className="text-xs font-medium text-white truncate mb-1" title={item.name}>
                    {item.name}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(item)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Preview Media"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMediaToDelete(item)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Media"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Media Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!mediaToDelete}
        onClose={() => setMediaToDelete(null)}
        onConfirm={handleDeleteMedia}
        title="Delete Media File"
        message={`Are you sure you want to delete "${mediaToDelete?.name}"? This action cannot be undone.`}
        loading={deleting}
      />

      {/* Preview Lightbox / Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-white">{previewMedia.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewMedia(null)}>
                Close
              </Button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex justify-center">
              {previewMedia.type === 'IMAGE' && (
                <img src={previewMedia.url} alt={previewMedia.name} className="max-h-[65vh] object-contain rounded-xl" />
              )}
              {previewMedia.type === 'VIDEO' && (
                <video src={previewMedia.url} controls autoPlay className="max-h-[65vh] rounded-xl" />
              )}
              {previewMedia.type === 'PDF' && (
                <iframe src={previewMedia.url} className="w-full h-[60vh] rounded-xl border border-slate-800" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

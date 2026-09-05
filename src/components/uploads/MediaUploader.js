import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import { Image, Video, FileText, UploadCloud, Trash2, ExternalLink, Eye, } from 'lucide-react';
export const MediaUploader = ({ lessonId, mediaList, onMediaChanged, }) => {
    const { toast } = useToast();
    const [selectedType, setSelectedType] = useState('IMAGE');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mediaToDelete, setMediaToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [previewMedia, setPreviewMedia] = useState(null);
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        // Validate size and mime type
        if (selectedType === 'IMAGE' && !file.type.startsWith('image/')) {
            toast('Selected file is not an image (PNG, JPG, WEBP).', 'error');
            return;
        }
        if (selectedType === 'VIDEO' && !file.type.startsWith('video/')) {
            toast('Selected file is not a video (MP4, WEBM, MOV).', 'error');
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
        }
        catch (err) {
            toast(err.message || 'File upload failed.', 'error');
        }
        finally {
            setUploading(false);
            setUploadProgress(0);
            e.target.value = '';
        }
    };
    const handleDeleteMedia = async () => {
        if (!mediaToDelete)
            return;
        try {
            setDeleting(true);
            await apiFetch(`/media/${mediaToDelete.id}`, { method: 'DELETE' });
            toast('Media deleted successfully.', 'success');
            onMediaChanged();
        }
        catch (err) {
            toast(err.message || 'Failed to delete media.', 'error');
        }
        finally {
            setDeleting(false);
            setMediaToDelete(null);
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + ' B';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "p-6 bg-slate-900 border border-slate-800 rounded-2xl", children: [_jsx("h4", { className: "text-base font-semibold text-white mb-4", children: "Upload Media Content" }), _jsxs("div", { className: "flex items-center gap-2 mb-4 p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit", children: [_jsxs("button", { type: "button", onClick: () => setSelectedType('IMAGE'), className: `flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${selectedType === 'IMAGE' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: [_jsx(Image, { className: "w-4 h-4" }), "Image (PNG/JPG/WEBP)"] }), _jsxs("button", { type: "button", onClick: () => setSelectedType('VIDEO'), className: `flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${selectedType === 'VIDEO' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: [_jsx(Video, { className: "w-4 h-4" }), "Video (MP4/WEBM)"] }), _jsxs("button", { type: "button", onClick: () => setSelectedType('PDF'), className: `flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${selectedType === 'PDF' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`, children: [_jsx(FileText, { className: "w-4 h-4" }), "PDF Document"] })] }), _jsxs("label", { className: "relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 hover:border-brand-500 bg-slate-950/50 hover:bg-slate-950 rounded-2xl cursor-pointer transition-all", children: [_jsx(UploadCloud, { className: "w-10 h-10 text-brand-400 mb-2 animate-bounce" }), _jsxs("p", { className: "text-sm font-medium text-white mb-1", children: ["Click to upload or drag & drop ", selectedType.toLowerCase(), " file"] }), _jsxs("p", { className: "text-xs text-slate-400", children: [selectedType === 'IMAGE' && 'PNG, JPG, WEBP up to 10MB', selectedType === 'VIDEO' && 'MP4, WEBM, MOV up to 100MB', selectedType === 'PDF' && 'PDF files up to 25MB'] }), _jsx("input", { type: "file", className: "hidden", accept: selectedType === 'IMAGE'
                                    ? 'image/png,image/jpeg,image/webp'
                                    : selectedType === 'VIDEO'
                                        ? 'video/mp4,video/webm,video/quicktime'
                                        : 'application/pdf', onChange: handleFileUpload, disabled: uploading })] }), uploading && (_jsxs("div", { className: "mt-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs text-slate-300", children: [_jsxs("span", { children: ["Uploading ", selectedType, "..."] }), _jsxs("span", { children: [uploadProgress, "%"] })] }), _jsx("div", { className: "w-full bg-slate-800 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: "bg-brand-500 h-full transition-all duration-300 rounded-full", style: { width: `${uploadProgress}%` } }) })] }))] }), _jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-semibold text-slate-300 mb-3", children: ["Attached Lesson Media (", mediaList.length, ")"] }), mediaList.length === 0 ? (_jsx("p", { className: "text-xs text-slate-500 italic p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center", children: "No media attachments uploaded for this lesson yet." })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: mediaList.map((item) => (_jsxs("div", { className: "group relative p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl shadow-lg transition-all flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("span", { className: "flex items-center gap-2 text-xs font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20", children: [item.type === 'IMAGE' && _jsx(Image, { className: "w-3.5 h-3.5" }), item.type === 'VIDEO' && _jsx(Video, { className: "w-3.5 h-3.5" }), item.type === 'PDF' && _jsx(FileText, { className: "w-3.5 h-3.5" }), item.type] }), _jsx("span", { className: "text-[11px] text-slate-400", children: formatFileSize(item.size) })] }), item.type === 'IMAGE' && (_jsx("div", { className: "w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-950 border border-slate-800 relative", children: _jsx("img", { src: item.url, alt: item.name, className: "w-full h-full object-cover" }) })), item.type === 'VIDEO' && (_jsx("div", { className: "w-full h-32 rounded-lg overflow-hidden mb-3 bg-slate-950 border border-slate-800 relative", children: _jsx("video", { src: item.url, className: "w-full h-full object-cover" }) })), item.type === 'PDF' && (_jsxs("div", { className: "w-full h-32 rounded-lg mb-3 bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 text-slate-400", children: [_jsx(FileText, { className: "w-10 h-10 text-rose-400 mb-1" }), _jsx("span", { className: "text-xs text-slate-300 font-medium truncate max-w-full", children: item.name })] })), _jsx("p", { className: "text-xs font-medium text-white truncate mb-1", title: item.name, children: item.name })] }), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-slate-800 mt-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => setPreviewMedia(item), className: "p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors", title: "Preview Media", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx("a", { href: item.url, target: "_blank", rel: "noopener noreferrer", className: "p-1.5 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors", title: "Open in new tab", children: _jsx(ExternalLink, { className: "w-4 h-4" }) })] }), _jsx("button", { type: "button", onClick: () => setMediaToDelete(item), className: "p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors", title: "Delete Media", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, item.id))) }))] }), _jsx(ConfirmDialog, { isOpen: !!mediaToDelete, onClose: () => setMediaToDelete(null), onConfirm: handleDeleteMedia, title: "Delete Media File", message: `Are you sure you want to delete "${mediaToDelete?.name}"? This action cannot be undone.`, loading: deleting }), previewMedia && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md", children: _jsxs("div", { className: "relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-4 border-b border-slate-800 pb-3", children: [_jsx("h3", { className: "text-base font-semibold text-white", children: previewMedia.name }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setPreviewMedia(null), children: "Close" })] }), _jsxs("div", { className: "max-h-[70vh] overflow-auto flex justify-center", children: [previewMedia.type === 'IMAGE' && (_jsx("img", { src: previewMedia.url, alt: previewMedia.name, className: "max-h-[65vh] object-contain rounded-xl" })), previewMedia.type === 'VIDEO' && (_jsx("video", { src: previewMedia.url, controls: true, autoPlay: true, className: "max-h-[65vh] rounded-xl" })), previewMedia.type === 'PDF' && (_jsx("iframe", { src: previewMedia.url, className: "w-full h-[60vh] rounded-xl border border-slate-800" }))] })] }) }))] }));
};

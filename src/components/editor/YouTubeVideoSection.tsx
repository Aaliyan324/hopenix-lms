import React, { useState, useEffect } from 'react';
import { Youtube, Trash2, CheckCircle2, Play, RefreshCw, AlertCircle, ExternalLink, Maximize2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(
      trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`
    );
    const host = parsed.hostname.toLowerCase();

    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
      return null;
    }

    let videoId: string | null = null;
    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1).split('/')[0];
    } else if (parsed.pathname.startsWith('/watch')) {
      videoId = parsed.searchParams.get('v');
    } else if (parsed.pathname.startsWith('/shorts/')) {
      videoId = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || null;
    } else if (parsed.pathname.startsWith('/embed/')) {
      videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0] || null;
    }

    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    }
  } catch {
    return null;
  }
  return null;
}

interface YouTubeVideoSectionProps {
  youtubeUrl?: string | null;
  onChange: (url: string | null, videoId: string | null) => void;
}

export const YouTubeVideoSection: React.FC<YouTubeVideoSectionProps> = ({ youtubeUrl, onChange }) => {
  const [inputUrl, setInputUrl] = useState(youtubeUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(extractYouTubeVideoId(youtubeUrl || ''));
  const [isEditing, setIsEditing] = useState(!youtubeUrl);

  useEffect(() => {
    setInputUrl(youtubeUrl || '');
    const vid = extractYouTubeVideoId(youtubeUrl || '');
    setVideoId(vid);
    setIsEditing(!youtubeUrl);
  }, [youtubeUrl]);

  const handleAddOrUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!inputUrl.trim()) {
      setError('Please enter a YouTube URL.');
      return;
    }

    const vid = extractYouTubeVideoId(inputUrl);
    if (!vid) {
      setError('Please enter a valid YouTube video URL.');
      return;
    }

    setVideoId(vid);
    setIsEditing(false);
    onChange(inputUrl.trim(), vid);
  };

  const handleRemove = () => {
    setInputUrl('');
    setVideoId(null);
    setError(null);
    setIsEditing(true);
    onChange(null, null);
  };

  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-orange-100 rounded-3xl p-5 sm:p-8 shadow-[0_8px_30px_rgba(249,115,22,0.06)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.1)] transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h4 className="text-lg font-['Poppins',sans-serif] font-bold text-stone-900 flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
            <Youtube className="w-5 h-5" />
          </div>
          YouTube Video Lecture
        </h4>
        {videoId && !isEditing && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-['Inter',sans-serif]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Video Linked
          </span>
        )}
      </div>

      {!isEditing && videoId && thumbnailUrl ? (
        <div className="space-y-5">
          {/* Visual Thumbnail Card */}
          <div className="relative group rounded-2xl overflow-hidden border border-orange-200 bg-orange-50/30 max-w-2xl aspect-video shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
            <img src={thumbnailUrl} alt="YouTube Video Thumbnail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-stone-950/30 flex items-center justify-center group-hover:bg-stone-950/20 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300 group-hover:bg-rose-500 cursor-pointer">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
            
            {/* Video ID Badge */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-orange-200 text-[11px] font-mono text-stone-600 truncate shadow-sm flex items-center justify-between gap-2 font-['Inter',sans-serif]">
              <span className="flex items-center gap-2">
                <Youtube className="w-3.5 h-3.5 text-rose-500" />
                ID: {videoId}
              </span>
              <a 
                href={embedUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 transition-colors"
                title="Open in YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Controls: Replace or Remove */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-semibold rounded-xl border border-orange-200 hover:border-orange-300 transition-all shadow-sm font-['Inter',sans-serif]"
            >
              <RefreshCw className="w-4 h-4" />
              Replace Video
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-sm font-semibold rounded-xl border border-rose-200 hover:border-rose-300 transition-all shadow-sm font-['Inter',sans-serif]"
            >
              <Trash2 className="w-4 h-4" />
              Remove Video
            </button>
            <span className="text-xs text-stone-400 font-['Inter',sans-serif] ml-auto">
              Click play to preview
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddOrUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700 font-['Poppins',sans-serif]">
              YouTube Video URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Youtube className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-orange-50/30 border border-stone-200/80 focus:border-orange-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition-colors font-['Inter',sans-serif]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25 whitespace-nowrap font-['Poppins',sans-serif]"
              >
                <Youtube className="w-4 h-4" />
                {videoId ? 'Update Video' : 'Add Video'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-600 font-semibold flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl font-['Inter',sans-serif]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}

          <div className="bg-orange-50/30 border border-orange-100 rounded-xl p-3">
            <p className="text-xs text-stone-500 font-medium leading-relaxed font-['Inter',sans-serif] flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">ℹ️</span>
              <span>
                Supports YouTube URLs from <code className="bg-white px-1.5 py-0.5 rounded-md text-stone-700 font-mono text-[11px] border border-stone-200">youtube.com</code>, <code className="bg-white px-1.5 py-0.5 rounded-md text-stone-700 font-mono text-[11px] border border-stone-200">youtu.be</code>, <code className="bg-white px-1.5 py-0.5 rounded-md text-stone-700 font-mono text-[11px] border border-stone-200">/shorts/</code>, and <code className="bg-white px-1.5 py-0.5 rounded-md text-stone-700 font-mono text-[11px] border border-stone-200">/embed/</code> formats.
              </span>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
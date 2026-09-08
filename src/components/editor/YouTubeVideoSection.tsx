import React, { useState, useEffect } from 'react';
import { Youtube, Trash2, CheckCircle2, Play, RefreshCw, AlertCircle } from 'lucide-react';
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
      setError('Please enter a value.');
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

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-editorial hover:shadow-editorial transition-shadow">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
            <Youtube className="w-5 h-5" />
          </div>
          YouTube Video Lecture
        </h4>
        {videoId && !isEditing && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Video Linked
          </span>
        )}
      </div>

      {!isEditing && videoId && thumbnailUrl ? (
        <div className="space-y-5">
          {/* Visual Thumbnail Card */}
          <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-xl aspect-video shadow-editorial">
            <img src={thumbnailUrl} alt="YouTube Video Thumbnail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover:bg-slate-950/30 transition-colors">
              <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform group-hover:bg-rose-500">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 truncate shadow-sm">
              ID: {videoId} • {inputUrl}
            </div>
          </div>

          {/* Controls: Replace or Remove */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-all shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              Replace Video
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-sm font-semibold rounded-xl border border-rose-200 transition-all shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              Remove Video
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddOrUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">YouTube Video URL</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (error) setError(null);
                }}
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-orange-500/25 whitespace-nowrap"
              >
                <Youtube className="w-4 h-4" />
                {videoId ? 'Update Video' : 'Add Video'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-600 font-semibold flex items-center gap-2 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Supports YouTube URLs from <code className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-700 font-mono text-[11px]">youtube.com</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-700 font-mono text-[11px]">youtu.be</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-700 font-mono text-[11px]">/shorts/</code>, and <code className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-700 font-mono text-[11px]">/embed/</code> formats.
          </p>
        </form>
      )}
    </div>
  );
};
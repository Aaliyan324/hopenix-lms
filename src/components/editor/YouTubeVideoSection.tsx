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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-white flex items-center gap-2">
          <Youtube className="w-5 h-5 text-rose-500" />
          YouTube Video Lecture
        </h4>
        {videoId && !isEditing && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Video Linked
          </span>
        )}
      </div>

      {!isEditing && videoId && thumbnailUrl ? (
        <div className="space-y-4">
          {/* Visual Thumbnail Card */}
          <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-w-lg aspect-video shadow-2xl">
            <img src={thumbnailUrl} alt="YouTube Video Thumbnail" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover:bg-slate-950/30 transition-colors">
              <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 truncate">
              ID: {videoId} • {inputUrl}
            </div>
          </div>

          {/* Controls: Replace or Remove */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Replace Video
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:bg-rose-500/10"
              onClick={handleRemove}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Remove Video
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAddOrUpdate} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">YouTube Video URL</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (error) setError(null);
                }}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
              />
              <Button type="submit" variant="primary" size="md" icon={<Youtube className="w-4 h-4" />}>
                {videoId ? 'Update Video' : 'Add Video'}
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <p className="text-[11px] text-slate-400">
            Supports YouTube URLs from <code>youtube.com</code>, <code>youtu.be</code>, <code>/shorts/</code>, and <code>/embed/</code> formats.
          </p>
        </form>
      )}
    </div>
  );
};

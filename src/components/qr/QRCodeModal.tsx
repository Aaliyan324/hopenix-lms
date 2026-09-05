import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { apiFetch } from '../../lib/api';
import {
  QrCode,
  Download,
  Copy,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Upload,
  Trash2,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Book ID (required) */
  courseId: string;
  /** Book title */
  courseTitle: string;
  /** Optional: if provided, generates QR for a specific lesson instead of the whole book */
  lessonId?: string;
  /** Optional: lesson title shown in the modal header */
  lessonTitle?: string;
  /** Optional: lesson number shown in the modal header */
  lessonNumber?: number;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  lessonId,
  lessonTitle,
  lessonNumber,
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');

  // Customization Settings
  const [fgColor, setFgColor] = useState('#2e1065');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [qrWidth] = useState<number>(400);

  const isLessonMode = Boolean(lessonId);

  useEffect(() => {
    if (isOpen) {
      fetchQRDetails();
    }
  }, [isOpen, lessonId, courseId]);

  useEffect(() => {
    if (targetUrl && canvasRef.current) {
      renderQRWithLogo();
    }
  }, [targetUrl, fgColor, bgColor, logoUrl, logoSize, qrWidth]);

  const fetchQRDetails = async () => {
    try {
      setLoading(true);
      if (isLessonMode && lessonId) {
        const data = await apiFetch<{
          lessonUrl?: string;
          qrLogo?: string;
        }>(`/lessons/${lessonId}/qr`);
        setTargetUrl(data.lessonUrl || '');
        if (data.qrLogo) setLogoUrl(data.qrLogo);
      } else {
        const data = await apiFetch<{
          bookUrl?: string;
          courseUrl?: string;
          qrLogo?: string;
        }>(`/books/${courseId}/qr`);
        const url = data.bookUrl || data.courseUrl || `${window.location.origin}/books/${courseId}`;
        setTargetUrl(url);
        if (data.qrLogo) setLogoUrl(data.qrLogo);
      }
    } catch {
      toast('Failed to generate QR details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
      toast('Logo uploaded for QR code! ✨', 'success');
    };
    reader.readAsDataURL(file);
  };

  const renderQRWithLogo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !targetUrl) return;

    try {
      await QRCode.toCanvas(canvas, targetUrl, {
        width: qrWidth,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      if (logoUrl) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoUrl;

        img.onload = () => {
          const canvasSize = canvas.width;
          let logoPercent = 0.22;
          if (logoSize === 'small') logoPercent = 0.16;
          if (logoSize === 'large') logoPercent = 0.28;

          const logoDimension = canvasSize * logoPercent;
          const center = canvasSize / 2;
          const x = center - logoDimension / 2;
          const y = center - logoDimension / 2;

          const padding = 6;
          const bgX = x - padding;
          const bgY = y - padding;
          const bgSize = logoDimension + padding * 2;

          ctx.save();
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(bgX, bgY, bgSize, bgSize, 10) : ctx.rect(bgX, bgY, bgSize, bgSize);
          ctx.fill();
          ctx.restore();

          ctx.drawImage(img, x, y, logoDimension, logoDimension);
        };
      }
    } catch (err) {
      console.error('Render QR error:', err);
    }
  };

  const copyLink = async () => {
    if (!targetUrl) return;
    await navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    toast(isLessonMode ? 'Lesson URL copied to clipboard!' : 'Public book URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    const safeName = isLessonMode
      ? `${courseTitle}_Lesson${lessonNumber}_QR`.replace(/[^a-zA-Z0-9]/g, '_')
      : `${courseTitle}_QR`.replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `${safeName}.png`;
    a.click();
    toast('High-resolution PNG downloaded! 🎉', 'success');
  };

  const modalTitle = isLessonMode ? 'Lesson QR Code Studio' : 'Book QR Code Studio';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="xl">
      <div className="space-y-6">
        {/* Header Info Banner */}
        <div className="text-center space-y-1 bg-gradient-to-r from-purple-950/60 to-slate-900 p-4 rounded-2xl border border-purple-500/20">
          {isLessonMode ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-brand-300" />
                <span className="text-xs text-brand-300 font-extrabold">
                  {courseTitle} — Chapter {lessonNumber}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-white">{lessonTitle}</h4>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-brand-300" />
                <span className="text-xs text-brand-300 font-extrabold">Digital Book QR</span>
              </div>
              <h4 className="text-base font-extrabold text-white">{courseTitle}</h4>
            </>
          )}
          <p className="text-xs text-brand-300 font-mono truncate max-w-lg mx-auto">{targetUrl}</p>
        </div>

        {/* QR Canvas Preview */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-purple-500/20 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center" style={{ width: 320, height: 320 }}>
              <RefreshCw className="w-10 h-10 text-brand-400 animate-spin" />
            </div>
          ) : (
            <div className="p-4 bg-white rounded-3xl shadow-2xl inline-block border-4 border-purple-500/30">
              <canvas
                ref={canvasRef}
                style={{ display: 'block', width: 320, height: 320 }}
              />
            </div>
          )}
          <p className="text-xs font-bold text-slate-300 text-center flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" />
            {isLessonMode
              ? 'Scan to open chapter directly on any smartphone.'
              : 'Scan to open full digital book library page.'}
          </p>
        </div>

        {/* Customization & Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Logo Settings */}
          <div className="space-y-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <label className="font-extrabold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-300" />
              Center Brand Logo
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-brand-600 border border-slate-800 rounded-xl cursor-pointer text-white font-extrabold transition-all shadow-md">
                <Upload className="w-4 h-4 text-brand-300" />
                <span>Upload Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              {logoUrl && (
                <button
                  onClick={() => setLogoUrl(null)}
                  className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 transition-colors"
                  title="Remove Logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {logoUrl && (
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-300">Logo Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setLogoSize(sz)}
                      className={`py-1.5 rounded-lg border font-bold capitalize transition-all ${
                        logoSize === sz
                          ? 'bg-brand-600 text-white border-brand-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Color & Action Controls */}
          <div className="space-y-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Foreground</label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer p-1"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Background</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer p-1"
                />
              </div>
            </div>

            <Button
              variant="playful"
              size="md"
              className="w-full rounded-xl"
              onClick={downloadPNG}
              icon={<Download className="w-4 h-4" />}
            >
              Download High-Res PNG
            </Button>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 rounded-xl"
                onClick={copyLink}
                icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={renderQRWithLogo}
                icon={<RefreshCw className="w-4 h-4" />}
                title="Regenerate Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

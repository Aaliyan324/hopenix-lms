import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';
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
  Save,
  AlertTriangle,
} from 'lucide-react';

/** Default Hopenix Brand Logo (SVG Data URI) used when no custom logo is uploaded */
const DEFAULT_HOPENIX_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4c1d95;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="28" fill="url(#grad)"/>
  <path d="M35 30 L35 90 M85 30 L85 90 M35 60 L85 60" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

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
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isLessonMode = Boolean(lessonId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [persistedQrUrl, setPersistedQrUrl] = useState<string | null>(null);
  const [hasPersisted, setHasPersisted] = useState(false);

  // Confirmation Modal state
  const [confirmRegenOpen, setConfirmRegenOpen] = useState(false);

  // Customization Settings (Admin only)
  const [fgColor, setFgColor] = useState('#2e1065');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState<string | null>(DEFAULT_HOPENIX_LOGO);
  const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [qrWidth] = useState<number>(400);

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
          qrCodeUrl?: string;
          logoConfig?: any;
          hasPersistedQR?: boolean;
        }>(`/lessons/${lessonId}/qr`);
        setTargetUrl(data.lessonUrl || '');
        setLogoUrl(data.qrLogo || DEFAULT_HOPENIX_LOGO);
        if (data.logoConfig) {
          try {
            const parsed = typeof data.logoConfig === 'string' ? JSON.parse(data.logoConfig) : data.logoConfig;
            if (parsed.fgColor) setFgColor(parsed.fgColor);
            if (parsed.bgColor) setBgColor(parsed.bgColor);
            if (parsed.logoSize) setLogoSize(parsed.logoSize);
          } catch {}
        }
        if (data.qrCodeUrl) {
          setPersistedQrUrl(data.qrCodeUrl);
          setHasPersisted(true);
        } else {
          setHasPersisted(false);
        }
      } else {
        const data = await apiFetch<{
          bookUrl?: string;
          qrLogo?: string;
          qrCodeUrl?: string;
          logoConfig?: any;
          hasPersistedQR?: boolean;
        }>(`/books/${courseId}/qr`);
        const url = data.bookUrl || `${window.location.origin}/books/${courseId}`;
        setTargetUrl(url);
        setLogoUrl(data.qrLogo || DEFAULT_HOPENIX_LOGO);
        if (data.logoConfig) {
          try {
            const parsed = typeof data.logoConfig === 'string' ? JSON.parse(data.logoConfig) : data.logoConfig;
            if (parsed.fgColor) setFgColor(parsed.fgColor);
            if (parsed.bgColor) setBgColor(parsed.bgColor);
            if (parsed.logoSize) setLogoSize(parsed.logoSize);
          } catch {}
        }
        if (data.qrCodeUrl) {
          setPersistedQrUrl(data.qrCodeUrl);
          setHasPersisted(true);
        } else {
          setHasPersisted(false);
        }
      }
    } catch {
      toast('Failed to load QR details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file for the logo.', 'error');
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/books/upload-qr-logo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to upload logo.');
      }

      setLogoUrl(resData.url);
      toast('Brand logo uploaded permanently! ✨', 'success');
    } catch (err: any) {
      toast(err.message || 'Logo upload failed.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const renderQRWithLogo = async (): Promise<void> => {
    const canvas = canvasRef.current;
    if (!canvas || !targetUrl) return;

    try {
      // 1. Render QR canvas
      await QRCode.toCanvas(canvas, targetUrl, {
        width: qrWidth,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      const effectiveLogo = logoUrl || DEFAULT_HOPENIX_LOGO;

      if (effectiveLogo) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await new Promise<void>((resolve) => {
          const img = new Image();

          // If it's a remote/local URL (not Data URI), route through proxy-asset to bypass private blob auth & CORS restrictions
          let logoSrc = effectiveLogo;
          if (!effectiveLogo.startsWith('data:image/')) {
            logoSrc = `/api/books/proxy-asset?url=${encodeURIComponent(effectiveLogo)}`;
            img.crossOrigin = 'anonymous';
          }

          const drawLogoOnCanvas = () => {
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
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(bgX, bgY, bgSize, bgSize, 12);
            } else {
              ctx.rect(bgX, bgY, bgSize, bgSize);
            }
            ctx.fill();

            // Border around logo background badge
            ctx.strokeStyle = fgColor;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();

            ctx.drawImage(img, x, y, logoDimension, logoDimension);
            resolve();
          };

          img.onload = drawLogoOnCanvas;

          img.onerror = (err) => {
            console.warn('Primary logo load failed, attempting fallback to default brand logo:', err);
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
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
              if (typeof ctx.roundRect === 'function') {
                ctx.roundRect(bgX, bgY, bgSize, bgSize, 12);
              } else {
                ctx.rect(bgX, bgY, bgSize, bgSize);
              }
              ctx.fill();
              ctx.restore();

              ctx.drawImage(fallbackImg, x, y, logoDimension, logoDimension);
              resolve();
            };
            fallbackImg.onerror = () => resolve();
            fallbackImg.src = DEFAULT_HOPENIX_LOGO;
          };

          img.src = logoSrc;
        });
      }
    } catch (err) {
      console.error('Render QR error:', err);
    }
  };

  const handleSaveOrRegenerate = async (isRegenerate = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setSaving(true);
      // Guarantee logo is fully drawn onto canvas before capturing dataURL
      await renderQRWithLogo();
      const qrDataUrl = canvas.toDataURL('image/png');
      const endpoint = isLessonMode ? `/lessons/${lessonId}/qr` : `/books/${courseId}/qr`;

      const data = await apiFetch<{
        qrCodeUrl: string;
        message: string;
      }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          qrDataUrl,
          logoUrl,
          logoConfig: { fgColor, bgColor, logoSize },
          regenerate: isRegenerate,
        }),
      });

      setPersistedQrUrl(data.qrCodeUrl);
      setHasPersisted(true);
      toast(data.message || 'QR code saved permanently!', 'success');
      setConfirmRegenOpen(false);
    } catch (err: any) {
      toast(err.message || 'Failed to save QR code.', 'error');
    } finally {
      setSaving(false);
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

  const modalTitle = isLessonMode
    ? isAdmin ? 'Lesson QR Code Studio' : 'Lesson QR Code'
    : isAdmin ? 'Book QR Code Studio' : 'Book QR Code';

  return (
    <>
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

          {/* QR Canvas Preview Area */}
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

          {/* ADMIN Customization Controls */}
          {isAdmin ? (
            <div className="space-y-4">
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
                      <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                    {logoUrl && logoUrl !== DEFAULT_HOPENIX_LOGO && (
                      <button
                        onClick={() => setLogoUrl(DEFAULT_HOPENIX_LOGO)}
                        className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 transition-colors"
                        title="Reset to Default Brand Logo"
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

                {/* Color Controls */}
                <div className="space-y-3 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <label className="font-extrabold text-white">QR Code Palette</label>
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
                </div>
              </div>

              {/* Admin Save & Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {!hasPersisted ? (
                  <Button
                    variant="playful"
                    size="md"
                    className="flex-1 rounded-xl"
                    loading={saving}
                    onClick={() => handleSaveOrRegenerate(false)}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Generate & Save Permanent QR
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1 rounded-xl text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                    loading={saving}
                    onClick={() => setConfirmRegenOpen(true)}
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Regenerate QR Code
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="md"
                  className="rounded-xl"
                  onClick={downloadPNG}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download PNG
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  className="rounded-xl"
                  onClick={copyLink}
                  icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>
          ) : (
            /* NON-ADMIN Consumer View (Student / Guest / Editor) */
            <div className="flex gap-3 pt-2">
              <Button
                variant="playful"
                size="md"
                className="flex-1 rounded-xl"
                onClick={downloadPNG}
                icon={<Download className="w-4 h-4" />}
              >
                Download QR Image
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="flex-1 rounded-xl"
                onClick={copyLink}
                icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation Modal for Admin Regeneration */}
      <Modal
        isOpen={confirmRegenOpen}
        onClose={() => setConfirmRegenOpen(false)}
        title="Confirm QR Code Regeneration"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Regenerating this QR code may invalidate the existing QR configuration. Are you sure you want to proceed?
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmRegenOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={() => handleSaveOrRegenerate(true)}
              className="bg-amber-600 hover:bg-amber-500 border-amber-500"
            >
              Confirm Regeneration
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

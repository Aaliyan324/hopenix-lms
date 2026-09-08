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
  Check,
  BookOpen,
  Layers,
  Save,
  AlertTriangle,
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
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isLessonMode = Boolean(lessonId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [persistedQrUrl, setPersistedQrUrl] = useState<string | null>(null);
  const [hasPersisted, setHasPersisted] = useState(false);

  // Confirmation Modal state
  const [confirmRegenOpen, setConfirmRegenOpen] = useState(false);

  // Customization Settings (Admin only)
  const [fgColor, setFgColor] = useState('#1c1917');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrWidth] = useState<number>(400);

  useEffect(() => {
    if (isOpen) {
      fetchQRDetails();
    }
  }, [isOpen, lessonId, courseId]);

  useEffect(() => {
    if (targetUrl && canvasRef.current) {
      renderQR();
    }
  }, [targetUrl, fgColor, bgColor, qrWidth]);

  const fetchQRDetails = async () => {
    try {
      setLoading(true);
      if (isLessonMode && lessonId) {
        const data = await apiFetch<{
          lessonUrl?: string;
          qrCodeUrl?: string;
          logoConfig?: any;
          hasPersistedQR?: boolean;
        }>(`/lessons/${lessonId}/qr`);
        setTargetUrl(data.lessonUrl || '');
        if (data.logoConfig) {
          try {
            const parsed = typeof data.logoConfig === 'string' ? JSON.parse(data.logoConfig) : data.logoConfig;
            if (parsed.fgColor) setFgColor(parsed.fgColor);
            if (parsed.bgColor) setBgColor(parsed.bgColor);
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
          qrCodeUrl?: string;
          logoConfig?: any;
          hasPersistedQR?: boolean;
        }>(`/books/${courseId}/qr`);
        const url = data.bookUrl || `${window.location.origin}/books/${courseId}`;
        setTargetUrl(url);
        if (data.logoConfig) {
          try {
            const parsed = typeof data.logoConfig === 'string' ? JSON.parse(data.logoConfig) : data.logoConfig;
            if (parsed.fgColor) setFgColor(parsed.fgColor);
            if (parsed.bgColor) setBgColor(parsed.bgColor);
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

  const renderQR = async (): Promise<void> => {
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
    } catch (err) {
      console.error('Render QR error:', err);
    }
  };

  const handleSaveOrRegenerate = async (isRegenerate = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setSaving(true);
      await renderQR();
      const qrDataUrl = canvas.toDataURL('image/png');
      const endpoint = isLessonMode ? `/lessons/${lessonId}/qr` : `/books/${courseId}/qr`;

      const data = await apiFetch<{
        qrCodeUrl: string;
        message: string;
      }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          qrDataUrl,
          logoConfig: { fgColor, bgColor },
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
    toast('High-resolution PNG downloaded!', 'success');
  };

  const modalTitle = isLessonMode
    ? isAdmin ? 'Lesson QR Code Studio' : 'Lesson QR Code'
    : isAdmin ? 'Publication QR Code' : 'Book QR Code';

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="xl">
        <div className="space-y-6">
          {/* Header Info Banner */}
          <div className="text-center space-y-1 bg-stone-50 p-4 rounded-xl border border-stone-200">
            {isLessonMode ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-stone-600" />
                  <span className="text-xs text-stone-600 font-semibold">
                    {courseTitle} — Chapter {lessonNumber}
                  </span>
                </div>
                <h4 className="text-base font-serif font-bold text-stone-900">{lessonTitle}</h4>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-stone-600" />
                  <span className="text-xs text-stone-600 font-semibold">Digital Publication</span>
                </div>
                <h4 className="text-base font-serif font-bold text-stone-900">{courseTitle}</h4>
              </>
            )}
            <p className="text-xs text-stone-500 font-mono truncate max-w-lg mx-auto">{targetUrl}</p>
          </div>

          {/* QR Canvas Preview Area */}
          <div className="flex flex-col items-center justify-center p-6 bg-stone-100 rounded-xl border border-stone-200 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center" style={{ width: 320, height: 320 }}>
                <RefreshCw className="w-8 h-8 text-stone-600 animate-spin" />
              </div>
            ) : (
              <div className="p-4 bg-white rounded-xl shadow-md inline-block border border-stone-200">
                <canvas
                  ref={canvasRef}
                  style={{ display: 'block', width: 320, height: 320 }}
                />
              </div>
            )}
            <p className="text-xs text-stone-600 text-center font-medium">
              {isLessonMode
                ? 'Scan to open chapter directly on mobile.'
                : 'Scan to view digital publication online.'}
            </p>
          </div>

          {/* ADMIN Customization Controls */}
          {isAdmin ? (
            <div className="space-y-4">
              {/* Color Controls */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <label className="font-semibold text-stone-900 text-sm">QR Code Palette</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-medium text-stone-600 block mb-1">Foreground Color</label>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-full h-9 bg-white border border-stone-300 rounded cursor-pointer p-1"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-stone-600 block mb-1">Background Color</label>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full h-9 bg-white border border-stone-300 rounded cursor-pointer p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Save & Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {!hasPersisted ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    loading={saving}
                    onClick={() => handleSaveOrRegenerate(false)}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Save QR Code
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1"
                    loading={saving}
                    onClick={() => setConfirmRegenOpen(true)}
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Regenerate QR
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="md"
                  onClick={downloadPNG}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download PNG
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={copyLink}
                  icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>
              </div>
            </div>
          ) : (
            /* Consumer View (Public Viewer / Editor) */
            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={downloadPNG}
                icon={<Download className="w-4 h-4" />}
              >
                Download QR Code
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={copyLink}
                icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
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
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-normal">
              Regenerating this QR code may update the stored QR artwork. Are you sure you want to proceed?
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
            >
              Confirm Regeneration
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};


import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { apiFetch } from '../../lib/api';
import { QrCode, Download, Copy, RefreshCw, ExternalLink, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrData, setQrData] = useState<{
    courseUrl: string;
    qrDataUrl: string;
    svgData: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchQRCode();
    }
  }, [isOpen, courseId]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/courses/${courseId}/qr`);
      setQrData(data);
    } catch (err: any) {
      toast('Failed to generate QR code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!qrData) return;
    await navigator.clipboard.writeText(qrData.courseUrl);
    setCopied(true);
    toast('Course link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = () => {
    if (!qrData) return;
    const a = document.createElement('a');
    a.href = qrData.qrDataUrl;
    a.download = `${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_QR.png`;
    a.click();
    toast('PNG QR code downloaded!', 'success');
  };

  const downloadSVG = () => {
    if (!qrData) return;
    const blob = new Blob([qrData.svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_QR.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast('SVG QR code downloaded!', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Course Access QR Code" maxWidth="md">
      <div className="space-y-6 text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
            <p className="text-sm text-slate-400">Generating course QR code...</p>
          </div>
        ) : qrData ? (
          <>
            <div>
              <h4 className="text-base font-semibold text-white mb-1">{courseTitle}</h4>
              <p className="text-xs text-slate-400 truncate max-w-sm mx-auto">{qrData.courseUrl}</p>
            </div>

            {/* QR Code Container */}
            <div className="inline-block p-4 bg-white rounded-2xl shadow-xl ring-1 ring-slate-800">
              <img src={qrData.qrDataUrl} alt="Course QR Code" className="w-56 h-56 mx-auto object-contain" />
            </div>

            {/* Action Controls */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" onClick={downloadPNG} icon={<Download className="w-4 h-4" />}>
                PNG Image
              </Button>
              <Button variant="outline" size="sm" onClick={downloadSVG} icon={<Download className="w-4 h-4" />}>
                SVG Vector
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={copyLink}
                icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy Direct URL'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchQRCode}
                icon={<RefreshCw className="w-4 h-4" />}
                title="Regenerate QR Code"
              />
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};

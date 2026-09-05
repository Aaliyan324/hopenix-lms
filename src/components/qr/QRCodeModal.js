import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { apiFetch } from '../../lib/api';
import { Download, Copy, RefreshCw, Image as ImageIcon, Check, Upload, Trash2, } from 'lucide-react';
export const QRCodeModal = ({ isOpen, onClose, courseId, courseTitle, }) => {
    const { toast } = useToast();
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [bookUrl, setBookUrl] = useState('');
    // Customization Settings
    const [fgColor, setFgColor] = useState('#0f172a');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [logoUrl, setLogoUrl] = useState(null);
    const [logoSize, setLogoSize] = useState('medium');
    const [qrWidth, setQrWidth] = useState(400);
    useEffect(() => {
        if (isOpen && courseId) {
            fetchQRDetails();
        }
    }, [isOpen, courseId]);
    useEffect(() => {
        if (bookUrl && canvasRef.current) {
            renderQRWithLogo();
        }
    }, [bookUrl, fgColor, bgColor, logoUrl, logoSize, qrWidth]);
    const fetchQRDetails = async () => {
        try {
            setLoading(true);
            const data = await apiFetch(`/books/${courseId}/qr`);
            const url = data.bookUrl || data.courseUrl || `${window.location.origin}/books/${courseId}`;
            setBookUrl(url);
            if (data.qrLogo) {
                setLogoUrl(data.qrLogo);
            }
        }
        catch (err) {
            toast('Failed to generate QR details.', 'error');
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            setLogoUrl(reader.result);
            toast('Logo uploaded for QR code!', 'success');
        };
        reader.readAsDataURL(file);
    };
    const renderQRWithLogo = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !bookUrl)
            return;
        try {
            // 1. Generate base QR on canvas with Error Correction H
            await QRCode.toCanvas(canvas, bookUrl, {
                width: qrWidth,
                margin: 2,
                errorCorrectionLevel: 'H',
                color: {
                    dark: fgColor,
                    light: bgColor,
                },
            });
            // 2. If Logo is present, draw centered logo with safe background padding
            if (logoUrl) {
                const ctx = canvas.getContext('2d');
                if (!ctx)
                    return;
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = logoUrl;
                img.onload = () => {
                    const canvasSize = canvas.width;
                    let logoPercent = 0.22; // medium
                    if (logoSize === 'small')
                        logoPercent = 0.16;
                    if (logoSize === 'large')
                        logoPercent = 0.28;
                    const logoDimension = canvasSize * logoPercent;
                    const center = canvasSize / 2;
                    const x = center - logoDimension / 2;
                    const y = center - logoDimension / 2;
                    const padding = 6;
                    const bgX = x - padding;
                    const bgY = y - padding;
                    const bgSize = logoDimension + padding * 2;
                    // Draw white/bg protective rounded rect
                    ctx.save();
                    ctx.fillStyle = bgColor;
                    ctx.beginPath();
                    ctx.roundRect ? ctx.roundRect(bgX, bgY, bgSize, bgSize, 10) : ctx.rect(bgX, bgY, bgSize, bgSize);
                    ctx.fill();
                    ctx.restore();
                    // Draw centered logo
                    ctx.drawImage(img, x, y, logoDimension, logoDimension);
                };
            }
        }
        catch (err) {
            console.error('Render QR error:', err);
        }
    };
    const copyLink = async () => {
        if (!bookUrl)
            return;
        await navigator.clipboard.writeText(bookUrl);
        setCopied(true);
        toast('Public book URL copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };
    const downloadPNG = () => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_QR.png`;
        a.click();
        toast('High-resolution PNG downloaded!', 'success');
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Book QR Code Studio", maxWidth: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center space-y-1", children: [_jsx("h4", { className: "text-base font-semibold text-white", children: courseTitle }), _jsx("p", { className: "text-xs text-brand-400 font-mono truncate max-w-md mx-auto", children: bookUrl })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 items-center", children: [_jsxs("div", { className: "flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3", children: [_jsx("div", { className: "p-3 bg-white rounded-2xl shadow-2xl inline-block", children: _jsx("canvas", { ref: canvasRef, className: "w-56 h-56 object-contain" }) }), _jsx("p", { className: "text-[11px] text-slate-400 text-center", children: "Scans directly to public book page. No login required." })] }), _jsxs("div", { className: "space-y-4 text-xs text-slate-300", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "font-semibold text-white flex items-center gap-1.5", children: [_jsx(ImageIcon, { className: "w-4 h-4 text-brand-400" }), "Center QR Logo"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("label", { className: "flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer text-slate-200 font-semibold transition-colors", children: [_jsx(Upload, { className: "w-4 h-4 text-brand-400" }), _jsx("span", { children: "Upload Logo" }), _jsx("input", { type: "file", accept: "image/*", onChange: handleLogoUpload, className: "hidden" })] }), logoUrl && (_jsx("button", { onClick: () => setLogoUrl(null), className: "p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors", title: "Remove Logo", children: _jsx(Trash2, { className: "w-4 h-4" }) }))] })] }), logoUrl && (_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "font-semibold text-slate-300", children: "Logo Size" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: ['small', 'medium', 'large'].map((sz) => (_jsx("button", { onClick: () => setLogoSize(sz), className: `py-1.5 rounded-lg border font-semibold capitalize transition-all ${logoSize === sz
                                                    ? 'bg-brand-600 text-white border-brand-500'
                                                    : 'bg-slate-900 text-slate-400 border-slate-800'}`, children: sz }, sz))) })] })), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "font-semibold text-slate-300 block mb-1", children: "Foreground" }), _jsx("input", { type: "color", value: fgColor, onChange: (e) => setFgColor(e.target.value), className: "w-full h-9 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer p-1" })] }), _jsxs("div", { children: [_jsx("label", { className: "font-semibold text-slate-300 block mb-1", children: "Background" }), _jsx("input", { type: "color", value: bgColor, onChange: (e) => setBgColor(e.target.value), className: "w-full h-9 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer p-1" })] })] }), _jsxs("div", { className: "pt-2 space-y-2", children: [_jsx(Button, { variant: "primary", size: "sm", className: "w-full shadow-lg shadow-brand-500/20", onClick: downloadPNG, icon: _jsx(Download, { className: "w-4 h-4" }), children: "Download PNG QR Code" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "secondary", size: "sm", className: "flex-1", onClick: copyLink, icon: copied ? _jsx(Check, { className: "w-4 h-4 text-emerald-400" }) : _jsx(Copy, { className: "w-4 h-4" }), children: copied ? 'Copied Link!' : 'Copy Book URL' }), _jsx(Button, { variant: "ghost", size: "sm", onClick: renderQRWithLogo, icon: _jsx(RefreshCw, { className: "w-4 h-4" }), title: "Regenerate Preview" })] })] })] })] })] }) }));
};

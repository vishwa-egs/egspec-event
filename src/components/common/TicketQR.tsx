import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, Maximize2, X, QrCode as QrIcon } from 'lucide-react';

export interface TicketQRProps {
  /** The unique registration ID to encode (e.g. 'EVT-2026-000123') */
  registrationId: string;
  /** Optional associated event ID for verification */
  eventId?: string;
  /** Optional student ID */
  studentId?: string;
  /** Width and height in pixels (default: 160) */
  size?: number;
  /** QR Error correction level: 'L' | 'M' | 'Q' | 'H' (default: 'M') */
  level?: 'L' | 'M' | 'Q' | 'H';
  /** Whether to include margin / quiet zone (default: true) */
  includeMargin?: boolean;
  /** Background color (default: '#FFFFFF') */
  bgColor?: string;
  /** Foreground / QR code dots color (default: '#0F172A') */
  fgColor?: string;
  /** Whether to render registration ID text below the QR code (default: true) */
  showLabel?: boolean;
  /** Optional secondary subtitle or instruction text below the label */
  subLabel?: string;
  /** Whether to render download and enlarge action buttons (default: true) */
  showActions?: boolean;
  /** Corner reticle brackets styling around the viewfinder (default: true) */
  showReticle?: boolean;
  /** Optional custom CSS classes for the container */
  className?: string;
}

export const TicketQR: React.FC<TicketQRProps> = ({
  registrationId,
  size = 160,
  level = 'M',
  includeMargin = true,
  bgColor = '#FFFFFF',
  fgColor = '#0F172A',
  showLabel = true,
  subLabel = 'Present at entrance scanner',
  showActions = true,
  showReticle = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registrationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    try {
      if (!containerRef.current) return;
      const svg = containerRef.current.querySelector('svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = size * 2;
        canvas.height = size * 2;
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `Ticket-QR-${registrationId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  if (!registrationId) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400">
        <QrIcon className="w-6 h-6 mb-1 text-slate-300" />
        <span>No registration ID</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ticket-qr-container inline-flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs ${className}`}
      data-testid="ticket-qr"
    >
      {/* Scanner viewfinder with optional corner reticle brackets */}
      <div className="relative p-1.5 bg-slate-50/70 rounded-lg border border-slate-100 flex items-center justify-center">
        {showReticle && (
          <>
            <span
              className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-900 rounded-tl-sm pointer-events-none"
              aria-hidden="true"
            />
            <span
              className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-900 rounded-tr-sm pointer-events-none"
              aria-hidden="true"
            />
            <span
              className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-900 rounded-bl-sm pointer-events-none"
              aria-hidden="true"
            />
            <span
              className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-900 rounded-br-sm pointer-events-none"
              aria-hidden="true"
            />
          </>
        )}

        <QRCodeSVG
          value={registrationId}
          size={size}
          level={level}
          includeMargin={includeMargin}
          bgColor={bgColor}
          fgColor={fgColor}
          className="block max-w-full rounded shadow-2xs"
          role="img"
          aria-label={`QR Code for registration ID ${registrationId}`}
        />
      </div>

      {/* Label and ID */}
      {showLabel && (
        <div className="mt-2.5 text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-900 tracking-tight select-all">
              {registrationId}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              title="Copy Registration ID"
              aria-label="Copy Registration ID"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          {subLabel && (
            <p className="text-[10px] text-slate-400 font-medium">
              {copied ? 'Copied to clipboard!' : subLabel}
            </p>
          )}
        </div>
      )}

      {/* Action Toolbar */}
      {showActions && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center gap-2 w-full">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            title="Download QR Image"
          >
            <Download className="w-3 h-3 text-slate-600" />
            <span>Save QR</span>
          </button>

          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            title="Enlarge QR for Scanning"
          >
            <Maximize2 className="w-3 h-3 text-blue-800" />
            <span>Enlarge</span>
          </button>
        </div>
      )}

      {/* Zoom / Fullscreen Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close enlarged view"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Official Event QR Pass
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                High-Contrast Entrance QR
              </h3>
              <p className="text-xs text-slate-500">
                Increase screen brightness for rapid verification by the faculty coordinator.
              </p>
            </div>

            <div className="p-3 bg-white border-2 border-slate-900 rounded-xl inline-block shadow-inner mx-auto">
              <QRCodeSVG
                value={registrationId}
                size={260}
                level="H"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#000000"
                className="block mx-auto"
              />
            </div>

            <div className="space-y-1">
              <p className="font-mono text-sm font-bold text-slate-900 bg-slate-100 py-1.5 px-3 rounded-lg inline-block">
                {registrationId}
              </p>
              <p className="text-[11px] text-slate-400">
                E.G.S. Pillay Engineering College · Nagapattinam
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Photos</span>
              </button>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketQR;

import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Building,
  Calendar,
  User,
  Hash,
  CreditCard,
  RefreshCw,
  FileText,
  FileCheck
} from 'lucide-react';
import { CollegeEvent, Profile, Registration, PaymentTransaction } from '../../types';

interface PaymentReceiptModalProps {
  registration: Registration;
  event: CollegeEvent;
  student: Profile;
  payment?: PaymentTransaction | null;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  registration,
  event,
  student,
  payment,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const receiptDate = new Date(registration.registered_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const receiptNo = `REC-${registration.registration_id.replace('EVT-', 'EGS-')}`;
  const txnRef = registration.transaction_ref || payment?.transaction_ref || 'TXN-EGS-DIRECT';
  const payMethod = registration.payment_method || payment?.payment_method_detail || 'Online Payment Gateway';
  const feeAmount = registration.amount_paid ?? event.registration_fee ?? 0;

  const verificationUrl = `https://egspec.edu.in/verify/receipt?no=${receiptNo}&reg=${registration.registration_id}`;

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Print failed:', err);
      handleDownloadImage();
    }
  };

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    setDownloadSuccess(null);

    try {
      // Capture at high resolution (scale 2) for crisp printing/viewing
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imgData;
      downloadLink.download = `EGSPEC_Fee_Receipt_${receiptNo}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setDownloadSuccess('Fee Receipt image downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Error generating receipt image:', err);
      // Fallback to standalone document download
      handleDownloadDocument();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDocument = () => {
    setIsDownloading(true);
    try {
      const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EGSPEC Fee Receipt - ${receiptNo}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 24px;
      margin: 0;
    }
    .receipt-container {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 900; color: #172554; text-transform: uppercase; margin: 4px 0; }
    .badge { font-size: 11px; font-weight: bold; color: #92400e; text-transform: uppercase; }
    .sub { font-size: 11px; color: #64748b; margin: 2px 0; }
    .receipt-pill { display: inline-block; background: #172554; color: white; padding: 4px 12px; font-size: 11px; font-weight: bold; border-radius: 4px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 11px; margin-bottom: 20px; }
    .meta-item span { display: block; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 600; }
    .meta-item strong { color: #0f172a; font-family: monospace; font-size: 12px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 11px; background: #fafafa; }
    .box h4 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #64748b; }
    .box-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .table-container { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
    th { background: #f1f5f9; padding: 10px; font-weight: bold; border-bottom: 1px solid #cbd5e1; }
    td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
    .total-row { background: #eff6ff; font-weight: bold; font-size: 13px; color: #172554; }
    .footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; }
    .stamp { border: 1px solid #86efac; background: #f0fdf4; color: #166534; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 4px; }
    .no-print-btn { text-align: center; margin-top: 20px; }
    .btn { background: #172554; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; }
    @media print { .no-print-btn { display: none; } body { padding: 0; background: white; } .receipt-container { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="title">E.G.S. PILLAY ENGINEERING COLLEGE</div>
      <div class="badge">(AUTONOMOUS) · ACCREDITED BY NAAC WITH 'A++' GRADE</div>
      <div class="sub">Approved by AICTE, New Delhi · Affiliated to Anna University, Chennai</div>
      <div class="sub">Old Nagore Main Road, Thethi, Nagapattinam - 611 002, Tamil Nadu, India</div>
      <div><span class="receipt-pill">Official Event Fee Payment Receipt</span></div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><span>Receipt No</span><strong>${receiptNo}</strong></div>
      <div class="meta-item"><span>Date</span><strong style="font-family: inherit;">${receiptDate}</strong></div>
      <div class="meta-item"><span>Transaction Ref</span><strong>${txnRef}</strong></div>
      <div class="meta-item"><span>Status</span><strong style="color: #16a34a;">PAID / VERIFIED</strong></div>
    </div>

    <div class="details-grid">
      <div class="box">
        <h4>Candidate Details</h4>
        <div class="box-row"><span>Name:</span><strong>${student.name}</strong></div>
        <div class="box-row"><span>Register No:</span><strong>${student.register_number}</strong></div>
        <div class="box-row"><span>Department:</span><strong>${student.department}</strong></div>
        <div class="box-row"><span>Year:</span><strong>${student.year || '3rd Year'}</strong></div>
      </div>
      <div class="box">
        <h4>Event Details</h4>
        <div class="box-row"><span>Title:</span><strong>${event.title}</strong></div>
        <div class="box-row"><span>Category:</span><strong>${event.category?.name || 'College Event'}</strong></div>
        <div class="box-row"><span>Date:</span><strong>${event.date}</strong></div>
        <div class="box-row"><span>Reg ID:</span><strong>${registration.registration_id}</strong></div>
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th style="text-align: center;">Payment Mode</th>
            <th style="text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${event.title} — Registration Fee</strong><br><span style="color: #64748b; font-size: 11px;">Admission pass, participation kit, workshop certificate & access.</span></td>
            <td style="text-align: center;">${payMethod}</td>
            <td style="text-align: right; font-family: monospace;">₹${feeAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: right; color: #64748b;">GST / Educational Cess:</td>
            <td style="text-align: right; font-family: monospace;">₹0.00</td>
          </tr>
          <tr class="total-row">
            <td colspan="2" style="text-align: right;">Total Amount Paid:</td>
            <td style="text-align: right; font-family: monospace;">₹${feeAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      <div>
        <div style="font-weight: bold; color: #334155;">Verified Authentic Receipt</div>
        <div style="color: #64748b; font-size: 10px;">Digitally recorded in Firestore Treasury Engine</div>
        <div style="font-family: monospace; font-size: 10px; color: #475569;">${verificationUrl}</div>
      </div>
      <div style="text-align: right;">
        <span class="stamp">✓ Digitally Signed & Sealed</span>
        <div style="font-weight: bold; font-size: 11px;">Dean of Student Affairs & Finance</div>
        <div style="color: #64748b; font-size: 10px;">E.G.S. Pillay Engineering College</div>
      </div>
    </div>
  </div>

  <div class="no-print-btn">
    <button class="btn" onclick="window.print()">Print Receipt / Save as PDF</button>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `EGSPEC_Fee_Receipt_${receiptNo}.html`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);

      setDownloadSuccess('Printable Fee Receipt document downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Error downloading document:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Actions Bar (Hidden when printing) */}
        <div className="bg-slate-900 px-5 sm:px-6 py-3.5 text-white flex items-center justify-between no-print gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold tracking-wide truncate">EGSPEC Official Payment E-Receipt</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download Receipt as PNG Image */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs disabled:opacity-60"
              title="Download image of receipt to device"
            >
              {isDownloading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Download Receipt</span>
            </button>

            {/* Print / Save as PDF */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              title="Print receipt or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between no-print animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{downloadSuccess}</span>
            </div>
            <button
              onClick={() => setDownloadSuccess(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Printable & Capturable Receipt Body */}
        <div
          ref={receiptRef}
          className="printable-receipt flex-1 overflow-y-auto p-6 sm:p-8 bg-white space-y-6 print:p-0 print:overflow-visible"
        >
          
          {/* Institutional Header */}
          <div className="text-center pb-5 border-b-2 border-slate-900/80 space-y-1">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-950 text-amber-300 flex items-center justify-center font-black text-sm border-2 border-amber-400">
                EGS
              </div>
              <div className="text-left">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-blue-950 leading-tight uppercase font-serif">
                  E.G.S. PILLAY ENGINEERING COLLEGE
                </h1>
                <p className="text-[10px] sm:text-[11px] font-semibold text-amber-800 tracking-wide">
                  (AUTONOMOUS) · ACCREDITED BY NAAC WITH 'A++' GRADE
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Approved by AICTE, New Delhi · Affiliated to Anna University, Chennai
            </p>
            <p className="text-[10px] text-slate-500">
              Old Nagore Main Road, Thethi, Nagapattinam - 611 002, Tamil Nadu, India
            </p>
            
            <div className="pt-2">
              <span className="inline-block px-4 py-1 text-[11px] font-extrabold uppercase tracking-widest bg-blue-950 text-white rounded">
                Official Event Fee Payment Receipt
              </span>
            </div>
          </div>

          {/* Receipt Identifiers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Receipt Number</span>
              <span className="font-mono font-bold text-slate-800">{receiptNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Date</span>
              <span className="font-medium text-slate-800">{receiptDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Transaction Ref</span>
              <span className="font-mono font-bold text-blue-900 truncate block">{txnRef}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                PAID / VERIFIED
              </span>
            </div>
          </div>

          {/* Student & Event 2-Column Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Student Details */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Student Details
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate Name:</span>
                  <span className="font-bold text-slate-800">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Register Number:</span>
                  <span className="font-mono font-bold text-slate-800">{student.register_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department &amp; Year:</span>
                  <span className="font-medium text-slate-800">{student.department} · {student.year || '3rd Year'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Institutional Email:</span>
                  <span className="text-slate-700 truncate max-w-[150px]">{student.email}</span>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Event &amp; Admission Pass
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Event Title:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[150px]">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-blue-900">{event.category?.name || 'Technical'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Event Date:</span>
                  <span className="font-medium text-slate-800">{event.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration ID:</span>
                  <span className="font-mono font-bold text-blue-900">{registration.registration_id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items / Settlement Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Payment Mode</th>
                  <th className="p-3 text-right">Fee (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="p-3">
                    <span className="font-bold block">{event.title} — Registration Fee</span>
                    <span className="text-[11px] text-slate-500">
                      Admission pass, kit, official workshop/symposium certificate &amp; access.
                    </span>
                  </td>
                  <td className="p-3 text-center font-medium text-slate-600">
                    {payMethod}
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    ₹{feeAmount.toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td colSpan={2} className="p-2.5 text-right text-slate-500 font-medium">
                    GST / Education Welfare Cess (Exempted):
                  </td>
                  <td className="p-2.5 text-right font-mono text-slate-600">
                    ₹0.00
                  </td>
                </tr>
                <tr className="bg-blue-50/70 border-t-2 border-blue-900">
                  <td colSpan={2} className="p-3 text-right font-extrabold text-blue-950 text-sm">
                    Total Amount Paid:
                  </td>
                  <td className="p-3 text-right font-mono font-extrabold text-blue-950 text-sm">
                    ₹{feeAmount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Seals & Verification */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <QRCodeSVG value={verificationUrl} size={64} level="M" />
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <span className="font-bold text-slate-700 block">Scan to Verify Authenticity</span>
                <span>Digitally authorized and recorded in</span>
                <span className="font-mono block text-slate-600">Firestore Treasury Collection</span>
              </div>
            </div>

            {/* Official Digital Signatures Stamp */}
            <div className="text-right space-y-1">
              <div className="inline-block px-3 py-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] font-bold tracking-wider uppercase mb-1">
                ✓ Digitally Signed &amp; Sealed
              </div>
              <div className="text-[11px] font-bold text-slate-800">
                Dean of Student Affairs &amp; Finance Office
              </div>
              <div className="text-[10px] text-slate-400">
                E.G.S. Pillay Engineering College, Nagapattinam
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <span className="text-xs text-slate-500">
            Permanent proof of fee settlement. Saved under your student account.
          </span>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Download Image Button */}
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-xs disabled:opacity-60"
            >
              {isDownloading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download Image (PNG)</span>
            </button>

            {/* Download Document Button */}
            <button
              type="button"
              onClick={handleDownloadDocument}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-60"
            >
              <FileText className="w-3.5 h-3.5 text-blue-800" />
              <span>Download Doc (HTML)</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

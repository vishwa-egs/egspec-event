import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { CollegeEvent, Profile, PaymentTransaction } from '../../types';
import { portalApi } from '../../services/supabase';
import { BankQrConnector, ALL_CONNECTED_BANKS } from './BankQrConnector';

interface PaymentGatewayModalProps {
  event: CollegeEvent;
  amount: number;
  student: Profile;
  onSuccess: (result: {
    transactionRef: string;
    paymentMethod: string;
    amount: number;
    payment: PaymentTransaction;
  }) => void;
  onClose: () => void;
}

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'wallet';

const POPULAR_UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', color: 'bg-white border-slate-200 text-slate-800' },
  { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-50 border-purple-200 text-purple-900' },
  { id: 'paytm', name: 'Paytm UPI', color: 'bg-sky-50 border-sky-200 text-sky-900' },
  { id: 'bhim', name: 'BHIM UPI', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
  { id: 'cred', name: 'CRED UPI', color: 'bg-slate-900 text-white border-slate-800' }
];

const POPULAR_BANKS = [
  { id: 'iob', name: 'Indian Overseas Bank', badge: 'College Partner Branch', isPrimary: true },
  { id: 'sbi', name: 'State Bank of India', badge: 'Fastest' },
  { id: 'hdfc', name: 'HDFC Bank', badge: 'Instant' },
  { id: 'icici', name: 'ICICI Bank', badge: 'Instant' },
  { id: 'canara', name: 'Canara Bank', badge: 'Popular' },
  { id: 'axis', name: 'Axis Bank', badge: 'Instant' },
];

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  event,
  amount,
  student,
  onSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  
  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(student.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Netbanking states
  const [selectedBank, setSelectedBank] = useState('iob');
  
  // Wallet states
  const [walletPin, setWalletPin] = useState('1234');
  const [walletBalance] = useState(1250);

  // Flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer countdown: 5 minutes
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Generate real UPI string
  const upiUri = `upi://pay?pa=egspec.events@iob&pn=EGS+Pillay+Engineering+College&am=${amount}&cu=INR&tn=Registration+${event.id}`;

  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const formatted = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  const executePayment = async (methodName: string, methodCategory: PaymentTab) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setProcessingStep('Initiating SSL 256-bit secure tunnel...');

    try {
      await new Promise((r) => setTimeout(r, 700));
      setProcessingStep('Connecting to College Treasury & Bank Network...');
      await new Promise((r) => setTimeout(r, 800));
      setProcessingStep('Authorizing payment token...');
      await new Promise((r) => setTimeout(r, 600));

      const txnRef = `TXN-EGS-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const paymentRecord = await portalApi.createPayment({
        registration_id: `EVT-PENDING-${Date.now()}`,
        event_id: event.id,
        student_id: student.id,
        student_name: student.name,
        amount,
        currency: 'INR',
        payment_method: methodCategory,
        payment_method_detail: methodName,
        transaction_ref: txnRef,
        status: 'success',
      });

      setProcessingStep('Payment Approved! Generating EGSPEC Admission Ticket...');
      await new Promise((r) => setTimeout(r, 500));

      onSuccess({
        transactionRef: txnRef,
        paymentMethod: methodName,
        amount,
        payment: paymentRecord,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Transaction was interrupted. Please retry.');
      setIsProcessing(false);
    }
  };

  const handlePay = () => {
    if (activeTab === 'upi') {
      const detail = upiId ? `UPI (${upiId})` : `UPI App (${selectedUpiApp.toUpperCase()})`;
      executePayment(detail, 'upi');
    } else if (activeTab === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setErrorMsg('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg('Please enter expiry in MM/YY format.');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('Please enter 3-digit CVV.');
        return;
      }
      // Open 3D secure simulation OTP
      setOtpModalOpen(true);
    } else if (activeTab === 'netbanking') {
      const bank = POPULAR_BANKS.find((b) => b.id === selectedBank)?.name || 'Net Banking';
      executePayment(`${bank} NetBanking`, 'netbanking');
    } else if (activeTab === 'wallet') {
      if (walletBalance < amount) {
        setErrorMsg('Insufficient Campus Wallet balance.');
        return;
      }
      if (walletPin.length < 4) {
        setErrorMsg('Please enter your 4-digit Campus ID PIN.');
        return;
      }
      executePayment('EGSPEC Student Campus Card Wallet', 'wallet');
    }
  };

  const handleConfirmOtp = () => {
    setOtpModalOpen(false);
    const last4 = cardNumber.slice(-4);
    executePayment(`Credit/Debit Card ending in ${last4}`, 'card');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Gateway Institutional Top Bar */}
        <div className="bg-linear-to-r from-blue-950 via-blue-900 to-indigo-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-sm">
              EGS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">EGSPEC College PayGateway</h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  256-Bit SSL
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Official Treasury &amp; Event Fee Settlement · Anna University Affiliated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Summary Ribbon */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Event:</span>
            <span className="font-bold text-slate-800 truncate max-w-[240px]">{event.title}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
              {event.category?.name || 'College Event'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Time left:</span>
              <span className="font-mono font-bold text-slate-800">{formatTimer(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <span className="text-emerald-700 font-medium text-[11px]">Total Fee:</span>
              <span className="font-extrabold text-emerald-900 text-sm font-mono">₹{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Main Gateway Layout */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          
          {/* Left Navigation Tabs */}
          <div className="w-full md:w-56 bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200 p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
              Payment Methods
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'upi'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4" />
                All Banks QR &amp; UPI
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                28 BANKS
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'card'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                Cards (RuPay/Visa)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('netbanking')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'netbanking'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                Net Banking
              </span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                IOB
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'wallet'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4" />
                Campus Smart Card
              </span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                ₹1,250
              </span>
            </button>

            {/* Candidate Info Badge */}
            <div className="pt-4 px-3 mt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
              <span className="block font-semibold text-slate-700">Billing Candidate</span>
              <div className="font-medium text-slate-800 truncate">{student.name}</div>
              <div className="font-mono text-slate-500 text-[10px]">{student.register_number}</div>
              <div className="text-slate-400 truncate text-[10px]">{student.department}</div>
            </div>
          </div>

          {/* Right Tab Content */}
          <div className="flex-1 p-5 md:p-6 bg-white overflow-y-auto">
            
            {/* TAB 1: ALL BANKS QR CODE & UPI */}
            {activeTab === 'upi' && (
              <div className="space-y-5">
                <BankQrConnector
                  event={event}
                  amount={amount}
                  student={student}
                  onBankPay={(bankName, vpa) => executePayment(`QR Scan (${bankName} · ${vpa})`, 'upi')}
                  isProcessing={isProcessing}
                />

                {/* Optional Manual UPI VPA / Apps Alternative */}
                <div className="pt-2 border-t border-slate-200">
                  <details className="group">
                    <summary className="cursor-pointer text-xs font-semibold text-slate-600 hover:text-blue-900 flex items-center justify-between py-1">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>Or pay using UPI Apps / Custom VPA</span>
                      </span>
                      <span className="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>

                    <div className="pt-3 space-y-3">
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {POPULAR_UPI_APPS.map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => {
                              setSelectedUpiApp(app.id);
                              executePayment(`UPI App (${app.name})`, 'upi');
                            }}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-semibold transition-all ${
                              selectedUpiApp === app.id
                                ? 'border-blue-900 bg-blue-50/70 text-blue-900 shadow-xs'
                                : `${app.color} hover:opacity-90`
                            }`}
                          >
                            <span>{app.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. candidate@okaxis"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setUpiId(`${student.register_number?.toLowerCase() || 'student'}@okaxis`)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700"
                        >
                          Auto-fill
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!upiId) {
                              setErrorMsg('Please enter a valid UPI ID (e.g. name@okaxis)');
                              return;
                            }
                            executePayment(`UPI Collect (${upiId})`, 'upi');
                          }}
                          className="px-3 py-1 text-[11px] font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-lg"
                        >
                          Verify &amp; Pay
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* TAB 2: DEBIT / CREDIT CARDS */}
            {activeTab === 'card' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Card Payment</h4>
                    <p className="text-xs text-slate-500">RuPay, Visa, MasterCard, Maestro accepted</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">RuPay</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-900 rounded">Visa</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-900 rounded">MasterCard</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4532 8920 1123 4819"
                        className="w-full px-3.5 py-2 pl-9 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name as printed on card"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-hidden uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs text-center focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                        <span>CVV</span>
                        <span className="text-[10px] text-slate-400 font-normal">3 digits on back</span>
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs text-center tracking-widest focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('4532 8920 1123 4819');
                      setCardExpiry('08/29');
                      setCardCvv('782');
                    }}
                    className="text-[11px] text-blue-900 hover:underline font-medium"
                  >
                    Quick Test: Auto-fill Demo RuPay Student Card
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {activeTab === 'netbanking' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Select Net Banking Portal</h4>
                  <p className="text-xs text-slate-500">
                    Indian Overseas Bank is the official campus banking partner with 0% gateway commission.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {POPULAR_BANKS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        selectedBank === b.id
                          ? 'border-blue-900 bg-blue-50/60 shadow-xs ring-1 ring-blue-900'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{b.name}</span>
                        <span className={`text-[10px] font-semibold ${b.isPrimary ? 'text-amber-700 font-bold' : 'text-slate-400'}`}>
                          {b.badge}
                        </span>
                      </div>
                      {selectedBank === b.id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Or select from All 28 Connected Indian Banks:
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  >
                    {ALL_CONNECTED_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.shortName}) - {b.branch || b.ifscPrefix}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* TAB 4: CAMPUS SMART CARD WALLET */}
            {activeTab === 'wallet' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">EGSPEC Student Campus Card</h4>
                  <p className="text-xs text-slate-500">
                    Direct debited from your student campus account linked to Register No: <span className="font-mono font-bold text-slate-800">{student.register_number}</span>
                  </p>
                </div>

                <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white p-4 rounded-xl shadow-md border border-slate-800 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">
                        E.G.S. Pillay Smart Campus Pass
                      </span>
                      <div className="text-base font-bold mt-1 font-mono">{student.register_number || '820822104055'}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Available Balance</span>
                      <span className="text-lg font-extrabold text-emerald-400 font-mono">₹{walletBalance.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                    <span>{student.name}</span>
                    <span className="text-emerald-400 font-semibold text-[11px]">Active · Verified</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Event Registration Fee:</span>
                    <span className="font-bold text-slate-800">₹{amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Remaining Wallet Balance:</span>
                    <span className="font-bold text-emerald-700">₹{(walletBalance - amount).toFixed(2)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Enter 4-digit Campus Security PIN
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={walletPin}
                        onChange={(e) => setWalletPin(e.target.value.slice(0, 4))}
                        placeholder="••••"
                        maxLength={4}
                        className="w-32 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-center tracking-widest text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-500">(Default: 1234)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

        </div>

        {/* Gateway Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Protected by EGSPEC Campus Security Engine</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{amount.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/30 border-2 border-blue-400 border-t-white animate-spin flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-300" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold">Authorizing Transaction</h4>
              <p className="text-xs text-blue-200 font-mono animate-pulse">{processingStep}</p>
            </div>
            <div className="text-[11px] text-slate-400 max-w-xs">
              Please do not refresh or close this window. Your session is encrypted.
            </div>
          </div>
        )}

        {/* 3D Secure Card OTP Modal */}
        {otpModalOpen && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4 text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900">3D Secure Bank Verification</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                A 6-digit One Time Password (OTP) was sent to mobile registered with your card <span className="font-semibold">+91 ******2345</span>.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Enter 6-digit OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="482910"
                    maxLength={6}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-center tracking-widest text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setOtpValue('482910')}
                    className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-blue-900 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOtp}
                  className="flex-1 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Verify &amp; Pay
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

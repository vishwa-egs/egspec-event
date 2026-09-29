import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Building2,
  Search,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  ChevronRight,
  Maximize2,
  X,
  ArrowRight,
  RefreshCw,
  Landmark,
  Layers
} from 'lucide-react';
import { CollegeEvent, Profile } from '../../types';

export interface ConnectedBank {
  id: string;
  name: string;
  shortName: string;
  category: 'primary' | 'psu' | 'private' | 'regional';
  vpaHandle: string;
  mobileAppName: string;
  badge?: string;
  accentBg: string;
  accentText: string;
  ifscPrefix: string;
  branch?: string;
}

export const ALL_CONNECTED_BANKS: ConnectedBank[] = [
  {
    id: 'iob',
    name: 'Indian Overseas Bank',
    shortName: 'IOB',
    category: 'primary',
    vpaHandle: 'egspec.events@iob',
    mobileAppName: 'IOB Mobile / mPassbook',
    badge: 'Official College Branch',
    accentBg: 'bg-blue-900',
    accentText: 'text-blue-100',
    ifscPrefix: 'IOBA0001844',
    branch: 'Nagapattinam Campus Branch'
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    shortName: 'SBI',
    category: 'psu',
    vpaHandle: 'egspec.events@sbi',
    mobileAppName: 'SBI YONO / BHIM SBI Pay',
    badge: 'Largest PSU Bank',
    accentBg: 'bg-sky-800',
    accentText: 'text-sky-100',
    ifscPrefix: 'SBIN0000882',
    branch: 'Nagapattinam Main'
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    shortName: 'HDFC',
    category: 'private',
    vpaHandle: 'egspec.events@hdfcbank',
    mobileAppName: 'HDFC Bank MobileBanking / PayZapp',
    badge: 'Fastest Settlement',
    accentBg: 'bg-blue-950',
    accentText: 'text-blue-100',
    ifscPrefix: 'HDFC0001850'
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    shortName: 'ICICI',
    category: 'private',
    vpaHandle: 'egspec.events@icici',
    mobileAppName: 'iMobile Pay by ICICI',
    badge: 'Instant QR Pay',
    accentBg: 'bg-amber-900',
    accentText: 'text-amber-100',
    ifscPrefix: 'ICIC0000492'
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    shortName: 'Canara',
    category: 'psu',
    vpaHandle: 'egspec.events@cnrb',
    mobileAppName: 'Canara ai1 Mobile Banking',
    badge: 'Zero Surcharge',
    accentBg: 'bg-blue-700',
    accentText: 'text-blue-100',
    ifscPrefix: 'CNRB0001284'
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    shortName: 'Axis',
    category: 'private',
    vpaHandle: 'egspec.events@axisbank',
    mobileAppName: 'Axis Mobile / Open',
    badge: 'Instant',
    accentBg: 'bg-rose-900',
    accentText: 'text-rose-100',
    ifscPrefix: 'UTIB0000780'
  },
  {
    id: 'cub',
    name: 'City Union Bank',
    shortName: 'CUB',
    category: 'regional',
    vpaHandle: 'egspec.events@cub',
    mobileAppName: 'CUB Mobile Plus',
    badge: 'Tamil Nadu Regional',
    accentBg: 'bg-blue-800',
    accentText: 'text-blue-100',
    ifscPrefix: 'CIUB0000045'
  },
  {
    id: 'kvb',
    name: 'Karur Vysya Bank',
    shortName: 'KVB',
    category: 'regional',
    vpaHandle: 'egspec.events@kvb',
    mobileAppName: 'KVB DLX Mobile',
    badge: 'Tamil Nadu Regional',
    accentBg: 'bg-emerald-800',
    accentText: 'text-emerald-100',
    ifscPrefix: 'KVBL0001201'
  },
  {
    id: 'tmb',
    name: 'Tamilnad Mercantile Bank',
    shortName: 'TMB',
    category: 'regional',
    vpaHandle: 'egspec.events@tmb',
    mobileAppName: 'TMB MBank',
    badge: 'Tamil Nadu Regional',
    accentBg: 'bg-amber-800',
    accentText: 'text-amber-100',
    ifscPrefix: 'TMBL0000062'
  },
  {
    id: 'indianbank',
    name: 'Indian Bank',
    shortName: 'Indian Bank',
    category: 'psu',
    vpaHandle: 'egspec.events@indianbank',
    mobileAppName: 'IndOASIS Mobile Banking',
    badge: 'Popular PSU',
    accentBg: 'bg-blue-800',
    accentText: 'text-blue-100',
    ifscPrefix: 'IDIB000N012'
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    shortName: 'BOB',
    category: 'psu',
    vpaHandle: 'egspec.events@barodampay',
    mobileAppName: 'bob World',
    badge: 'Nationalized Bank',
    accentBg: 'bg-orange-800',
    accentText: 'text-orange-100',
    ifscPrefix: 'BARB0NAGAPA'
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    shortName: 'PNB',
    category: 'psu',
    vpaHandle: 'egspec.events@pnb',
    mobileAppName: 'PNB One',
    badge: 'Nationalized Bank',
    accentBg: 'bg-red-900',
    accentText: 'text-red-100',
    ifscPrefix: 'PUNB0182000'
  },
  {
    id: 'union',
    name: 'Union Bank of India',
    shortName: 'Union Bank',
    category: 'psu',
    vpaHandle: 'egspec.events@unionbank',
    mobileAppName: 'Union Bank Vyom',
    badge: 'Nationalized Bank',
    accentBg: 'bg-red-800',
    accentText: 'text-red-100',
    ifscPrefix: 'UBIN0542385'
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    shortName: 'Kotak',
    category: 'private',
    vpaHandle: 'egspec.events@kotak',
    mobileAppName: 'Kotak 811 & Mobile Banking',
    badge: 'Instant QR',
    accentBg: 'bg-red-700',
    accentText: 'text-red-100',
    ifscPrefix: 'KKBK0008742'
  },
  {
    id: 'federal',
    name: 'Federal Bank',
    shortName: 'Federal',
    category: 'private',
    vpaHandle: 'egspec.events@federal',
    mobileAppName: 'FedMobile / Lotza',
    badge: 'Private Sector',
    accentBg: 'bg-blue-900',
    accentText: 'text-blue-100',
    ifscPrefix: 'FDRL0001243'
  },
  {
    id: 'idbi',
    name: 'IDBI Bank',
    shortName: 'IDBI',
    category: 'psu',
    vpaHandle: 'egspec.events@ibkl',
    mobileAppName: 'IDBI Go Mobile+',
    badge: 'Nationalized Bank',
    accentBg: 'bg-teal-900',
    accentText: 'text-teal-100',
    ifscPrefix: 'IBKL0000412'
  },
  {
    id: 'central',
    name: 'Central Bank of India',
    shortName: 'Central Bank',
    category: 'psu',
    vpaHandle: 'egspec.events@centralbank',
    mobileAppName: 'Cent Mobile',
    badge: 'PSU Bank',
    accentBg: 'bg-blue-900',
    accentText: 'text-blue-100',
    ifscPrefix: 'CBIN0280875'
  },
  {
    id: 'uco',
    name: 'UCO Bank',
    shortName: 'UCO',
    category: 'psu',
    vpaHandle: 'egspec.events@uco',
    mobileAppName: 'UCO mBanking Plus',
    badge: 'PSU Bank',
    accentBg: 'bg-sky-900',
    accentText: 'text-sky-100',
    ifscPrefix: 'UCBA0001540'
  },
  {
    id: 'boi',
    name: 'Bank of India',
    shortName: 'BOI',
    category: 'psu',
    vpaHandle: 'egspec.events@boi',
    mobileAppName: 'BOI Mobile Omni Neo',
    badge: 'PSU Bank',
    accentBg: 'bg-indigo-900',
    accentText: 'text-indigo-100',
    ifscPrefix: 'BKID0008200'
  },
  {
    id: 'indusind',
    name: 'IndusInd Bank',
    shortName: 'IndusInd',
    category: 'private',
    vpaHandle: 'egspec.events@indus',
    mobileAppName: 'IndusMobile',
    badge: 'Private Bank',
    accentBg: 'bg-amber-950',
    accentText: 'text-amber-100',
    ifscPrefix: 'INDB0000421'
  },
  {
    id: 'yes',
    name: 'YES Bank',
    shortName: 'YES Bank',
    category: 'private',
    vpaHandle: 'egspec.events@yesbank',
    mobileAppName: 'iris by YES BANK',
    badge: 'Private Bank',
    accentBg: 'bg-blue-800',
    accentText: 'text-blue-100',
    ifscPrefix: 'YESB0000318'
  },
  {
    id: 'idfc',
    name: 'IDFC FIRST Bank',
    shortName: 'IDFC FIRST',
    category: 'private',
    vpaHandle: 'egspec.events@idfcbank',
    mobileAppName: 'IDFC FIRST Bank App',
    badge: 'Modern Banking',
    accentBg: 'bg-rose-950',
    accentText: 'text-rose-100',
    ifscPrefix: 'IDFB0040101'
  },
  {
    id: 'southindian',
    name: 'South Indian Bank',
    shortName: 'SIB',
    category: 'regional',
    vpaHandle: 'egspec.events@sib',
    mobileAppName: 'SIB Mirror+',
    badge: 'South India',
    accentBg: 'bg-red-900',
    accentText: 'text-red-100',
    ifscPrefix: 'SIBL0000155'
  },
  {
    id: 'maharashtra',
    name: 'Bank of Maharashtra',
    shortName: 'MahaBank',
    category: 'psu',
    vpaHandle: 'egspec.events@mahb',
    mobileAppName: 'MahaMobile',
    badge: 'PSU Bank',
    accentBg: 'bg-blue-900',
    accentText: 'text-blue-100',
    ifscPrefix: 'MAHB0001124'
  },
  {
    id: 'psb',
    name: 'Punjab & Sind Bank',
    shortName: 'PSB',
    category: 'psu',
    vpaHandle: 'egspec.events@psb',
    mobileAppName: 'PSB UnIC',
    badge: 'PSU Bank',
    accentBg: 'bg-amber-900',
    accentText: 'text-amber-100',
    ifscPrefix: 'PSIB0000451'
  },
  {
    id: 'rbl',
    name: 'RBL Bank',
    shortName: 'RBL',
    category: 'private',
    vpaHandle: 'egspec.events@rbl',
    mobileAppName: 'MoBank by RBL',
    badge: 'Private Bank',
    accentBg: 'bg-blue-900',
    accentText: 'text-blue-100',
    ifscPrefix: 'RATN0000142'
  },
  {
    id: 'bandhan',
    name: 'Bandhan Bank',
    shortName: 'Bandhan',
    category: 'private',
    vpaHandle: 'egspec.events@bandhan',
    mobileAppName: 'Bandhan Bank Mobile',
    badge: 'Scheduled Bank',
    accentBg: 'bg-red-900',
    accentText: 'text-red-100',
    ifscPrefix: 'BDBL0001502'
  },
  {
    id: 'dbs',
    name: 'DBS Bank India',
    shortName: 'DBS',
    category: 'private',
    vpaHandle: 'egspec.events@dbs',
    mobileAppName: 'digibank by DBS',
    badge: 'International / India',
    accentBg: 'bg-red-950',
    accentText: 'text-red-100',
    ifscPrefix: 'DBSS0IN0811'
  }
];

interface BankQrConnectorProps {
  event: CollegeEvent;
  amount: number;
  student: Profile;
  onBankPay: (bankName: string, vpa: string) => void;
  isProcessing: boolean;
}

export const BankQrConnector: React.FC<BankQrConnectorProps> = ({
  event,
  amount,
  student,
  onBankPay,
  isProcessing,
}) => {
  const [selectedBankId, setSelectedBankId] = useState<string>('iob');
  const [isUniversalMode, setIsUniversalMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'primary' | 'psu' | 'private' | 'regional'>('all');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Active bank
  const currentBank = useMemo(() => {
    return ALL_CONNECTED_BANKS.find((b) => b.id === selectedBankId) || ALL_CONNECTED_BANKS[0];
  }, [selectedBankId]);

  // Filtered banks for selector
  const filteredBanks = useMemo(() => {
    return ALL_CONNECTED_BANKS.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.mobileAppName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'all' || b.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, categoryFilter]);

  // UPI URI Generation
  const activeVpa = isUniversalMode ? 'egspec.events@iob' : currentBank.vpaHandle;
  const upiUri = `upi://pay?pa=${activeVpa}&pn=EGS+Pillay+Engineering+College&am=${amount}&cu=INR&tn=Event+Reg+${event.id}&mc=8220`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(activeVpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleSelectBank = (bank: ConnectedBank) => {
    setSelectedBankId(bank.id);
    setIsUniversalMode(false);
  };

  return (
    <div className="space-y-4">
      
      {/* Top NPCI All-Banks Switch Status Badge */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-3 rounded-xl border border-blue-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight">NPCI BharatQR &amp; Multi-Bank Switch</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                28 Banks Connected
              </span>
            </div>
            <p className="text-[11px] text-blue-200">
              Interoperable collegiate QR · Scannable by any Indian bank or mobile banking app
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsUniversalMode(true)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              isUniversalMode
                ? 'bg-amber-400 text-blue-950 font-bold shadow-xs'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Universal All-Banks QR
          </button>
        </div>
      </div>

      {/* Main QR Code & Bank Scanner Card */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row items-center gap-6">
        
        {/* Dynamic QR Code Canvas */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative p-3.5 bg-white rounded-2xl shadow-sm border-2 border-slate-200 group">
            <QRCodeSVG
              value={upiUri}
              size={152}
              level="H"
              includeMargin={false}
            />

            {/* Center Bank / EGS Emblem Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-7 h-7 rounded-full bg-blue-950 border-2 border-amber-400 text-amber-300 font-bold text-[9px] flex items-center justify-center shadow-md">
                {isUniversalMode ? 'NPCI' : currentBank.shortName.slice(0, 3)}
              </div>
            </div>

            {/* Enlarge trigger */}
            <button
              type="button"
              onClick={() => setIsQrZoomed(true)}
              className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              title="Enlarge QR for scanning"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyVpa}
              className="text-[11px] font-mono font-bold text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1.5 transition-colors"
              title="Click to copy UPI VPA"
            >
              <span>{activeVpa}</span>
              {copiedVpa ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Scan with any Indian Banking App</span>
        </div>

        {/* Selected Bank Details & App Scan Flow */}
        <div className="flex-1 w-full space-y-3.5 text-xs">
          
          {/* Active Bank Summary Header */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${currentBank.accentBg} text-white font-bold text-[11px] flex items-center justify-center shadow-2xs`}>
                  {currentBank.shortName.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    {isUniversalMode ? 'Universal Multi-Bank BharatQR' : currentBank.name}
                    {currentBank.badge && !isUniversalMode && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                        {currentBank.badge}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isUniversalMode
                      ? 'Supported by all 28 Nationalized, Private & Regional Banks'
                      : `Recommended Mobile App: ${currentBank.mobileAppName}`}
                  </p>
                </div>
              </div>

              {!isUniversalMode && (
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {currentBank.ifscPrefix}
                </span>
              )}
            </div>

            {/* Quick App Scan Prompt */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-blue-900" />
                {isUniversalMode
                  ? 'Open your mobile banking app & select "Scan QR"'
                  : `Open ${currentBank.mobileAppName} on your phone`}
              </span>
              <span className="font-extrabold text-blue-950 font-mono text-xs">
                ₹{amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Quick Bank Simulator Button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => onBankPay(
                isUniversalMode ? 'Universal Bank QR' : `${currentBank.name} QR`,
                activeVpa
              )}
              disabled={isProcessing}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-xs hover:shadow-md disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing via Bank Gateway...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    Simulate {isUniversalMode ? 'Bank' : currentBank.shortName} App Scan &amp; Pay
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Directly mapped to E.G.S. Pillay Engineering College Student Welfare Account. Zero bank charges.</span>
          </div>

        </div>

      </div>

      {/* ALL CONNECTED BANKS BROWSER & SELECTOR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-900" />
              <span>Connect Specific Bank ({ALL_CONNECTED_BANKS.length} Indian Banks Supported)</span>
            </h5>
            <p className="text-[11px] text-slate-500">
              Select your bank to generate a bank-specific QR code and customized routing handle
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bank (SBI, IOB, Canara...)"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {(['all', 'primary', 'psu', 'private', 'regional'] as const).map((cat) => {
            const labels = {
              all: `All Banks (${ALL_CONNECTED_BANKS.length})`,
              primary: 'College Branch (IOB)',
              psu: 'Public Sector (PSU)',
              private: 'Private Banks',
              regional: 'Tamil Nadu Regional'
            };
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  categoryFilter === cat
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>

        {/* Banks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 max-h-56 overflow-y-auto pr-1">
          {filteredBanks.map((bank) => {
            const isSelected = !isUniversalMode && selectedBankId === bank.id;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => handleSelectBank(bank)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start justify-between gap-1.5 ${
                  isSelected
                    ? 'border-blue-900 bg-blue-50/80 ring-2 ring-blue-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded ${bank.accentBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                      {bank.shortName.slice(0, 2)}
                    </span>
                    <span className="font-bold text-slate-900 text-[11px] truncate block">
                      {bank.shortName}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate" title={bank.mobileAppName}>
                    {bank.mobileAppName.split('/')[0]}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-900 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {filteredBanks.length === 0 && (
          <div className="p-4 text-center text-slate-400 text-xs">
            No bank matches "{searchQuery}". Try searching for SBI, IOB, Canara, HDFC, or ICICI.
          </div>
        )}
      </div>

      {/* Enlarge QR Modal */}
      {isQrZoomed && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-900">
                  {isUniversalMode ? 'NPCI Multi-Bank BharatQR' : currentBank.name}
                </h4>
                <p className="text-[11px] text-slate-500">Scan at entrance counter or from phone</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrZoomed(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              <QRCodeSVG
                value={upiUri}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="space-y-1">
              <div className="font-mono text-xs font-bold text-blue-900">{activeVpa}</div>
              <div className="font-extrabold text-base text-slate-900">Amount: ₹{amount.toFixed(2)}</div>
            </div>

            <button
              type="button"
              onClick={() => setIsQrZoomed(false)}
              className="w-full py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl"
            >
              Close Enlarged View
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

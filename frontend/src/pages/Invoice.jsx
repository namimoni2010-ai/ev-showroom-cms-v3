import React, { useState, useEffect, useRef } from 'react';
import {
  searchCustomers, getSpares,
  getVehicleByChassis, searchVehicles,
  saveInvoice, getNextInvoiceNumber
} from '../api';

// ── Company defaults ──────────────────────────────────
const COMPANY_DEFAULTS = {
  companyName: 'Palani Andavar E-Motors',
  companyAddress: '4/58E, Attur Main Road, Kothampadi, Attur, Salem - 636109',
  companyPhone: '9626176768',
  companyEmail: 'palaniemotors@gmail.com',
  companyGST: '33DZYPK8024G1ZY'
};

const emptySpare = () => ({ description: '', qty: 1, unitPrice: '' });
const emptyOther = () => ({ description: '', amount: '' });

export default function Invoice() {
  const printRef = useRef(null);

  const [invoiceType, setInvoiceType] = useState('Service Bill');
  const [saveMsg, setSaveMsg] = useState('');
  const [saveMsgType, setSaveMsgType] = useState('success');
  const [saving, setSaving] = useState(false);

  // Customer search
  const [custQuery, setCustQuery] = useState('');
  const [custSuggestions, setCustSuggestions] = useState([]);
  const [custSearching, setCustSearching] = useState(false);
  const [showCustDrop, setShowCustDrop] = useState(false);

  // Chassis search
  const [chassisQuery, setChassisQuery] = useState('');
  const [chassisSuggestions, setChassisSuggestions] = useState([]);
  const [chassisSearching, setChassisSearching] = useState(false);
  const [showChassisDrop, setShowChassisDrop] = useState(false);
  const [chassisError, setChassisError] = useState('');

  // Spare search
  const [spareSearch, setSpareSearch] = useState({});
  const [spareSuggestions, setSpareSuggestions] = useState({});
  const [showSpareDrop, setShowSpareDrop] = useState({});
  const [allSpares, setAllSpares] = useState([]);
  const [sparesLoaded, setSparesLoaded] = useState(false);

  const [form, setForm] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
    vehicleModel: '', chassisNo: '', motorNo: '', controllerNo: '',
    chargerNo: '', batteryNo: '', vehicleColor: '', vehicleType: '',
    serviceDescription: '',
    serviceDate: new Date().toISOString().split('T')[0],
    kmRun: '',
    labourCost: '', discount: '', gstPercent: '', paidAmount: '',
    paymentMode: 'Cash', notes: '',
    vehiclePrice: '',
    ...COMPANY_DEFAULTS
  });

  const [spareRows, setSpareRows] = useState([emptySpare()]);
  const [otherRows, setOtherRows] = useState([emptyOther()]);

  // Auto-generate invoice number when type changes
  useEffect(() => {
    const fetchNo = async () => {
      try {
        const { data } = await getNextInvoiceNumber(invoiceType);
        setForm(prev => ({ ...prev, invoiceNo: data.invoiceNo }));
      } catch {
        const prefix = invoiceType === 'Sales Bill' ? 'SB' : 'SV';
        setForm(prev => ({ ...prev, invoiceNo: `${prefix}-${Date.now().toString().slice(-4)}` }));
      }
    };
    fetchNo();
  }, [invoiceType]);

  const loadSpares = async () => {
    if (sparesLoaded) return;
    try { const { data } = await getSpares(); setAllSpares(data); setSparesLoaded(true); } catch {}
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Customer search
  const handleCustSearch = async (val) => {
    setCustQuery(val);
    setForm(prev => ({ ...prev, customerName: val }));
    if (!val.trim()) { setCustSuggestions([]); setShowCustDrop(false); return; }
    setCustSearching(true);
    try { const { data } = await searchCustomers(val); setCustSuggestions(data); setShowCustDrop(true); }
    catch { setCustSuggestions([]); }
    setCustSearching(false);
  };

  const handleCustSelect = (c) => {
    setCustQuery(c.name);
    setShowCustDrop(false);
    setForm(prev => ({
      ...prev,
      customerName: c.name,
      customerPhone: c.phone || '',
      customerEmail: c.email || '',
      customerAddress: c.address || ''
    }));
  };

  // Chassis search
  const handleChassisSearch = async (val) => {
    setChassisQuery(val);
    setForm(prev => ({ ...prev, chassisNo: val }));
    setChassisError('');
    if (!val.trim()) { setChassisSuggestions([]); setShowChassisDrop(false); return; }
    setChassisSearching(true);
    try {
      const { data } = await searchVehicles(val);
      const available = data.filter(v => v.stockStatus === 'Available');
      setChassisSuggestions(available);
      setShowChassisDrop(available.length > 0);
    } catch { setChassisSuggestions([]); }
    setChassisSearching(false);
  };

  const applyVehicle = (vehicle) => {
    setChassisQuery(vehicle.chassisNo || '');
    setShowChassisDrop(false);
    setChassisError('');
    setForm(prev => ({
      ...prev,
      chassisNo: vehicle.chassisNo || '',
      vehicleModel: vehicle.vehicleModel || '',
      motorNo: vehicle.motorNo || '',
      controllerNo: vehicle.controllerNo || '',
      chargerNo: vehicle.chargerNo || '',
      batteryNo: vehicle.batteryNo || '',
      vehicleColor: vehicle.vehicleColor || '',
      vehiclePrice: vehicle.price || ''
    }));
  };

  const handleChassisLookup = async () => {
    if (!chassisQuery.trim()) return;
    setChassisSearching(true);
    setChassisError('');
    try {
      const { data } = await getVehicleByChassis(chassisQuery);
      applyVehicle(data);
    } catch (err) {
      setChassisError(err.response?.data?.message || 'Vehicle not found for this chassis number.');
    }
    setChassisSearching(false);
  };

  // Spare search
  const handleSpareSearch = (idx, val) => {
    setSpareSearch(prev => ({ ...prev, [idx]: val }));
    setSpareRows(rows => rows.map((r, i) => i === idx ? { ...r, description: val } : r));
    if (!val.trim()) {
      setSpareSuggestions(prev => ({ ...prev, [idx]: [] }));
      setShowSpareDrop(prev => ({ ...prev, [idx]: false }));
      return;
    }
    const filtered = allSpares.filter(s =>
      s.spareName.toLowerCase().includes(val.toLowerCase())
    );
    setSpareSuggestions(prev => ({ ...prev, [idx]: filtered }));
    setShowSpareDrop(prev => ({ ...prev, [idx]: filtered.length > 0 }));
  };

  const handleSpareSelect = (idx, spare) => {
    setSpareRows(rows => rows.map((r, i) => i === idx
      ? { ...r, description: spare.spareName, unitPrice: spare.sellingPrice || '' }
      : r
    ));
    setSpareSearch(prev => ({ ...prev, [idx]: spare.spareName }));
    setShowSpareDrop(prev => ({ ...prev, [idx]: false }));
  };

  const handleSpareRowChange = (idx, field, val) =>
    setSpareRows(spareRows.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  const handleOtherChange = (idx, field, val) =>
    setOtherRows(otherRows.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  // ── Calculations ──────────────────────────────────
  const vehiclePrice = parseFloat(form.vehiclePrice) || 0;
  const sparesTotal = spareRows.reduce((s, r) =>
    s + (parseFloat(r.unitPrice) || 0) * (parseFloat(r.qty) || 1), 0);
  const labourTotal = parseFloat(form.labourCost) || 0;
  const otherTotal = otherRows.reduce((s, r) =>
    s + (parseFloat(r.amount) || 0), 0);
  const grossTotal = invoiceType === 'Sales Bill'
    ? vehiclePrice
    : sparesTotal + labourTotal + otherTotal;
  const discount = parseFloat(form.discount) || 0;
  const afterDiscount = Math.max(0, grossTotal - discount);
  const gstPercent = parseFloat(form.gstPercent) || 0;
  const gstAmount = (afterDiscount * gstPercent) / 100;
  const totalBill = afterDiscount + gstAmount;
  const paidAmount = parseFloat(form.paidAmount) || 0;
  const balanceDue = Math.max(0, totalBill - paidAmount);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => {
    try { return d ? new Date(d).toLocaleDateString('en-IN') : '—'; } catch { return '—'; }
  };

  const validSpares = spareRows.filter(r => r.description?.trim());
  const validOthers = otherRows.filter(r => r.description?.trim());

  // ── Save ──────────────────────────────────────────
  const handleSave = async () => {
    if (!form.customerName.trim()) {
      setSaveMsg('⚠ Please enter customer name before saving');
      setSaveMsgType('warn');
      setTimeout(() => setSaveMsg(''), 3000);
      return;
    }
    setSaving(true);
    try {
      await saveInvoice({
        invoiceType,
        invoiceNo: form.invoiceNo,
        invoiceDate: form.invoiceDate,
        ...COMPANY_DEFAULTS,
        companyName: form.companyName,
        companyAddress: form.companyAddress,
        companyPhone: form.companyPhone,
        companyEmail: form.companyEmail,
        companyGST: form.companyGST,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        customerAddress: form.customerAddress,
        vehicleModel: form.vehicleModel,
        chassisNo: form.chassisNo,
        motorNo: form.motorNo,
        controllerNo: form.controllerNo,
        chargerNo: form.chargerNo,
        batteryNo: form.batteryNo,
        vehicleColor: form.vehicleColor,
        vehicleType: form.vehicleType,
        serviceDescription: form.serviceDescription,
        serviceDate: form.serviceDate,
        kmRun: form.kmRun,
        spareItems: validSpares,
        labourCost: labourTotal,
        otherCharges: validOthers,
        sparesTotal, labourTotal, otherTotal,
        grossTotal, discount, gstPercent, gstAmount,
        totalBill, paidAmount, balanceDue,
        paymentMode: form.paymentMode,
        notes: form.notes
      });
      setSaveMsg(`✅ ${form.invoiceNo} saved to Invoice History!`);
      setSaveMsgType('success');
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.message || 'Save failed'));
      setSaveMsgType('error');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 5000);
  };

  const handlePrint = () => window.print();

  return (
    <div>
      {/* Top Bar */}
      <div className="no-print flex items-center justify-between mb-5">
        <div>
          <h1 className="page-title">Invoice Generator</h1>
          <p className="text-slate-400 text-sm">
            Sales Bill · Service Bill · Auto invoice number · Print ready
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="btn-secondary text-base px-5 py-2.5">
            {saving ? '⏳ Saving...' : '💾 Save Invoice'}
          </button>
          <button onClick={handlePrint} className="btn-primary text-base px-5 py-2.5">
            🖨️ Print Invoice
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMsg && (
        <div className={`no-print mb-4 px-4 py-3 rounded-lg text-sm border ${
          saveMsgType === 'success'
            ? 'bg-emerald-900/30 border-emerald-700 text-emerald-400'
            : saveMsgType === 'error'
            ? 'bg-red-900/30 border-red-700 text-red-400'
            : 'bg-amber-900/30 border-amber-700 text-amber-400'
        }`}>{saveMsg}</div>
      )}

      {/* ── INVOICE TYPE ── */}
      <div className="no-print card mb-5">
        <h3 className="text-white font-semibold mb-3">Select Invoice Type</h3>
        <div className="flex gap-4 flex-wrap">
          {['Service Bill', 'Sales Bill'].map(type => (
            <label key={type}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                invoiceType === type
                  ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400'
                  : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500'
              }`}>
              <input type="radio" name="invoiceType" value={type}
                checked={invoiceType === type}
                onChange={() => setInvoiceType(type)}
                className="hidden" />
              <span className="text-2xl">
                {type === 'Service Bill' ? '🔧' : '🚗'}
              </span>
              <div>
                <p className="font-bold">{type}</p>
                <p className="text-xs opacity-70">
                  {type === 'Service Bill'
                    ? 'Spare parts, labour, repairs'
                    : 'Vehicle purchase — auto-fills from stock'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── FORM ── */}
      <div className="no-print space-y-5 mb-6">

        {/* Company + Invoice Info */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="text-white font-semibold mb-4">🏢 Company Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Company Name</label>
                <input name="companyName" value={form.companyName}
                  onChange={handleChange} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="label">Address</label>
                <input name="companyAddress" value={form.companyAddress}
                  onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="companyPhone" value={form.companyPhone}
                  onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="label">GST Number</label>
                <input name="companyGST" value={form.companyGST}
                  onChange={handleChange} className="input-field" />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold mb-4">📋 Invoice Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Invoice Number</label>
                <input name="invoiceNo" value={form.invoiceNo}
                  onChange={handleChange} className="input-field font-mono" />
              </div>
              <div>
                <label className="label">Invoice Date</label>
                <input name="invoiceDate" type="date" value={form.invoiceDate}
                  onChange={handleChange} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="label">Payment Mode</label>
                <select name="paymentMode" value={form.paymentMode}
                  onChange={handleChange} className="input-field">
                  {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">👤 Customer Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <label className="label">Customer Name <span className="text-red-400">*</span></label>
              <input type="text" value={custQuery}
                onChange={(e) => handleCustSearch(e.target.value)}
                placeholder="Search or type customer name..."
                className="input-field" />
              {custSearching && (
                <div className="absolute right-3 top-[38px]">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {showCustDrop && custSuggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 shadow-2xl max-h-40 overflow-y-auto">
                  {custSuggestions.map(c => (
                    <li key={c._id} onClick={() => handleCustSelect(c)}
                      className="px-4 py-2 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0">
                      <p className="text-white text-sm font-medium">{c.name}</p>
                      <p className="text-slate-400 text-xs">{c.phone}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="customerPhone" value={form.customerPhone}
                onChange={handleChange} placeholder="Phone" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input name="customerAddress" value={form.customerAddress}
                onChange={handleChange} placeholder="Customer address" className="input-field" />
            </div>
          </div>
        </div>

        {/* Sales Bill — Vehicle + Chassis auto-fill */}
        {invoiceType === 'Sales Bill' && (
          <div className="card">
            <h3 className="text-white font-semibold mb-4">🚗 Vehicle Details</h3>

            {/* Chassis Lookup */}
            <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-4 mb-4">
              <p className="text-emerald-400 text-sm font-semibold mb-2">
                🔍 Auto-Fill from Stock — Search by Chassis Number
              </p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input type="text" value={chassisQuery}
                    onChange={(e) => handleChassisSearch(e.target.value)}
                    placeholder="Type chassis number..."
                    className="input-field font-mono" />
                  {chassisSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {showChassisDrop && chassisSuggestions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 shadow-2xl max-h-52 overflow-y-auto">
                      {chassisSuggestions.map(v => (
                        <li key={v._id} onClick={() => applyVehicle(v)}
                          className="px-4 py-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0">
                          <p className="text-white text-sm font-semibold">{v.vehicleModel}</p>
                          <p className="text-emerald-400 text-xs font-mono">
                            Chassis: {v.chassisNo}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Motor: {v.motorNo || '—'} ·
                            Battery: {v.batteryNo || '—'} ·
                            {v.vehicleColor && ` Color: ${v.vehicleColor}`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button onClick={handleChassisLookup} disabled={chassisSearching}
                  className="btn-primary px-5 text-sm">
                  🔍 Lookup
                </button>
              </div>
              {chassisError && (
                <p className="text-red-400 text-sm mt-2">❌ {chassisError}</p>
              )}
              {form.chassisNo && !chassisError && (
                <p className="text-emerald-400 text-xs mt-2">
                  ✅ Vehicle details auto-filled from stock database
                </p>
              )}
            </div>

            {/* Vehicle Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Vehicle Model</label>
                <input name="vehicleModel" value={form.vehicleModel}
                  onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="label">Chassis Number</label>
                <input name="chassisNo" value={form.chassisNo}
                  onChange={handleChange} className="input-field font-mono" />
              </div>
              <div>
                <label className="label">Motor Number</label>
                <input name="motorNo" value={form.motorNo}
                  onChange={handleChange} className="input-field font-mono" />
              </div>
              <div>
                <label className="label">Controller Number</label>
                <input name="controllerNo" value={form.controllerNo}
                  onChange={handleChange} className="input-field font-mono" />
              </div>
              <div>
                <label className="label">Charger Number</label>
                <input name="chargerNo" value={form.chargerNo}
                  onChange={handleChange} className="input-field font-mono" />
              </div>
              <div>
                <label className="label">Battery Number</label>
                <input name="batteryNo" value={form.batteryNo}
                  onChange={handleChange} className="input-field font-mono" />
              </div>
              <div>
                <label className="label">Vehicle Color</label>
                <input name="vehicleColor" value={form.vehicleColor}
                  onChange={handleChange} placeholder="Color" className="input-field" />
              </div>
            </div>
          </div>
        )}

        {/* Service Bill — Service Details */}
        {invoiceType === 'Service Bill' && (
          <div className="card">
            <h3 className="text-white font-semibold mb-4">🔧 Service Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Vehicle Model</label>
                <input name="vehicleModel" value={form.vehicleModel}
                  onChange={handleChange} placeholder="Vehicle" className="input-field" />
              </div>
              <div>
                <label className="label">Service Date</label>
                <input name="serviceDate" type="date"
                  value={form.serviceDate}
                  onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="label">KM Run</label>
                <input name="kmRun" value={form.kmRun}
                  onChange={handleChange} placeholder="Odometer" className="input-field" />
              </div>
              <div>
                <label className="label">Chassis Number (optional)</label>
                <input name="chassisNo" value={form.chassisNo}
                  onChange={handleChange} className="input-field font-mono" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Service Description</label>
                <textarea name="serviceDescription" value={form.serviceDescription}
                  onChange={handleChange}
                  placeholder="Describe service work..." rows={2}
                  className="input-field resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* Spare Parts — Service Bill only */}
        {invoiceType === 'Service Bill' && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">⚙️ Spare Parts</h3>
              <button
                onClick={() => {
                  loadSpares();
                  setSpareRows([...spareRows, emptySpare()]);
                }}
                className="text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-800/50 px-3 py-1.5 rounded-lg">
                + Add Row
              </button>
            </div>
            <div className="border border-slate-600 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="text-left px-4 py-2 text-slate-400 text-xs">Spare Part Name</th>
                    <th className="text-left px-4 py-2 text-slate-400 text-xs w-20">Qty</th>
                    <th className="text-left px-4 py-2 text-slate-400 text-xs w-28">Unit Price (₹)</th>
                    <th className="text-right px-4 py-2 text-slate-400 text-xs w-24">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {spareRows.map((row, idx) => (
                    <tr key={idx} className="border-t border-slate-700">
                      <td className="px-3 py-2 relative">
                        <input
                          value={spareSearch[idx] !== undefined
                            ? spareSearch[idx]
                            : row.description}
                          onChange={(e) => {
                            loadSpares();
                            handleSpareSearch(idx, e.target.value);
                          }}
                          onFocus={() => loadSpares()}
                          placeholder="Search spare part..."
                          className="input-field text-xs py-1.5" />
                        {showSpareDrop[idx] && spareSuggestions[idx]?.length > 0 && (
                          <ul className="absolute z-50 left-3 right-3 bg-slate-800 border border-slate-600 rounded-lg mt-1 shadow-2xl max-h-36 overflow-y-auto">
                            {spareSuggestions[idx].map(spare => (
                              <li key={spare._id}
                                onClick={() => handleSpareSelect(idx, spare)}
                                className="px-3 py-2 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0">
                                <p className="text-white text-xs font-medium">{spare.spareName}</p>
                                <p className="text-slate-400 text-xs">
                                  Stock: {spare.quantity} · {fmt(spare.sellingPrice)}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={row.qty} min="1"
                          onChange={(e) => handleSpareRowChange(idx, 'qty', e.target.value)}
                          className="input-field text-xs py-1.5" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={row.unitPrice}
                          onChange={(e) => handleSpareRowChange(idx, 'unitPrice', e.target.value)}
                          placeholder="0" className="input-field text-xs py-1.5" />
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-400 text-xs font-semibold">
                        {fmt((parseFloat(row.qty) || 1) * (parseFloat(row.unitPrice) || 0))}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() => spareRows.length > 1
                            ? setSpareRows(spareRows.filter((_, i) => i !== idx))
                            : setSpareRows([emptySpare()])}
                          className="text-red-400 hover:text-red-300 text-xs w-6 h-6 flex items-center justify-center">
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Labour & Other — Service Bill */}
        {invoiceType === 'Service Bill' && (
          <div className="card">
            <h3 className="text-white font-semibold mb-4">💼 Labour & Other Charges</h3>
            <div className="mb-4">
              <label className="label">Labour Cost (₹)</label>
              <input name="labourCost" type="number" value={form.labourCost}
                onChange={handleChange} placeholder="0" className="input-field max-w-xs" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs font-semibold uppercase">Other Charges</p>
              <button onClick={() => setOtherRows([...otherRows, emptyOther()])}
                className="text-emerald-400 text-xs hover:text-emerald-300">+ Add</button>
            </div>
            <div className="space-y-2">
              {otherRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7">
                    <input value={row.description}
                      onChange={(e) => handleOtherChange(idx, 'description', e.target.value)}
                      placeholder="e.g. Courier, Transport"
                      className="input-field text-sm py-2" />
                  </div>
                  <div className="col-span-4">
                    <input type="number" value={row.amount}
                      onChange={(e) => handleOtherChange(idx, 'amount', e.target.value)}
                      placeholder="0" className="input-field text-sm py-2" />
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => otherRows.length > 1
                        ? setOtherRows(otherRows.filter((_, i) => i !== idx))
                        : setOtherRows([emptyOther()])}
                      className="w-7 h-7 flex items-center justify-center rounded bg-red-900/40 text-red-400 text-xs">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing */}
        <div className="card">
          <h3 className="text-white font-semibold mb-4">💰 Billing Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {invoiceType === 'Sales Bill' && (
              <div>
                <label className="label">Vehicle Price (₹)</label>
                <input name="vehiclePrice" type="number" value={form.vehiclePrice}
                  onChange={handleChange} placeholder="0" className="input-field" />
              </div>
            )}
            <div>
              <label className="label">🏷️ Discount (₹)</label>
              <input name="discount" type="number" value={form.discount}
                onChange={handleChange} placeholder="0" className="input-field" />
            </div>
            <div>
              <label className="label">GST / Tax (%)</label>
              <input name="gstPercent" type="number" value={form.gstPercent}
                onChange={handleChange} placeholder="0" className="input-field" />
            </div>
            <div>
              <label className="label">Amount Paid (₹)</label>
              <input name="paidAmount" type="number" value={form.paidAmount}
                onChange={handleChange} placeholder="0" className="input-field" />
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-slate-700/50 rounded-xl p-4 space-y-1.5 text-sm max-w-sm ml-auto">
            {invoiceType === 'Sales Bill' && (
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Price</span>
                <span>{fmt(vehiclePrice)}</span>
              </div>
            )}
            {invoiceType === 'Service Bill' && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Spares</span>
                  <span>{fmt(sparesTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Labour</span>
                  <span>{fmt(labourTotal)}</span>
                </div>
                {otherTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Other</span>
                    <span>{fmt(otherTotal)}</span>
                  </div>
                )}
              </>
            )}
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Discount</span>
                <span className="text-red-400">- {fmt(discount)}</span>
              </div>
            )}
            {gstPercent > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">GST ({gstPercent}%)</span>
                <span>{fmt(gstAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-600 pt-2">
              <span className="text-emerald-400 font-semibold">Total Bill</span>
              <span className="text-emerald-400 font-bold text-xl">{fmt(totalBill)}</span>
            </div>
            {paidAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Paid</span>
                <span className="text-white">{fmt(paidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-slate-500 pt-2">
              <span className="font-bold"
                style={{ color: balanceDue > 0 ? '#fbbf24' : '#34d399' }}>
                Balance Due
              </span>
              <span className="font-bold text-lg"
                style={{ color: balanceDue > 0 ? '#fbbf24' : '#34d399' }}>
                {fmt(balanceDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <label className="label">Notes / Terms (optional)</label>
          <textarea name="notes" value={form.notes}
            onChange={handleChange} rows={2}
            placeholder="e.g. Thank you for your business."
            className="input-field resize-none" />
        </div>
      </div>

      {/* ══════════════════════════════════════
          PRINTABLE INVOICE
          ══════════════════════════════════════ */}
      <div id="invoice-print" ref={printRef}
        style={{
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#fff',
          color: '#000',
          padding: '24px 32px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>

        {/* Company Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#000' }}>
            {form.companyName}
          </div>
          <div style={{ fontSize: '12px', color: '#444', marginTop: '3px' }}>
            {form.companyAddress}
          </div>
          <div style={{ fontSize: '12px', color: '#444' }}>
            Phone: {form.companyPhone}
            {form.companyGST && ` | GST IN: ${form.companyGST}`}
          </div>
          {/* Invoice Type Title */}
          <div style={{
            fontSize: '26px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '12px',
            marginBottom: '4px',
            letterSpacing: '2px',
            color: '#000',
            textTransform: 'uppercase'
          }}>
            {invoiceType}
          </div>
          <div style={{ fontSize: '12px', color: '#444' }}>
            Invoice No: <strong>{form.invoiceNo}</strong> &nbsp;&nbsp;
            Date: <strong>{fmtDate(form.invoiceDate)}</strong>
          </div>
        </div>

        {/* Customer Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#666', letterSpacing: '1px', marginBottom: '6px' }}>
              CUSTOMER DETAILS
            </div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
              {form.customerName || '—'}
            </div>
            {form.customerAddress && (
              <div style={{ fontSize: '12px', color: '#333', marginBottom: '2px' }}>
                📍 {form.customerAddress}
              </div>
            )}
            {form.customerPhone && (
              <div style={{ fontSize: '12px', color: '#333' }}>
                📞 {form.customerPhone}
              </div>
            )}
          </div>

          {/* Sales Bill — Vehicle Details */}
          {invoiceType === 'Sales Bill' ? (
            <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#666', letterSpacing: '1px', marginBottom: '6px' }}>
                VEHICLE DETAILS
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                {form.vehicleModel || '—'}
              </div>
              {form.vehicleColor && (
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '2px' }}>
                  Color: {form.vehicleColor}
                </div>
              )}
            </div>
          ) : (
            <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#666', letterSpacing: '1px', marginBottom: '6px' }}>
                SERVICE DETAILS
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                {form.vehicleModel || '—'}
              </div>
              {form.serviceDate && (
                <div style={{ fontSize: '12px', color: '#333', marginBottom: '2px' }}>
                  Date: {fmtDate(form.serviceDate)}
                </div>
              )}
              {form.kmRun && (
                <div style={{ fontSize: '12px', color: '#333' }}>
                  KM Run: {form.kmRun}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sales Bill — Vehicle Numbers Table */}
        {invoiceType === 'Sales Bill' && (
          form.chassisNo || form.motorNo || form.controllerNo ||
          form.chargerNo || form.batteryNo
        ) && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>
                  Field
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>
                  Number / Details
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Vehicle Model', value: form.vehicleModel },
                { label: 'Chassis Number', value: form.chassisNo },
                { label: 'Motor Number', value: form.motorNo },
                { label: 'Controller Number', value: form.controllerNo },
                { label: 'Charger Number', value: form.chargerNo },
                { label: 'Battery Number', value: form.batteryNo }
              ].filter(r => r.value).map((row, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ border: '1px solid #ddd', padding: '7px 10px', color: '#555', fontWeight: '600' }}>
                    {row.label}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '7px 10px', fontFamily: 'monospace', fontWeight: '600' }}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Service Description */}
        {invoiceType === 'Service Bill' && form.serviceDescription && (
          <div style={{ border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#3b82f6', letterSpacing: '1px', marginBottom: '4px' }}>
              SERVICE WORK DONE
            </div>
            <div style={{ fontSize: '12px', color: '#1e40af' }}>{form.serviceDescription}</div>
          </div>
        )}

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', pageBreakInside: 'avoid' }}>
          <thead>
            <tr style={{ backgroundColor: '#111', color: '#fff' }}>
              <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700' }}>#</th>
              <th style={{ padding: '9px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '700' }}>Description</th>
              <th style={{ padding: '9px 12px', textAlign: 'center', fontSize: '11px', fontWeight: '700' }}>Qty</th>
              <th style={{ padding: '9px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '700' }}>Unit Price</th>
              <th style={{ padding: '9px 12px', textAlign: 'right', fontSize: '11px', fontWeight: '700' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceType === 'Sales Bill' ? (
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '9px 12px', fontSize: '12px', color: '#666' }}>1</td>
                <td style={{ padding: '9px 12px', fontSize: '12px' }}>
                  {form.vehicleModel || 'Electric Vehicle'}
                  {form.vehicleColor && ` — ${form.vehicleColor}`}
                </td>
                <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'center' }}>1</td>
                <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'right' }}>
                  {fmt(vehiclePrice)}
                </td>
                <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>
                  {fmt(vehiclePrice)}
                </td>
              </tr>
            ) : (
              <>
                {validSpares.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa', pageBreakInside: 'avoid' }}>
                    <td style={{ padding: '9px 12px', fontSize: '12px', color: '#666' }}>{idx + 1}</td>
                    <td style={{ padding: '9px 12px', fontSize: '12px' }}>{row.description}</td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'center' }}>{row.qty}</td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'right' }}>
                      {fmt(row.unitPrice)}
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>
                      {fmt((parseFloat(row.qty) || 1) * (parseFloat(row.unitPrice) || 0))}
                    </td>
                  </tr>
                ))}
                {labourTotal > 0 && (
                  <tr style={{ borderBottom: '1px solid #e5e7eb', pageBreakInside: 'avoid' }}>
                    <td style={{ padding: '9px 12px', fontSize: '12px', color: '#666' }}>
                      {validSpares.length + 1}
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', fontStyle: 'italic' }}>
                      Labour Charges
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'center' }}>1</td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'right' }}>
                      {fmt(labourTotal)}
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>
                      {fmt(labourTotal)}
                    </td>
                  </tr>
                )}
                {validOthers.map((row, idx) => (
                  <tr key={`o${idx}`} style={{ borderBottom: '1px solid #e5e7eb', pageBreakInside: 'avoid' }}>
                    <td style={{ padding: '9px 12px', fontSize: '12px', color: '#666' }}>—</td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', fontStyle: 'italic' }}>
                      {row.description}
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'center' }}>1</td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'right' }}>
                      {fmt(row.amount)}
                    </td>
                    <td style={{ padding: '9px 12px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>
                      {fmt(row.amount)}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', pageBreakInside: 'avoid' }}>
          <div style={{ minWidth: '260px' }}>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                <span style={{ color: '#666' }}>Discount</span>
                <span style={{ color: '#dc2626' }}>- {fmt(discount)}</span>
              </div>
            )}
            {gstPercent > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                <span style={{ color: '#666' }}>GST ({gstPercent}%)</span>
                <span>{fmt(gstAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '17px', fontWeight: 'bold', borderTop: '2px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', margin: '4px 0' }}>
              <span>Total Amount</span>
              <span>{fmt(totalBill)}</span>
            </div>
            {paidAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px' }}>
                <span style={{ color: '#666' }}>Paid ({form.paymentMode})</span>
                <span style={{ color: '#16a34a', fontWeight: '600' }}>{fmt(paidAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '18px', fontWeight: 'bold', borderTop: '2px solid #000', marginTop: '4px' }}>
              <span>Balance Due</span>
              <span style={{ color: balanceDue > 0 ? '#d97706' : '#16a34a' }}>{fmt(balanceDue)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {form.notes && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#666', letterSpacing: '1px', marginBottom: '4px' }}>
              NOTES
            </div>
            <div style={{ fontSize: '12px', color: '#444' }}>{form.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '2px solid #000', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pageBreakInside: 'avoid' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#555' }}>
              Thank you for choosing {form.companyName}
            </div>
            {form.companyPhone && (
              <div style={{ fontSize: '12px', color: '#555' }}>
                Contact: {form.companyPhone}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ height: '46px', borderBottom: '1px solid #999', width: '160px', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '11px', color: '#666' }}>Authorized Signature</div>
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          aside { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden !important; }
          #invoice-print, #invoice-print * { visibility: visible !important; }
          #invoice-print {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important; max-width: 100% !important;
            margin: 0 !important; padding: 20px !important;
            background: white !important; color: black !important;
            box-shadow: none !important; border: none !important;
          }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
          @page { size: A4; margin: 10mm; }
        }
        @media screen {
          #invoice-print {
            border: 1px solid #334155;
            border-radius: 12px;
            margin-top: 16px;
          }
        }
      `}</style>
    </div>
  );
}
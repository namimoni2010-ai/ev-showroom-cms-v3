import React, { useState, useEffect, useCallback } from 'react';
import { getInvoices, deleteInvoice } from '../api';
import { useNavigate } from 'react-router-dom';

const COMPANY = {
  companyName: 'Palani Andavar E-Motors',
  companyAddress: '4/58E, Attur Main Road, Kothampadi, Attur, Salem - 636109',
  companyPhone: '9626176768',
  companyGST: '33DZYPK8024G1ZY'
};

export default function InvoiceHistory() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'All') params.type = activeTab;
      if (search) params.search = search;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const { data } = await getInvoices(params);
      setInvoices(data);
    } catch { setInvoices([]); }
    setLoading(false);
  }, [activeTab, search, fromDate, toDate]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice permanently?')) return;
    try { await deleteInvoice(id); fetchInvoices(); }
    catch { alert('Delete failed'); }
  };

  const handlePrint = (inv) => {
    setPrintInvoice(inv);
    setTimeout(() => window.print(), 400);
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => {
    try { return d ? new Date(d).toLocaleDateString('en-IN') : '—'; } catch { return '—'; }
  };
  const fmtDT = (d) => {
    try { return d ? new Date(d).toLocaleString('en-IN') : '—'; } catch { return '—'; }
  };

  const salesBills = invoices.filter(i => i.invoiceType === 'Sales Bill');
  const serviceBills = invoices.filter(i => i.invoiceType === 'Service Bill');
  const totalBilled = invoices.reduce((s, i) => s + (i.totalBill || 0), 0);

  return (
    <div>
      {/* Top */}
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Invoice History</h1>
          <p className="text-slate-400 text-sm">
            All saved bills · Search · Filter · Reprint anytime
          </p>
        </div>
        <button onClick={() => navigate('/invoice')} className="btn-primary">
          + Create Invoice
        </button>
      </div>

      {/* Summary */}
      <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-slate-400 text-sm">Total Invoices</p>
          <p className="text-2xl font-bold text-white mt-1">{invoices.length}</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-sm">Sales Bills</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{salesBills.length}</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-sm">Service Bills</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{serviceBills.length}</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-sm">Total Billed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(totalBilled)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print flex gap-2 mb-5 flex-wrap">
        {['All', 'Sales Bill', 'Service Bill'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:text-white border border-slate-600'
            }`}>
            {tab === 'All'
              ? `All (${invoices.length})`
              : tab === 'Sales Bill'
              ? `🚗 Sales Bills (${salesBills.length})`
              : `🔧 Service Bills (${serviceBills.length})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="no-print card mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <input type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice no, customer, chassis..."
              className="input-field" />
          </div>
          <div>
            <input type="date" value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-field" title="From date" />
          </div>
          <div>
            <input type="date" value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-field" title="To date" />
          </div>
        </div>
        {(search || fromDate || toDate) && (
          <button
            onClick={() => { setSearch(''); setFromDate(''); setToDate(''); }}
            className="text-slate-400 hover:text-white text-xs mt-2">
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="no-print flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="no-print card text-center py-16">
          <p className="text-slate-400 text-xl mb-2">🧾</p>
          <p className="text-slate-400 font-medium">No invoices found</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">
            Create and save invoices from the Invoice page
          </p>
          <button onClick={() => navigate('/invoice')} className="btn-primary">
            Create Invoice
          </button>
        </div>
      ) : (
        <div className="no-print space-y-4">
          {invoices.map((inv) => (
            <div key={inv._id} className="card border border-slate-700 overflow-hidden">

              {/* Invoice Row Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{
                      backgroundColor: inv.invoiceType === 'Sales Bill'
                        ? '#1e3a8a22' : '#4c1d9522'
                    }}>
                    {inv.invoiceType === 'Sales Bill' ? '🚗' : '🔧'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold">{inv.customerName}</span>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        {inv.invoiceNo}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        inv.invoiceType === 'Sales Bill'
                          ? 'bg-blue-900/40 text-blue-400 border border-blue-800'
                          : 'bg-purple-900/40 text-purple-400 border border-purple-800'
                      }`}>
                        {inv.invoiceType}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {inv.vehicleModel && `${inv.vehicleModel} · `}
                      Saved: {fmtDT(inv.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-lg">
                      {fmt(inv.totalBill)}
                    </p>
                    {inv.balanceDue > 0 && (
                      <p className="text-amber-400 text-xs">
                        Due: {fmt(inv.balanceDue)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setExpanded(expanded === inv._id ? null : inv._id)}
                      className="btn-secondary text-xs py-1.5 px-2" title="View Details">
                      {expanded === inv._id ? '▲' : '▼'}
                    </button>
                    <button
                      onClick={() => handlePrint(inv)}
                      className="btn-secondary text-xs py-1.5 px-2" title="Reprint">
                      🖨️
                    </button>
                    <button
                      onClick={() => handleDelete(inv._id)}
                      className="btn-danger text-xs py-1.5 px-2" title="Delete">
                      🗑
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-700/30 rounded-lg px-4 py-3 mt-3">
                <div><p className="text-slate-400 text-xs">Invoice Date</p>
                  <p className="text-white text-sm font-medium">{fmtDate(inv.invoiceDate)}</p></div>
                <div><p className="text-slate-400 text-xs">Customer</p>
                  <p className="text-white text-sm font-medium truncate">{inv.customerName}</p></div>
                <div><p className="text-slate-400 text-xs">Total</p>
                  <p className="text-emerald-400 text-sm font-bold">{fmt(inv.totalBill)}</p></div>
                <div><p className="text-slate-400 text-xs">Paid</p>
                  <p className="text-white text-sm font-medium">{fmt(inv.paidAmount)}</p></div>
                <div><p className="text-slate-400 text-xs">Balance</p>
                  <p className="text-sm font-bold"
                    style={{ color: inv.balanceDue > 0 ? '#fbbf24' : '#34d399' }}>
                    {fmt(inv.balanceDue)}
                  </p></div>
              </div>

              {/* Expanded Details */}
              {expanded === inv._id && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-700/30 rounded-xl p-3">
                      <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Customer</p>
                      <p className="text-white font-semibold">{inv.customerName}</p>
                      {inv.customerPhone && (
                        <p className="text-slate-300 text-sm">📞 {inv.customerPhone}</p>
                      )}
                      {inv.customerAddress && (
                        <p className="text-slate-300 text-sm">📍 {inv.customerAddress}</p>
                      )}
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-3">
                      <p className="text-slate-400 text-xs font-semibold uppercase mb-2">
                        {inv.invoiceType === 'Sales Bill' ? 'Vehicle' : 'Service'}
                      </p>
                      <p className="text-white font-semibold">{inv.vehicleModel || '—'}</p>
                      {inv.invoiceType === 'Sales Bill' && inv.chassisNo && (
                        <p className="text-emerald-400 text-xs font-mono">
                          Chassis: {inv.chassisNo}
                        </p>
                      )}
                      {inv.invoiceType === 'Sales Bill' && (
                        <>
                          {inv.motorNo && (
                            <p className="text-slate-300 text-xs font-mono">Motor: {inv.motorNo}</p>
                          )}
                          {inv.controllerNo && (
                            <p className="text-slate-300 text-xs font-mono">
                              Controller: {inv.controllerNo}
                            </p>
                          )}
                          {inv.chargerNo && (
                            <p className="text-slate-300 text-xs font-mono">
                              Charger: {inv.chargerNo}
                            </p>
                          )}
                          {inv.batteryNo && (
                            <p className="text-slate-300 text-xs font-mono">
                              Battery: {inv.batteryNo}
                            </p>
                          )}
                        </>
                      )}
                      {inv.invoiceType === 'Service Bill' && inv.serviceDescription && (
                        <p className="text-slate-300 text-xs mt-1">{inv.serviceDescription}</p>
                      )}
                    </div>
                  </div>

                  {/* Spare Items */}
                  {inv.spareItems?.filter(s => s.description)?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs font-semibold uppercase mb-2">Items</p>
                      <div className="border border-slate-600 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-700/50">
                              <th className="text-left px-4 py-2 text-slate-400">#</th>
                              <th className="text-left px-4 py-2 text-slate-400">Description</th>
                              <th className="text-center px-4 py-2 text-slate-400">Qty</th>
                              <th className="text-right px-4 py-2 text-slate-400">Unit Price</th>
                              <th className="text-right px-4 py-2 text-slate-400">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inv.spareItems.filter(s => s.description).map((item, idx) => (
                              <tr key={idx} className="border-t border-slate-700">
                                <td className="px-4 py-2 text-slate-400">{idx + 1}</td>
                                <td className="px-4 py-2 text-white">{item.description}</td>
                                <td className="px-4 py-2 text-center text-slate-300">{item.qty}</td>
                                <td className="px-4 py-2 text-right text-slate-300">
                                  {fmt(item.unitPrice)}
                                </td>
                                <td className="px-4 py-2 text-right text-emerald-400 font-semibold">
                                  {fmt((parseFloat(item.qty) || 1) * (parseFloat(item.unitPrice) || 0))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Bill Breakdown */}
                  <div className="flex justify-end">
                    <div className="bg-slate-700/40 rounded-xl p-4 min-w-[240px] space-y-1.5 text-sm">
                      {inv.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Discount</span>
                          <span className="text-red-400">- {fmt(inv.discount)}</span>
                        </div>
                      )}
                      {inv.gstAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">
                            GST ({inv.gstPercent}%)
                          </span>
                          <span>{fmt(inv.gstAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-600 pt-1.5 font-semibold">
                        <span className="text-emerald-400">Total Bill</span>
                        <span className="text-emerald-400 text-base">
                          {fmt(inv.totalBill)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Paid ({inv.paymentMode})
                        </span>
                        <span>{fmt(inv.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t-2 border-slate-500 pt-1.5 font-bold">
                        <span style={{ color: inv.balanceDue > 0 ? '#fbbf24' : '#34d399' }}>
                          Balance Due
                        </span>
                        <span style={{ color: inv.balanceDue > 0 ? '#fbbf24' : '#34d399' }}>
                          {fmt(inv.balanceDue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── REPRINT AREA (hidden on screen, visible on print) ── */}
      {printInvoice && (
        <ReprintInvoice inv={printInvoice} fmt={fmt} fmtDate={fmtDate} />
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          aside { display: none !important; }
          body * { visibility: hidden !important; }
          #reprint-area, #reprint-area * { visibility: visible !important; }
          #reprint-area {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 20px !important;
            color: black !important;
          }
          @page { size: A4; margin: 10mm; }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

// ── Reprint Component ──────────────────────────────────
function ReprintInvoice({ inv, fmt, fmtDate }) {
  const sparesTotal = inv.spareItems?.reduce(
    (s, r) => s + (parseFloat(r.unitPrice) || 0) * (parseFloat(r.qty) || 1), 0
  ) || 0;

  return (
    <div id="reprint-area"
      style={{
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#fff',
        color: '#000',
        padding: '24px 32px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>

      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          {inv.companyName || COMPANY.companyName}
        </div>
        <div style={{ fontSize: '12px', color: '#444', marginTop: '2px' }}>
          {inv.companyAddress || COMPANY.companyAddress}
        </div>
        <div style={{ fontSize: '12px', color: '#444' }}>
          Phone: {inv.companyPhone || COMPANY.companyPhone}
          {(inv.companyGST || COMPANY.companyGST) &&
            ` | GST IN: ${inv.companyGST || COMPANY.companyGST}`}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {inv.invoiceType}
        </div>
        <div style={{ fontSize: '12px', color: '#444' }}>
          Invoice No: <strong>{inv.invoiceNo}</strong> &nbsp; Date: <strong>{fmtDate(inv.invoiceDate)}</strong>
        </div>
      </div>

      {/* Customer + Vehicle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#666', letterSpacing: '1px', marginBottom: '6px' }}>
            CUSTOMER DETAILS
          </div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '3px' }}>{inv.customerName}</div>
          {inv.customerAddress && (
            <div style={{ fontSize: '12px', color: '#333', marginBottom: '2px' }}>
              📍 {inv.customerAddress}
            </div>
          )}
          {inv.customerPhone && (
            <div style={{ fontSize: '12px', color: '#333' }}>📞 {inv.customerPhone}</div>
          )}
        </div>
        <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#666', letterSpacing: '1px', marginBottom: '6px' }}>
            {inv.invoiceType === 'Sales Bill' ? 'VEHICLE DETAILS' : 'SERVICE DETAILS'}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '3px' }}>
            {inv.vehicleModel || '—'}
          </div>
          {inv.invoiceType === 'Service Bill' && inv.serviceDate && (
            <div style={{ fontSize: '12px', color: '#333' }}>Date: {fmtDate(inv.serviceDate)}</div>
          )}
          {inv.kmRun && (
            <div style={{ fontSize: '12px', color: '#333' }}>KM: {inv.kmRun}</div>
          )}
        </div>
      </div>

      {/* Vehicle Numbers — Sales Bill */}
      {inv.invoiceType === 'Sales Bill' &&
        (inv.chassisNo || inv.motorNo || inv.controllerNo || inv.chargerNo || inv.batteryNo) && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '7px 10px', textAlign: 'left', fontWeight: '700' }}>Field</th>
              <th style={{ border: '1px solid #ddd', padding: '7px 10px', textAlign: 'left', fontWeight: '700' }}>Number</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Chassis Number', value: inv.chassisNo },
              { label: 'Motor Number', value: inv.motorNo },
              { label: 'Controller Number', value: inv.controllerNo },
              { label: 'Charger Number', value: inv.chargerNo },
              { label: 'Battery Number', value: inv.batteryNo }
            ].filter(r => r.value).map((row, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ border: '1px solid #ddd', padding: '6px 10px', color: '#555', fontWeight: '600' }}>
                  {row.label}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '6px 10px', fontFamily: 'monospace', fontWeight: '600' }}>
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Service Description */}
      {inv.invoiceType === 'Service Bill' && inv.serviceDescription && (
        <div style={{ border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', borderRadius: '6px', padding: '10px', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#3b82f6', letterSpacing: '1px', marginBottom: '4px' }}>
            SERVICE WORK
          </div>
          <div style={{ fontSize: '12px', color: '#1e40af' }}>{inv.serviceDescription}</div>
        </div>
      )}

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#111', color: '#fff' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px' }}>#</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px' }}>Description</th>
            <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: '11px' }}>Qty</th>
            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px' }}>Unit Price</th>
            <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {inv.invoiceType === 'Sales Bill' ? (
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 12px', fontSize: '12px', color: '#666' }}>1</td>
              <td style={{ padding: '8px 12px', fontSize: '12px' }}>
                {inv.vehicleModel} {inv.vehicleColor && `— ${inv.vehicleColor}`}
              </td>
              <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'center' }}>1</td>
              <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'right' }}>
                {fmt(inv.grossTotal)}
              </td>
              <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>
                {fmt(inv.grossTotal)}
              </td>
            </tr>
          ) : (
            <>
              {inv.spareItems?.filter(s => s.description).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '8px 12px', fontSize: '12px', color: '#666' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 12px', fontSize: '12px' }}>{item.description}</td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'right' }}>
                    {fmt(item.unitPrice)}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>
                    {fmt((parseFloat(item.qty) || 1) * (parseFloat(item.unitPrice) || 0))}
                  </td>
                </tr>
              ))}
              {inv.labourCost > 0 && (
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 12px', fontSize: '12px', color: '#666' }}>
                    {(inv.spareItems?.filter(s => s.description)?.length || 0) + 1}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', fontStyle: 'italic' }}>
                    Labour Charges
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'right' }}>
                    {fmt(inv.labourCost)}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>
                    {fmt(inv.labourCost)}
                  </td>
                </tr>
              )}
              {inv.otherCharges?.filter(c => c.description).map((c, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 12px', fontSize: '12px', color: '#666' }}>—</td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', fontStyle: 'italic' }}>
                    {c.description}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'right' }}>
                    {fmt(c.amount)}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '12px', textAlign: 'right', fontWeight: '600' }}>
                    {fmt(c.amount)}
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <div style={{ minWidth: '250px' }}>
          {inv.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
              <span style={{ color: '#666' }}>Discount</span>
              <span style={{ color: '#dc2626' }}>- {fmt(inv.discount)}</span>
            </div>
          )}
          {inv.gstAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
              <span style={{ color: '#666' }}>GST ({inv.gstPercent}%)</span>
              <span>{fmt(inv.gstAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: '16px', fontWeight: 'bold', borderTop: '2px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
            <span>Total Amount</span><span>{fmt(inv.totalBill)}</span>
          </div>
          {inv.paidAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
              <span style={{ color: '#666' }}>Paid ({inv.paymentMode})</span>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>{fmt(inv.paidAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: '17px', fontWeight: 'bold', borderTop: '2px solid #000' }}>
            <span>Balance Due</span>
            <span style={{ color: inv.balanceDue > 0 ? '#d97706' : '#16a34a' }}>
              {fmt(inv.balanceDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px solid #000', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '12px', color: '#555' }}>
          Thank you for choosing {inv.companyName || COMPANY.companyName}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ height: '44px', borderBottom: '1px solid #999', width: '160px', marginBottom: '3px' }}></div>
          <div style={{ fontSize: '11px', color: '#666' }}>Authorized Signature</div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { addService, getServices, updateService, deleteService } from '../api';
import { getSpares } from '../api';
import CustomerSearch from '../components/CustomerSearch';

const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Bank Transfer'];
const emptySpareRow = () => ({ spareId: '', spareName: '', sellingPrice: '', quantity: 1 });
const emptyForm = { customerId: '', customerName: '', vehicleName: '', kmRun: '', serviceType: '', labourCost: '', paidAmount: '', serviceDate: '', paymentMode: 'Cash' };

export default function Service() {
  const [form, setForm] = useState(emptyForm);
  const [spareRows, setSpareRows] = useState([emptySpareRow()]);
  const [services, setServices] = useState([]);
  const [sparesList, setSparesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchServices = useCallback(async () => {
    setFetchLoading(true);
    try { const { data } = await getServices(); setServices(data); } catch {}
    setFetchLoading(false);
  }, []);

  const fetchSpares = useCallback(async () => {
    try { const { data } = await getSpares(); setSparesList(data); } catch {}
  }, []);

  useEffect(() => { fetchServices(); fetchSpares(); }, [fetchServices, fetchSpares]);

  const labourCost = parseFloat(form.labourCost) || 0;
  const spareCost = spareRows.reduce((sum, r) => sum + (parseFloat(r.sellingPrice) || 0) * (parseFloat(r.quantity) || 1), 0);
  const totalBill = labourCost + spareCost;
  const paidAmount = parseFloat(form.paidAmount) || 0;
  const pendingAmount = Math.max(0, totalBill - paidAmount);

  const getNextServiceDate = () => {
    const d = form.serviceDate ? new Date(form.serviceDate) : new Date();
    const next = new Date(d);
    next.setDate(next.getDate() + 90);
    return next.toLocaleDateString('en-IN');
  };

  const handleSpareChange = (idx, field, value) => {
    const updated = spareRows.map((r, i) => i === idx ? { ...r, [field]: value } : r);
    setSpareRows(updated);
  };

  // When spare part is selected from dropdown, auto-fill selling price
  const handleSpareSelect = (idx, spareName) => {
    const found = sparesList.find(s => s.spareName === spareName);
    const updated = spareRows.map((r, i) => i === idx
      ? { ...r, spareId: found?._id || '', spareName, sellingPrice: found?.sellingPrice || '' }
      : r
    );
    setSpareRows(updated);
  };

  const addSpareRow = () => setSpareRows([...spareRows, emptySpareRow()]);
  const removeSpareRow = (idx) => {
    if (spareRows.length === 1) { setSpareRows([emptySpareRow()]); return; }
    setSpareRows(spareRows.filter((_, i) => i !== idx));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCustomerSelect = (c) => setForm({ ...form, customerId: c._id, customerName: c.name });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!editId && !form.customerId) return setError('Please select a customer');
    if (!form.vehicleName) return setError('Vehicle name is required');
    const validSpares = spareRows.filter(r => r.spareName.trim() !== '');
    setLoading(true);
    try {
      const payload = {
        ...form, labourCost, paidAmount,
        spareItems: validSpares.map(r => ({
          spareId: r.spareId || undefined,
          spareName: r.spareName.trim(),
          sellingPrice: parseFloat(r.sellingPrice) || 0,
          quantity: parseFloat(r.quantity) || 1
        }))
      };
      if (editId) {
        await updateService(editId, { ...payload, spareCost, totalBill, pendingAmount, paymentStatus: pendingAmount <= 0 ? 'Paid' : 'Pending' });
        setSuccess('Service updated successfully!');
      } else {
        await addService(payload);
        setSuccess('Service added! Spare stock updated automatically.');
      }
      setForm(emptyForm);
      setSpareRows([emptySpareRow()]);
      setEditId(null);
      setShowForm(false);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
    setLoading(false);
  };

  const handleEdit = (s) => {
    setForm({
      customerId: s.customerId?._id || s.customerId || '',
      customerName: s.customerName,
      vehicleName: s.vehicleName,
      kmRun: s.kmRun || '',
      serviceType: s.serviceType || '',
      labourCost: s.labourCost || '',
      paidAmount: s.paidAmount || '',
      serviceDate: s.serviceDate ? new Date(s.serviceDate).toISOString().split('T')[0] : '',
      paymentMode: s.paymentMode || 'Cash'
    });
    setSpareRows(s.spareItems?.length > 0
      ? s.spareItems.map(item => ({ spareId: item.spareId || '', spareName: item.spareName, sellingPrice: item.sellingPrice, quantity: item.quantity }))
      : [emptySpareRow()]
    );
    setEditId(s._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service record?')) return;
    try { await deleteService(id); fetchServices(); }
    catch { alert('Delete failed'); }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Service</h1>
          <p className="text-slate-400 text-sm">Service records · spare stock auto-updates on save</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); setSpareRows([emptySpareRow()]); }} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ New Service'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-5">{editId ? 'Edit Service Record' : 'Add New Service Record'}</h2>
          {success && <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm">✓ {success}</div>}
          {error && <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Customer <span className="text-red-400">*</span></label>
                {editId ? <input value={form.customerName} disabled className="input-field opacity-60" />
                  : <><CustomerSearch onSelect={handleCustomerSelect} placeholder="Search customer..." />
                    {form.customerName && <p className="text-emerald-400 text-xs mt-1">✓ {form.customerName}</p>}
                  </>}
              </div>
              <div>
                <label className="label">Vehicle Name <span className="text-red-400">*</span></label>
                <input name="vehicleName" value={form.vehicleName} onChange={handleChange} placeholder="e.g. Tata Nexon EV" className="input-field" required />
              </div>
              <div>
                <label className="label">KM Run</label>
                <input name="kmRun" type="number" value={form.kmRun} onChange={handleChange} placeholder="Odometer reading" className="input-field" />
              </div>
              <div>
                <label className="label">Service Type <span className="text-slate-500 text-xs font-normal">(manual)</span></label>
                <input name="serviceType" value={form.serviceType} onChange={handleChange} placeholder="e.g. Full service + battery check" className="input-field" />
              </div>
              <div>
                <label className="label">Labour Cost (₹)</label>
                <input name="labourCost" type="number" value={form.labourCost} onChange={handleChange} placeholder="0" className="input-field" />
              </div>
              <div>
                <label className="label">Mode of Payment</label>
                <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className="input-field">
                  {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Service Date</label>
                <input name="serviceDate" type="date" value={form.serviceDate} onChange={handleChange} className="input-field" />
              </div>
            </div>

            {/* Spare Parts Section */}
            <div className="border border-slate-600 rounded-xl p-4 bg-slate-700/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  ⚙️ Spare Parts Used
                  <span className="text-slate-400 font-normal text-xs">(select from dropdown → price auto-fills)</span>
                </h3>
                <button type="button" onClick={addSpareRow}
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 bg-emerald-900/30 border border-emerald-700 px-3 py-1.5 rounded-lg">
                  + Add Part
                </button>
              </div>

              <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                <div className="col-span-5 text-slate-400 text-xs font-medium">Spare Part Name</div>
                <div className="col-span-3 text-slate-400 text-xs font-medium">Selling Price (₹)</div>
                <div className="col-span-2 text-slate-400 text-xs font-medium">Qty</div>
                <div className="col-span-1 text-slate-400 text-xs font-medium text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-2">
                {spareRows.map((row, idx) => {
                  const rowTotal = (parseFloat(row.sellingPrice) || 0) * (parseFloat(row.quantity) || 1);
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-800/60 rounded-lg px-2 py-2">
                      <div className="col-span-5">
                        {/* Dropdown from spare stock + free text */}
                        <select
                          value={row.spareName}
                          onChange={(e) => handleSpareSelect(idx, e.target.value)}
                          className="input-field text-sm py-2"
                        >
                          <option value="">-- Select Spare Part --</option>
                          {sparesList.map(s => (
                            <option key={s._id} value={s.spareName}>
                              {s.spareName} (Qty: {s.quantity})
                            </option>
                          ))}
                          <option value="__custom__">+ Type manually</option>
                        </select>
                        {row.spareName === '__custom__' && (
                          <input
                            className="input-field text-sm py-2 mt-1"
                            placeholder="Enter spare part name"
                            onChange={(e) => handleSpareChange(idx, 'spareName', e.target.value)}
                          />
                        )}
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={row.sellingPrice}
                          onChange={(e) => handleSpareChange(idx, 'sellingPrice', e.target.value)}
                          placeholder="Auto-filled"
                          className="input-field text-sm py-2"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number" min="1"
                          value={row.quantity}
                          onChange={(e) => handleSpareChange(idx, 'quantity', e.target.value)}
                          className="input-field text-sm py-2"
                        />
                      </div>
                      <div className="col-span-1 text-emerald-400 text-sm font-semibold text-right whitespace-nowrap">{fmt(rowTotal)}</div>
                      <div className="col-span-1 flex justify-end">
                        <button type="button" onClick={() => removeSpareRow(idx)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-400 text-sm">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div><p className="text-slate-400 text-xs mb-1">Labour Cost</p><p className="text-white font-semibold">{fmt(labourCost)}</p></div>
              <div><p className="text-slate-400 text-xs mb-1">Spare Cost</p><p className="text-white font-semibold">{fmt(spareCost)}</p></div>
              <div><p className="text-slate-400 text-xs mb-1">Total Bill</p><p className="text-emerald-400 font-bold text-lg">{fmt(totalBill)}</p></div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Amount Paid (₹)</label>
                <input name="paidAmount" type="number" value={form.paidAmount} onChange={handleChange} placeholder="0" className="input-field text-sm py-2" />
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Pending / Next Service</p>
                <p className="font-semibold text-sm" style={{ color: pendingAmount > 0 ? '#fbbf24' : '#34d399' }}>{fmt(pendingAmount)}</p>
                <p className="text-blue-400 text-xs mt-0.5">Due: {getNextServiceDate()}</p>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : editId ? '💾 Update Service' : '💾 Save Service Record'}
            </button>
          </form>
        </div>
      )}

      {/* Services Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">All Service Records ({services.length})</h2>
        {fetchLoading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : services.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No service records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  {['Customer', 'Vehicle', 'KM', 'Service Type', 'Labour', 'Spares', 'Total', 'Paid', 'Pending', 'Pay Mode', 'Status', 'Date', 'Next Due', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <React.Fragment key={s._id}>
                    <tr className="table-row cursor-pointer" onClick={() => setExpandedRow(expandedRow === s._id ? null : s._id)}>
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{s.customerName}</td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{s.vehicleName}</td>
                      <td className="px-4 py-3 text-slate-400">{s.kmRun?.toLocaleString() || '—'}</td>
                      <td className="px-4 py-3 text-slate-300 max-w-[140px] truncate" title={s.serviceType}>{s.serviceType || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{fmt(s.labourCost)}</td>
                      <td className="px-4 py-3 text-slate-300">{fmt(s.spareCost)}</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold">{fmt(s.totalBill)}</td>
                      <td className="px-4 py-3 text-slate-300">{fmt(s.paidAmount)}</td>
                      <td className="px-4 py-3 text-amber-400">{fmt(s.pendingAmount)}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{s.paymentMode || 'Cash'}</span></td>
                      <td className="px-4 py-3"><span className={s.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}>{s.paymentStatus}</span></td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{fmtDate(s.serviceDate)}</td>
                      <td className="px-4 py-3 text-blue-400 whitespace-nowrap">{fmtDate(s.nextServiceDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="btn-secondary text-xs py-1 px-2">✏️</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="btn-danger text-xs py-1 px-2">🗑</button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === s._id && s.spareItems?.length > 0 && (
                      <tr className="bg-slate-800/80">
                        <td colSpan={14} className="px-6 py-3">
                          <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Spare Parts Breakdown</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {s.spareItems.map((item, i) => (
                              <div key={i} className="bg-slate-700/60 rounded-lg px-3 py-2 flex justify-between">
                                <div>
                                  <p className="text-white text-sm font-medium">{item.spareName}</p>
                                  <p className="text-slate-400 text-xs">Qty: {item.quantity} × {fmt(item.sellingPrice)}</p>
                                </div>
                                <p className="text-emerald-400 font-semibold text-sm">{fmt(item.sellingPrice * item.quantity)}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

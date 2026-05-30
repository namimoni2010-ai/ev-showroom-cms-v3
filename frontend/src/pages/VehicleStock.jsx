<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import {
  addVehicle, getVehicles, updateVehicle,
  deleteVehicle, searchVehicles
} from '../api';

const emptyForm = {
  vehicleModel: '', chassisNo: '', motorNo: '',
  controllerNo: '', chargerNo: '', batteryNo: '',
  vehicleColor: '', purchaseDate: '', price: '',
  stockStatus: 'Available'
};
=======
import React, { useState, useEffect } from 'react';
import { addVehicle, getVehicles, updateVehicle, deleteVehicle } from '../api';

const emptyForm = { vehicleName: '', vehicleType: '', range: '', price: '', quantity: '' };
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d

export default function VehicleStock() {
  const [form, setForm] = useState(emptyForm);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
<<<<<<< HEAD
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchVehicles = useCallback(async () => {
    setFetchLoading(true);
    try {
      const { data } = await getVehicles(statusFilter !== 'All' ? statusFilter : undefined);
      setVehicles(data);
    } catch {}
    setFetchLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleSearch = async (val) => {
    setSearch(val);
    if (!val.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const { data } = await searchVehicles(val);
      setSearchResults(data);
    } catch { setSearchResults([]); }
    setSearching(false);
  };

=======

  const fetchVehicles = async () => {
    setFetchLoading(true);
    try { const { data } = await getVehicles(); setVehicles(data); } catch {}
    setFetchLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, []);

>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
<<<<<<< HEAD
    if (!form.vehicleModel) return setError('Vehicle model is required');
    if (!form.chassisNo) return setError('Chassis number is required');
=======
    if (!form.vehicleName || !form.price) return setError('Vehicle name and price are required');
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
    setLoading(true);
    try {
      if (editId) {
        await updateVehicle(editId, form);
        setSuccess('Vehicle updated successfully!');
      } else {
        await addVehicle(form);
        setSuccess('Vehicle added to stock!');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
    setLoading(false);
  };

  const handleEdit = (v) => {
<<<<<<< HEAD
    setForm({
      vehicleModel: v.vehicleModel || '',
      chassisNo: v.chassisNo || '',
      motorNo: v.motorNo || '',
      controllerNo: v.controllerNo || '',
      chargerNo: v.chargerNo || '',
      batteryNo: v.batteryNo || '',
      vehicleColor: v.vehicleColor || '',
      purchaseDate: v.purchaseDate
        ? new Date(v.purchaseDate).toISOString().split('T')[0] : '',
      price: v.price || '',
      stockStatus: v.stockStatus || 'Available'
    });
=======
    setForm({ vehicleName: v.vehicleName, vehicleType: v.vehicleType || '', range: v.range || '', price: v.price, quantity: v.quantity });
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
    setEditId(v._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle from stock?')) return;
    try { await deleteVehicle(id); fetchVehicles(); }
    catch { alert('Delete failed'); }
  };

<<<<<<< HEAD
  const displayList = searchResults !== null ? searchResults : vehicles;
  const availableCount = vehicles.filter(v => v.stockStatus === 'Available').length;
  const soldCount = vehicles.filter(v => v.stockStatus === 'Sold').length;
=======
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const lowStockVehicles = vehicles.filter(v => v.quantity <= 1);
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Vehicle Stock</h1>
<<<<<<< HEAD
          <p className="text-slate-400 text-sm">
            Manage EV inventory · Chassis · Battery · Motor tracking
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm(emptyForm);
            setSuccess('');
            setError('');
          }}
          className="btn-primary">
=======
          <p className="text-slate-400 text-sm">EV inventory · qty auto-decrements on sale</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }} className="btn-primary">
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
          {showForm ? '✕ Cancel' : '+ Add Vehicle'}
        </button>
      </div>

<<<<<<< HEAD
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-slate-400 text-sm">Total Vehicles</p>
          <p className="text-2xl font-bold text-white mt-1">{vehicles.length}</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-sm">Available</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{availableCount}</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-sm">Sold</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">{soldCount}</p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-5">
            {editId ? '✏️ Edit Vehicle' : '+ Add New Vehicle'}
          </h2>
          {success && (
            <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm">
              ✓ {success}
            </div>
          )}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Vehicle Info */}
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Vehicle Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    Vehicle Model <span className="text-red-400">*</span>
                  </label>
                  <input name="vehicleModel" value={form.vehicleModel}
                    onChange={handleChange}
                    placeholder="e.g. Ather 450X, Ola S1 Pro"
                    className="input-field" required />
                </div>
                <div>
                  <label className="label">Vehicle Color</label>
                  <input name="vehicleColor" value={form.vehicleColor}
                    onChange={handleChange}
                    placeholder="e.g. Cosmic Black"
                    className="input-field" />
                </div>
                <div>
                  <label className="label">Purchase Date</label>
                  <input name="purchaseDate" type="date"
                    value={form.purchaseDate}
                    onChange={handleChange}
                    className="input-field" />
                </div>
                <div>
                  <label className="label">Price (₹)</label>
                  <input name="price" type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0" className="input-field" />
                </div>
                <div>
                  <label className="label">Stock Status</label>
                  <select name="stockStatus" value={form.stockStatus}
                    onChange={handleChange} className="input-field">
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Numbers */}
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Vehicle Numbers
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    Chassis Number <span className="text-red-400">*</span>
                    <span className="text-slate-500 text-xs font-normal ml-1">(unique)</span>
                  </label>
                  <input name="chassisNo" value={form.chassisNo}
                    onChange={handleChange}
                    placeholder="Chassis number"
                    className="input-field font-mono" required />
                </div>
                <div>
                  <label className="label">Motor Number</label>
                  <input name="motorNo" value={form.motorNo}
                    onChange={handleChange}
                    placeholder="Motor number"
                    className="input-field font-mono" />
                </div>
                <div>
                  <label className="label">Controller Number</label>
                  <input name="controllerNo" value={form.controllerNo}
                    onChange={handleChange}
                    placeholder="Controller number"
                    className="input-field font-mono" />
                </div>
                <div>
                  <label className="label">Charger Number</label>
                  <input name="chargerNo" value={form.chargerNo}
                    onChange={handleChange}
                    placeholder="Charger number"
                    className="input-field font-mono" />
                </div>
                <div>
                  <label className="label">Battery Number</label>
                  <input name="batteryNo" value={form.batteryNo}
                    onChange={handleChange}
                    placeholder="Battery number"
                    className="input-field font-mono" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : editId ? '💾 Update Vehicle' : '+ Add Vehicle'}
              </button>
              {editId && (
                <button type="button"
                  onClick={() => {
                    setEditId(null);
                    setForm(emptyForm);
                    setShowForm(false);
                  }}
                  className="btn-secondary">
                  Cancel
                </button>
              )}
=======
      {/* Low Stock Alert Banner */}
      {lowStockVehicles.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
          <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
            <span className="animate-pulse">⚠</span> Low Vehicle Stock Alert
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {lowStockVehicles.map(v => (
              <div key={v._id} className="bg-red-900/20 rounded-lg px-3 py-2 border border-red-800/50 flex justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{v.vehicleName}</p>
                  <p className="text-slate-400 text-xs">{v.vehicleType || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-bold text-xl">{v.quantity}</p>
                  <p className="text-red-500 text-xs">{v.quantity === 0 ? 'Out of Stock' : 'Low'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-5">{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
          {success && <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm">✓ {success}</div>}
          {error && <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Vehicle Name <span className="text-red-400">*</span></label>
                <input name="vehicleName" value={form.vehicleName} onChange={handleChange} placeholder="e.g. Tata Nexon EV Max" className="input-field" required />
              </div>
              <div>
                <label className="label">Vehicle Type</label>
                <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className="input-field">
                  <option value="">Select type</option>
                  {['Sedan','SUV','Hatchback','MUV','2-Wheeler','3-Wheeler'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Range (km)</label>
                <input name="range" value={form.range} onChange={handleChange} placeholder="e.g. 400 km" className="input-field" />
              </div>
              <div>
                <label className="label">Price (₹) <span className="text-red-400">*</span></label>
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" className="input-field" required />
              </div>
              <div>
                <label className="label">Quantity Available</label>
                <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="0" className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : editId ? 'Update Vehicle' : 'Add Vehicle'}
              </button>
              {editId && <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(false); }} className="btn-secondary">Cancel</button>}
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
            </div>
          </form>
        </div>
      )}

<<<<<<< HEAD
      {/* Vehicle Table */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">
            Vehicle Inventory
            <span className="text-slate-400 text-sm font-normal ml-2">
              ({displayList.length})
            </span>
          </h2>
          <div className="flex gap-3 items-center w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex gap-1">
              {['All', 'Available', 'Sold'].map(s => (
                <button key={s}
                  onClick={() => { setStatusFilter(s); setSearchResults(null); setSearch(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-400 border border-slate-600'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative flex-1">
              <input type="text" value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search chassis / model / motor..."
                className="input-field text-sm w-full" />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {search && (
              <button onClick={() => { setSearch(''); setSearchResults(null); }}
                className="text-slate-400 hover:text-white text-sm whitespace-nowrap">
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {fetchLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayList.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No vehicles found.</p>
=======
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Vehicle Inventory ({vehicles.length})</h2>
        {fetchLoading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : vehicles.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No vehicles in stock yet.</p>
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
<<<<<<< HEAD
                  {['Vehicle Model', 'Chassis No', 'Motor No', 'Controller No',
                    'Charger No', 'Battery No', 'Color', 'Price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
=======
                  {['Vehicle Name', 'Type', 'Range', 'Price', 'Qty Available', 'Stock Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3">{h}</th>
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
                  ))}
                </tr>
              </thead>
              <tbody>
<<<<<<< HEAD
                {displayList.map((v) => (
                  <tr key={v._id} className={`table-row ${v.stockStatus === 'Sold' ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                      {v.vehicleModel}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-400 font-mono text-xs bg-emerald-900/30 px-2 py-1 rounded">
                        {v.chassisNo || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {v.motorNo || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {v.controllerNo || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {v.chargerNo || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {v.batteryNo || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{v.vehicleColor || '—'}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">
                      {v.price ? `₹${Number(v.price).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        v.stockStatus === 'Available'
                          ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}>
                        {v.stockStatus === 'Available' ? '✅ Available' : '🔴 Sold'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(v)}
                          className="btn-secondary text-xs py-1 px-2">✏️</button>
                        <button onClick={() => handleDelete(v._id)}
                          className="btn-danger text-xs py-1 px-2">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
=======
                {vehicles.map((v) => {
                  const isLow = v.quantity <= 1;
                  return (
                    <tr key={v._id} className={`table-row ${isLow ? 'bg-red-900/10' : ''}`}>
                      <td className="px-4 py-3 text-white font-medium">{v.vehicleName}</td>
                      <td className="px-4 py-3 text-slate-400">{v.vehicleType || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{v.range || '—'}</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold">{fmt(v.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-lg ${isLow ? 'text-red-400' : 'text-white'}`}>{v.quantity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={v.quantity === 0 ? 'text-xs text-red-400 bg-red-900/30 border border-red-800 px-2.5 py-0.5 rounded-full'
                          : v.quantity <= 1 ? 'badge-pending'
                          : v.quantity <= 5 ? 'text-xs text-amber-400 bg-amber-900/30 border border-amber-800 px-2.5 py-0.5 rounded-full'
                          : 'badge-paid'}>
                          {v.quantity === 0 ? '🔴 Out of Stock' : v.quantity <= 1 ? '⚠ Low Stock' : v.quantity <= 5 ? '🟡 Limited' : '🟢 In Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(v)} className="btn-secondary text-xs py-1 px-3">✏️ Edit</button>
                          <button onClick={() => handleDelete(v._id)} className="btn-danger text-xs py-1 px-3">🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d

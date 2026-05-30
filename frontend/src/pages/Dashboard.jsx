import React, { useEffect, useState, useCallback } from 'react';
<<<<<<< HEAD
import { getDashboardStats, updateSalePayment } from '../api';
=======
import { getDashboardStats, updateSalePayment, updateServicePayment } from '../api';
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="card flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchStats = useCallback(async () => {
    try { const { data } = await getDashboardStats(); setStats(data); }
    catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const clearSalePayment = async (sale) => {
    setUpdatingId(sale._id);
<<<<<<< HEAD
    try {
      await updateSalePayment(sale._id, { paidAmount: sale.finalPrice || (sale.paidAmount + sale.pendingAmount) });
      await fetchStats();
    } catch { alert('Failed'); }
=======
    try { await updateSalePayment(sale._id, { paidAmount: sale.finalPrice || (sale.paidAmount + sale.pendingAmount) }); await fetchStats(); }
    catch { alert('Failed to update'); }
    setUpdatingId(null);
  };

  const clearServicePayment = async (svc) => {
    setUpdatingId(svc._id);
    try { await updateServicePayment(svc._id, { paidAmount: svc.totalBill || (svc.paidAmount + svc.pendingAmount) }); await fetchStats(); }
    catch { alert('Failed to update'); }
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
    setUpdatingId(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
<<<<<<< HEAD

  const statusBadge = (s) => {
    if (s === 'Completed') return <span className="badge-paid text-xs">✅ Completed</span>;
    if (s === 'Partially Paid') return <span className="text-xs text-blue-400 bg-blue-900/30 border border-blue-800 px-2 py-0.5 rounded-full">🔄 Partial</span>;
    return <span className="badge-pending text-xs">⏳ Pending</span>;
  };

  const hasLowStock = stats?.lowVehicleStock?.length > 0;
=======
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
  const allReminders = [
    ...(stats?.serviceReminders || []).map(r => ({ ...r, source: 'service' })),
    ...(stats?.salesReminders || [])
  ].sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate));

<<<<<<< HEAD
=======
  const hasLowStock = (stats?.lowVehicleStock?.length > 0) || (stats?.lowSpareStock?.length > 0);

>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Live overview of your EV showroom</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" label="Total Customers" value={stats?.totalCustomers || 0} color="bg-blue-900/50" />
        <StatCard icon="🚗" label="Total Sales" value={stats?.totalSales || 0} color="bg-emerald-900/50" />
        <StatCard icon="🔧" label="Total Services" value={stats?.totalServices || 0} color="bg-purple-900/50" />
        <StatCard icon="💰" label="Total Pending" value={fmt(stats?.totalPending)} color="bg-amber-900/50" sub="All transactions" />
      </div>

<<<<<<< HEAD
      {/* Vehicle Low Stock Alert only */}
=======
      {/* ── Low Stock Alerts ── */}
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
      {hasLowStock && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
<<<<<<< HEAD
            <h2 className="text-lg font-bold text-red-400">🔔 Low Stock Alerts</h2>
            <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full border border-red-800">
              {stats?.lowVehicleStock?.length || 0} items
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {stats?.lowVehicleStock?.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
                <h3 className="text-red-400 font-semibold mb-3">🚗 Low Vehicle Stock</h3>
                <table className="w-full text-sm">
                  <thead><tr className="text-slate-400 text-xs">
                    <th className="text-left pb-2">Vehicle</th>
                    <th className="text-left pb-2">Type</th>
                    <th className="text-center pb-2">Qty</th>
                    <th className="text-left pb-2">Status</th>
                  </tr></thead>
                  <tbody>
                    {stats.lowVehicleStock.map(v => (
                      <tr key={v._id} className="border-t border-red-900/30">
                        <td className="py-2 text-white font-medium">{v.vehicleName}</td>
                        <td className="py-2 text-slate-400">{v.vehicleType || '—'}</td>
                        <td className="py-2 text-center text-red-400 font-bold text-lg">{v.quantity}</td>
                        <td className="py-2">
                          <span className={v.quantity === 0 ? 'text-xs text-red-400 bg-red-900/40 border border-red-800 px-2 py-0.5 rounded-full' : 'badge-pending'}>
                            {v.quantity === 0 ? '❌ Out of Stock' : '⚠ Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
=======
            <h2 className="text-lg font-bold text-red-400">⚠ Low Stock Alerts</h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* Low Vehicle Stock */}
            {stats?.lowVehicleStock?.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
                <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  🚗 Low Vehicle Stock
                  <span className="text-xs bg-red-900/50 px-2 py-0.5 rounded-full border border-red-700">
                    {stats.lowVehicleStock.length} vehicle{stats.lowVehicleStock.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <div className="space-y-2">
                  {stats.lowVehicleStock.map((v) => (
                    <div key={v._id} className="flex items-center justify-between bg-red-900/20 rounded-lg px-4 py-3 border border-red-800/50">
                      <div>
                        <p className="text-white font-medium text-sm">{v.vehicleName}</p>
                        <p className="text-slate-400 text-xs">{v.vehicleType || '—'} · {fmt(v.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-bold text-lg">{v.quantity}</p>
                        <p className="text-red-500 text-xs">{v.quantity === 0 ? 'Out of Stock' : 'Low Stock'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Spare Stock */}
            {stats?.lowSpareStock?.length > 0 && (
              <div className="bg-orange-900/20 border border-orange-800 rounded-xl p-4">
                <h3 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                  ⚙️ Low Spare Parts Stock
                  <span className="text-xs bg-orange-900/50 px-2 py-0.5 rounded-full border border-orange-700">
                    {stats.lowSpareStock.length} part{stats.lowSpareStock.length > 1 ? 's' : ''}
                  </span>
                </h3>
                <div className="space-y-2">
                  {stats.lowSpareStock.map((s) => (
                    <div key={s._id} className="flex items-center justify-between bg-orange-900/20 rounded-lg px-4 py-3 border border-orange-800/50">
                      <div>
                        <p className="text-white font-medium text-sm">{s.spareName}</p>
                        <p className="text-slate-400 text-xs">Selling: {fmt(s.sellingPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-400 font-bold text-lg">{s.quantity}</p>
                        <p className="text-orange-500 text-xs">{s.quantity === 0 ? 'Out of Stock' : 'Low Stock'}</p>
                      </div>
                    </div>
                  ))}
                </div>
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Payments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
<<<<<<< HEAD
        {/* Pending Sales */}
=======
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            Pending Sale Payments
            <span className="ml-auto text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded-full border border-amber-800">{stats?.pendingSales?.length || 0}</span>
          </h2>
          {!stats?.pendingSales?.length ? (
            <p className="text-slate-500 text-sm text-center py-4">All cleared 🎉</p>
          ) : (
<<<<<<< HEAD
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stats.pendingSales.map((s) => (
                <div key={s._id} className="bg-slate-700/50 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium">{s.customerName || s.customerId?.name}</p>
                    <p className="text-amber-400 font-semibold text-sm">{fmt(s.pendingAmount)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-xs">{s.vehicleName}</p>
                    <div className="flex items-center gap-3">
                      <p className="text-slate-500 text-xs">📅 {fmtDate(s.salesDate)}</p>
                      <button onClick={() => clearSalePayment(s)} disabled={updatingId === s._id}
                        className="text-xs text-emerald-400 hover:text-emerald-300">
                        {updatingId === s._id ? 'Updating...' : 'Mark Paid ✓'}
                      </button>
                    </div>
=======
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {stats.pendingSales.map((s) => (
                <div key={s._id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{s.customerName || s.customerId?.name}</p>
                    <p className="text-slate-400 text-xs">{s.vehicleName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 font-semibold text-sm">{fmt(s.pendingAmount)}</p>
                    <button onClick={() => clearSalePayment(s)} disabled={updatingId === s._id}
                      className="text-xs text-emerald-400 hover:text-emerald-300 mt-1">
                      {updatingId === s._id ? 'Updating...' : 'Mark Paid ✓'}
                    </button>
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

<<<<<<< HEAD
        {/* Pending Services */}
=======
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            Pending Service Payments
            <span className="ml-auto text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full border border-red-800">{stats?.pendingServices?.length || 0}</span>
          </h2>
          {!stats?.pendingServices?.length ? (
            <p className="text-slate-500 text-sm text-center py-4">All cleared 🎉</p>
          ) : (
<<<<<<< HEAD
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stats.pendingServices.map((s) => (
                <div key={s._id} className="bg-slate-700/50 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium">{s.customerName || s.customerId?.name}</p>
                    {statusBadge(s.paymentStatus)}
                  </div>
                  <p className="text-slate-400 text-xs mb-1">{s.vehicleName}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <span className="text-slate-500 text-xs">📅 Service: {fmtDate(s.serviceDate)}</span>
                      <span className="text-slate-400 text-xs">Total: {fmt(s.totalBill)}</span>
                      <span className="text-emerald-400 text-xs">Paid: {fmt(s.paidAmount)}</span>
                    </div>
                    <p className="text-amber-400 font-semibold text-sm">Pending: {fmt(s.pendingAmount)}</p>
=======
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {stats.pendingServices.map((s) => (
                <div key={s._id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{s.customerName || s.customerId?.name}</p>
                    <p className="text-slate-400 text-xs">{s.vehicleName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-semibold text-sm">{fmt(s.pendingAmount)}</p>
                    <button onClick={() => clearServicePayment(s)} disabled={updatingId === s._id}
                      className="text-xs text-emerald-400 hover:text-emerald-300 mt-1">
                      {updatingId === s._id ? 'Updating...' : 'Mark Paid ✓'}
                    </button>
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Reminders */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Service Reminders
          <span className="ml-auto text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">{allReminders.length}</span>
        </h2>
<<<<<<< HEAD
        <p className="text-slate-500 text-xs mb-4">90 days after last service or vehicle purchase</p>
        {allReminders.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No upcoming reminders</p>
=======
        <p className="text-slate-500 text-xs mb-4">90 days after last service · or 90 days after vehicle purchase (if no service yet)</p>
        {allReminders.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No upcoming service reminders</p>
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  {['Customer', 'Phone', 'Vehicle', 'Source', 'Last Event', 'Due Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allReminders.map((r) => {
<<<<<<< HEAD
                  const daysLeft = Math.ceil((new Date(r.nextServiceDate) - new Date()) / 86400000);
=======
                  const due = new Date(r.nextServiceDate);
                  const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
                  const overdue = daysLeft < 0;
                  const dueSoon = daysLeft >= 0 && daysLeft <= 14;
                  return (
                    <tr key={r._id} className="table-row">
                      <td className="px-4 py-3 text-white font-medium">{r.customerName || r.customerId?.name}</td>
                      <td className="px-4 py-3 text-slate-300">{r.customerId?.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{r.vehicleName}</td>
                      <td className="px-4 py-3">
                        {r.source === 'sale'
                          ? <span className="text-xs bg-blue-900/40 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full">🚗 After Purchase</span>
                          : <span className="text-xs bg-purple-900/40 text-purple-400 border border-purple-800 px-2 py-0.5 rounded-full">🔧 After Service</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-400">{fmtDate(r.serviceDate)}</td>
<<<<<<< HEAD
                      <td className="px-4 py-3 font-semibold" style={{ color: overdue ? '#f87171' : dueSoon ? '#fbbf24' : '#94a3b8' }}>
                        {fmtDate(r.nextServiceDate)}
                      </td>
                      <td className="px-4 py-3">
                        {overdue
                          ? <span className="badge-pending">⚠ Overdue ({Math.abs(daysLeft)}d)</span>
                          : dueSoon
                          ? <span className="text-xs text-amber-400 bg-amber-900/30 border border-amber-800 px-2.5 py-0.5 rounded-full">🔔 {daysLeft}d left</span>
=======
                      <td className="px-4 py-3 font-semibold" style={{ color: overdue ? '#f87171' : dueSoon ? '#fbbf24' : '#94a3b8' }}>{fmtDate(r.nextServiceDate)}</td>
                      <td className="px-4 py-3">
                        {overdue ? <span className="badge-pending">⚠ Overdue ({Math.abs(daysLeft)}d)</span>
                          : dueSoon ? <span className="text-xs text-amber-400 bg-amber-900/30 border border-amber-800 px-2.5 py-0.5 rounded-full">🔔 {daysLeft}d left</span>
>>>>>>> 4b2cd7b56332a999799852674a8a168b7c1e951d
                          : <span className="text-xs text-slate-400 bg-slate-700/50 border border-slate-600 px-2.5 py-0.5 rounded-full">📅 {daysLeft}d</span>}
                      </td>
                    </tr>
                  );
                })}
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

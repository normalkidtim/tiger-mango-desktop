// src/pages/SalesAnalytics.jsx
import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";
import {
  FiBarChart2, FiCalendar, FiTrendingUp, FiClock, FiZap
} from "react-icons/fi";
import "../assets/styles/sales-analytics.css";

export default function SalesAnalytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toDate = (ts) => (ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null);

  const filteredOrders = useMemo(() => {
    if (!startDateStr || !endDateStr) return orders;
    const start = new Date(startDateStr + "T00:00:00");
    const end = new Date(endDateStr + "T23:59:59.999");
    return orders.filter((o) => {
      const d = toDate(o.createdAt);
      return d && d >= start && d <= end;
    });
  }, [orders, startDateStr, endDateStr]);

  const sumEarnings = (arr) => arr.reduce((s, o) => s + (o.price || 0) * (o.quantity || 1), 0);
  
  const now = new Date();
  const ordersToday = useMemo(() => {
    return orders.filter((o) => {
      const d = toDate(o.createdAt);
      return (d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate());
    });
  }, [orders]);

  const getWeekNumber = (d) => {
    const firstJan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - firstJan) / 86400000 + firstJan.getDay() + 1) / 7);
  };

  const ordersThisWeek = useMemo(() => {
    const wk = getWeekNumber(now);
    return orders.filter((o) => {
      const d = toDate(o.createdAt);
      return d && getWeekNumber(d) === wk && d.getFullYear() === now.getFullYear();
    });
  }, [orders]);

  const ordersThisMonth = useMemo(() => {
    return orders.filter((o) => {
      const d = toDate(o.createdAt);
      return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }, [orders]);
  
  const rangeActive = startDateStr && endDateStr;

  const computeHourlyData = (ordersArr) => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, earnings: 0 }));
    ordersArr.forEach((o) => {
      const d = toDate(o.createdAt);
      if (d) buckets[d.getHours()].earnings += (o.price || 0) * (o.quantity || 1);
    });
    return buckets;
  };

  const computeDailyData = (ordersArr) => {
    const map = {};
    ordersArr.forEach((o) => {
      const d = toDate(o.createdAt);
      if (d) {
        const key = d.toISOString().slice(0, 10);
        map[key] = (map[key] || 0) + (o.price || 0) * (o.quantity || 1);
      }
    });
    return Object.entries(map).sort((a, b) => (a[0] > b[0] ? 1 : -1)).map(([k, v]) => ({ date: k, earnings: v }));
  };

  const hourlyData = useMemo(() => computeHourlyData(rangeActive ? filteredOrders : ordersToday), [filteredOrders, rangeActive, ordersToday]);
  const dailyData = useMemo(() => {
    if (rangeActive) return computeDailyData(filteredOrders);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const map = {};
    ordersThisWeek.forEach((o) => {
      const d = toDate(o.createdAt);
      if (d) map[d.getDay()] = (map[d.getDay()] || 0) + (o.price || 0) * (o.quantity || 1);
    });
    return daysOfWeek.map((label, idx) => ({ day: label, earnings: map[idx] || 0 }));
  }, [filteredOrders, rangeActive, ordersThisWeek]);

  const bestSellers = useMemo(() => {
    const source = rangeActive ? filteredOrders : orders;
    const flavorMap = {}, addonMap = {}, sizeMap = {};
    source.forEach((o) => {
      const qty = o.quantity || 1;
      if (o.flavor) flavorMap[o.flavor] = (flavorMap[o.flavor] || 0) + qty;
      if (o.size) sizeMap[o.size] = (sizeMap[o.size] || 0) + qty;
      if (Array.isArray(o.addOns)) o.addOns.forEach((a) => (addonMap[a] = (addonMap[a] || 0) + qty));
    });

    const toSortedArray = (map) => Object.entries(map).map(([k, v]) => ({ name: k, count: v })).sort((a, b) => b.count - a.count);
    const flavors = toSortedArray(flavorMap), addons = toSortedArray(addonMap), sizes = toSortedArray(sizeMap);
    const totalFlavor = flavors.reduce((s, it) => s + it.count, 0) || 1;
    const totalAddon = addons.reduce((s, it) => s + it.count, 0) || 1;
    const totalSize = sizes.reduce((s, it) => s + it.count, 0) || 1;

    return {
      flavors: flavors.map((f, i) => ({ rank: i + 1, name: f.name, count: f.count, percent: ((f.count / totalFlavor) * 100).toFixed(1) })),
      addons: addons.map((a, i) => ({ rank: i + 1, name: a.name, count: a.count, percent: ((a.count / totalAddon) * 100).toFixed(1) })),
      sizes: sizes.map((s, i) => ({ rank: i + 1, name: s.name, count: s.count, percent: ((s.count / totalSize) * 100).toFixed(1) })),
    };
  }, [filteredOrders, rangeActive, orders]);

  const clearRange = () => {
    setStartDateStr("");
    setEndDateStr("");
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div>
      <div className="page-header"><FiBarChart2 /><h2>Sales Analytics</h2></div>
      <div className="page-header-underline"></div>

      <div className="filter-bar">
        <div className="filter-group"><FiCalendar /><label>From:</label><input type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} /></div>
        <div className="filter-group"><label>To:</label><input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} /></div>
        <button className="btn" onClick={clearRange} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>Clear</button>
      </div>

      <div className="sales-summary-grid">
        <SummaryCard icon={<FiClock />} title="Today's Sales" earnings={sumEarnings(ordersToday)} />
        <SummaryCard icon={<FiZap />} title="This Week's Sales" earnings={sumEarnings(ordersThisWeek)} />
        <SummaryCard icon={<FiTrendingUp />} title="This Month's Sales" earnings={sumEarnings(ordersThisMonth)} />
      </div>

      <div className="chart-section"><h3 className="section-title">⏰ Peak Hours (Earnings)</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="hour" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background-dark)', borderColor: 'var(--border-color)' }} cursor={{ fill: 'rgba(255, 202, 40, 0.1)' }} />
              <Bar dataKey="earnings" fill="#ffca28" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-section"><h3 className="section-title">📆 Daily Sales</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey={rangeActive ? "date" : "day"} tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background-dark)', borderColor: 'var(--border-color)' }} cursor={{ fill: 'rgba(255, 202, 40, 0.1)' }}/>
              <Bar dataKey="earnings" fill="#ffca28" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3 className="section-title">🏆 Best Sellers</h3>
      <div className="best-sellers-grid">
        <BestTable title="Top Flavors" rows={bestSellers.flavors} />
        <BestTable title="Top Add-ons" rows={bestSellers.addons} />
        <BestTable title="Top Sizes" rows={bestSellers.sizes} />
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, earnings }) {
  return (
    <div className="overview-card">
      <div className="overview-card-icon">{icon}</div>
      <div className="overview-card-info">
        <h4>{title}</h4>
        <p>₱{Number(earnings || 0).toLocaleString()}</p>
      </div>
    </div>
  );
}

function BestTable({ title, rows }) {
  return (
    <div className="table-box">
      <h4>{title}</h4>
      {/* ✅ ADDED a className here */}
      <table className="best-sellers-table">
        <thead><tr><th>Rank</th><th>Name</th><th>Total</th><th>%</th></tr></thead>
        <tbody>
          {rows && rows.length > 0 ? (
            rows.slice(0, 5).map((r) => (
              <tr key={r.rank + r.name}>
                <td><span className="rank">{r.rank}</span></td>
                <td>{r.name}</td>
                <td>{r.count}</td>
                <td style={{ textAlign: 'right' }}>{r.percent}%</td>
              </tr>
            ))
          ) : ( <tr><td colSpan={4} className="no-data">No data</td></tr> )}
        </tbody>
      </table>
    </div>
  );
}
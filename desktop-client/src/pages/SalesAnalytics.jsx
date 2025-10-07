// src/pages/SalesAnalytics.jsx
import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../assets/styles/sales-analytics.css";


export default function SalesAnalytics() {
  const [orders, setOrders] = useState([]);
  const [startDateStr, setStartDateStr] = useState(""); // "YYYY-MM-DD"
  const [endDateStr, setEndDateStr] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    });
    return () => unsub();
  }, []);

  // Utility: convert Firestore Timestamp to JS Date
  const toDate = (ts) => (ts && ts.toDate ? ts.toDate() : ts ? new Date(ts) : null);

  // Build filtered orders: if date range set use it, else default to current month/week/today? We'll
  // treat "no range" as "use all orders for computing today/thisweek/thismonth results".
  const filteredOrders = useMemo(() => {
    if (!startDateStr || !endDateStr) return orders;
    const start = new Date(startDateStr + "T00:00:00");
    const end = new Date(endDateStr + "T23:59:59.999");
    return orders.filter((o) => {
      const d = toDate(o.createdAt);
      return d && d >= start && d <= end;
    });
  }, [orders, startDateStr, endDateStr]);

  // Helpers to compute summary counts & earnings from a given array
  const sumEarnings = (arr) => arr.reduce((s, o) => s + (o.price || 0) * (o.quantity || 1), 0);
  const sumOrdersCount = (arr) => arr.reduce((s, o) => s + (o.quantity || 1), 0);

  // If user provided a date range, the cards should reflect that range.
  // If not provided, we also compute "today/week/month" from raw orders (useful to preserve original behavior).
  const now = new Date();

  // Derived when no custom range: compute today/week/month subsets
  const ordersToday = useMemo(() => {
    return orders.filter((o) => {
      const d = toDate(o.createdAt);
      return (
        d &&
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }, [orders, now]);

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
  }, [orders, now]);

  const ordersThisMonth = useMemo(() => {
    return orders.filter((o) => {
      const d = toDate(o.createdAt);
      return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
  }, [orders, now]);

  // Summary cards data
  const rangeActive = startDateStr && endDateStr;
  const summaryForRange = {
    ordersCount: sumOrdersCount(filteredOrders),
    earnings: sumEarnings(filteredOrders),
  };

  const summaryDefaults = {
    today: { ordersCount: sumOrdersCount(ordersToday), earnings: sumEarnings(ordersToday) },
    week: { ordersCount: sumOrdersCount(ordersThisWeek), earnings: sumEarnings(ordersThisWeek) },
    month: { ordersCount: sumOrdersCount(ordersThisMonth), earnings: sumEarnings(ordersThisMonth) },
  };

  // Charts: we'll compute from filteredOrders (if range provided) else compute from corresponding subsets
  // 1) Peak Hours: if filtered range is 1 day -> show hours for that day; else sum earnings per hour across range
  const computeHourlyData = (ordersArr) => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, earnings: 0 }));
    ordersArr.forEach((o) => {
      const d = toDate(o.createdAt);
      if (!d) return;
      const h = d.getHours();
      buckets[h].earnings += (o.price || 0) * (o.quantity || 1);
    });
    return buckets;
  };

  // 2) Daily data: aggregate by date label (YYYY-MM-DD -> readable)
  const computeDailyData = (ordersArr) => {
    const map = {};
    ordersArr.forEach((o) => {
      const d = toDate(o.createdAt);
      if (!d) return;
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      map[key] = (map[key] || 0) + (o.price || 0) * (o.quantity || 1);
    });
    // sort by date
    const entries = Object.entries(map).sort((a, b) => (a[0] > b[0] ? 1 : -1));
    return entries.map(([k, v]) => ({ date: k, earnings: v }));
  };

  // 3) Weekly-in-month: group by week-of-month (1..5)
  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
  };

  const computeWeeklyInMonthData = (ordersArr) => {
    const map = {};
    ordersArr.forEach((o) => {
      const d = toDate(o.createdAt);
      if (!d) return;
      const week = getWeekOfMonth(d);
      const label = `${d.toLocaleString("default", { month: "long" })} W${week}`;
      map[label] = (map[label] || 0) + (o.price || 0) * (o.quantity || 1);
    });
    const entries = Object.entries(map).sort((a, b) => (a[0] > b[0] ? 1 : -1));
    return entries.map(([k, v]) => ({ week: k, earnings: v }));
  };

  // Decide data sources for charts
  const hourlyData = useMemo(() => {
    if (rangeActive) return computeHourlyData(filteredOrders);
    // no range: use todayOrders for hourly
    return computeHourlyData(ordersToday);
  }, [filteredOrders, rangeActive, ordersToday]);

  const dailyData = useMemo(() => {
    if (rangeActive) return computeDailyData(filteredOrders);
    // no range: daily data for current week (Mon-Sun). We'll map to Sun..Sat for display
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const map = {};
    ordersThisWeek.forEach((o) => {
      const d = toDate(o.createdAt);
      if (!d) return;
      const key = d.getDay(); // 0..6
      map[key] = (map[key] || 0) + (o.price || 0) * (o.quantity || 1);
    });
    return daysOfWeek.map((label, idx) => ({ day: label, earnings: map[idx] || 0 }));
  }, [filteredOrders, rangeActive, ordersThisWeek]);

  const monthlyWeekData = useMemo(() => {
    if (rangeActive) return computeWeeklyInMonthData(filteredOrders);
    return computeWeeklyInMonthData(ordersThisMonth);
  }, [filteredOrders, rangeActive, ordersThisMonth]);

  // Best sellers: flavors, addOns, sizes
  const bestSellers = useMemo(() => {
    const flavorMap = {};
    const addonMap = {};
    const sizeMap = {};
    const arr = rangeActive ? filteredOrders : ordersThisMonth.concat(ordersThisWeek).concat(ordersToday); // fallback not to double count but we will just use all orders when no range; simpler to use orders
    const source = rangeActive ? filteredOrders : orders; // if no range, analyze all orders (you can change to month only)
    source.forEach((o) => {
      const qty = o.quantity || 1;
      if (o.flavor) flavorMap[o.flavor] = (flavorMap[o.flavor] || 0) + qty;
      if (o.size) sizeMap[o.size] = (sizeMap[o.size] || 0) + qty;
      if (Array.isArray(o.addOns)) {
        o.addOns.forEach((a) => {
          addonMap[a] = (addonMap[a] || 0) + qty;
        });
      }
    });

    const toSortedArray = (map) =>
      Object.entries(map)
        .map(([k, v]) => ({ name: k, count: v }))
        .sort((a, b) => b.count - a.count);

    const flavors = toSortedArray(flavorMap);
    const addons = toSortedArray(addonMap);
    const sizes = toSortedArray(sizeMap);
    const totalFlavor = flavors.reduce((s, it) => s + it.count, 0) || 1;
    const totalAddon = addons.reduce((s, it) => s + it.count, 0) || 1;
    const totalSize = sizes.reduce((s, it) => s + it.count, 0) || 1;

    return {
      flavors: flavors.map((f, i) => ({ rank: i + 1, name: f.name, count: f.count, percent: ((f.count / totalFlavor) * 100).toFixed(1) })),
      addons: addons.map((a, i) => ({ rank: i + 1, name: a.name, count: a.count, percent: ((a.count / totalAddon) * 100).toFixed(1) })),
      sizes: sizes.map((s, i) => ({ rank: i + 1, name: s.name, count: s.count, percent: ((s.count / totalSize) * 100).toFixed(1) })),
    };
  }, [filteredOrders, rangeActive, orders]);

  // Handlers
  const applyRange = () => {
    // nothing to do — filteredOrders is computed from startDateStr/endDateStr
    if (startDateStr && endDateStr && new Date(startDateStr) > new Date(endDateStr)) {
      alert("Start date must be before or equal to end date.");
      return;
    }
  };

  const clearRange = () => {
    setStartDateStr("");
    setEndDateStr("");
  };

  // Which summary to show in cards when range active: show range totals; else show today/week/month separately
  return (
    <div className="page-container">
      <h2 className="sales-header">📊 Sales Analytics Dashboard</h2>
      <div className="section-underline"></div>

      {/* Date range controls */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <label style={{ fontWeight: 600 }}>Date range:</label>
        <input type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} />
        <span>to</span>
        <input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} />
        <button onClick={applyRange} className="btn small">Apply</button>
        <button onClick={clearRange} className="btn small outline">Clear</button>
        <div style={{ marginLeft: "auto", color: "#666", fontSize: 14 }}>
          {rangeActive ? `Showing ${filteredOrders.length} orders in range` : `Showing ${orders.length} total orders`}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="sales-summary-grid">
        {rangeActive ? (
          <>
            <SummaryCard title="Selected Range" orders={sumOrdersCount(filteredOrders)} earnings={sumEarnings(filteredOrders)} />
            <SummaryCard title="—" orders={0} earnings={0} /> {/* filler to keep 3 columns balanced */}
            <SummaryCard title="—" orders={0} earnings={0} />
          </>
        ) : (
          <>
            <SummaryCard title="Today's Sales" orders={summaryDefaults.today.ordersCount} earnings={summaryDefaults.today.earnings} />
            <SummaryCard title="Weekly Sales" orders={summaryDefaults.week.ordersCount} earnings={summaryDefaults.week.earnings} />
            <SummaryCard title="Monthly Sales" orders={summaryDefaults.month.ordersCount} earnings={summaryDefaults.month.earnings} />
          </>
        )}
      </div>

      {/* Charts stacked */}
      <div className="chart-section">
        <h3 className="section-title">⏰ Peak Hours (Earnings)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip formatter={(val) => `₱${Number(val).toLocaleString()}`} />
            <Bar dataKey="earnings" fill="#4caf50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h3 className="section-title">📆 Daily Sales</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={rangeActive ? "date" : "day"} />
            <YAxis />
            <Tooltip formatter={(val) => `₱${Number(val).toLocaleString()}`} />
            <Bar dataKey="earnings" fill="#ff9800" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section">
        <h3 className="section-title">🗓 Weekly Sales (by Week)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyWeekData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip formatter={(val) => `₱${Number(val).toLocaleString()}`} />
            <Bar dataKey="earnings" fill="#ffca28" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best sellers */}
      <h3 className="section-title">🏆 Best Sellers</h3>
      <div className="best-sellers-grid">
        <BestTable title="Top Flavors" rows={bestSellers.flavors} />
        <BestTable title="Top Add-ons" rows={bestSellers.addons} />
        <BestTable title="Top Sizes" rows={bestSellers.sizes} />
      </div>
    </div>
  );
}

/* Small helper components */

function SummaryCard({ title, orders, earnings }) {
  return (
    <div className="overview-card">
      <h4>{title}</h4>
      <p style={{ margin: 0 }}>{orders} Orders</p>
      <div className="overview-total">₱{Number(earnings || 0).toLocaleString()}</div>
    </div>
  );
}

function BestTable({ title, rows }) {
  return (
    <div className="table-box">
      <h4>{title}</h4>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Total</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {rows && rows.length > 0 ? (
            rows.map((r) => (
              <tr key={r.rank + r.name}>
                <td className="rank">{r.rank}</td>
                <td>{r.name}</td>
                <td>{r.count}</td>
                <td className="percent">{r.percent}%</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4} className="no-data">No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

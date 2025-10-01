import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./App.css";

export default function App() {
  const [cups, setCups] = useState({});
  const [straws, setStraws] = useState({});
  const [addons, setAddons] = useState({});
  const [dailyUsage, setDailyUsage] = useState([]);
  const [weeklyUsage, setWeeklyUsage] = useState([]);
  const [monthlyUsage, setMonthlyUsage] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [notifications, setNotifications] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topAddons, setTopAddons] = useState([]);
  const [topSizes, setTopSizes] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [search, setSearch] = useState("");

  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snap) => {
      snap.forEach((docSnap) => {
        if (docSnap.id === "cups") setCups(docSnap.data());
        if (docSnap.id === "straw") setStraws(docSnap.data());
        if (docSnap.id === "add-ons") setAddons(docSnap.data());
      });
    });

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(q, (snap) => {
      let orders = [];
      snap.forEach((docSnap) => orders.push({ id: docSnap.id, ...docSnap.data() }));
      setPurchaseHistory(orders);
      processUsageData(orders);
      processBestSellers(orders);
      processPeakHours(orders);
      detectOrderSpike(orders);

      const revenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
      const items = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
      setTotalSales(revenue);
      setTotalOrders(items);
    });

    return () => {
      unsubInventory();
      unsubOrders();
    };
  }, []);

  function processUsageData(orders) {
    if (!orders.length) return;

    const dailyMap = {};
    const weeklyMap = {};
    const monthlyMap = {};

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const dateObj = order.createdAt.toDate();
      const dateKey = dateObj.toISOString().split("T")[0];
      const weekKey = `W${getWeekNumber(dateObj)}`;
      const monthKey = `${dateObj.getFullYear()}-${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}`;

      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + order.quantity;
      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + order.quantity;
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + order.quantity;
    });

    setDailyUsage(
      Object.entries(dailyMap).map(([date, orders]) => ({ date, orders }))
    );
    setWeeklyUsage(
      Object.entries(weeklyMap).map(([date, orders]) => ({ date, orders }))
    );
    setMonthlyUsage(
      Object.entries(monthlyMap).map(([date, orders]) => ({ date, orders }))
    );
  }

  function processBestSellers(orders) {
    const productSales = {};
    const addonSales = {};
    const sizeSales = {};
    orders.forEach((o) => {
      if (o.flavor) productSales[o.flavor] = (productSales[o.flavor] || 0) + o.quantity;
      if (o.addOns) o.addOns.forEach((a) => addonSales[a] = (addonSales[a] || 0) + o.quantity);
      if (o.size) sizeSales[o.size] = (sizeSales[o.size] || 0) + o.quantity;
    });

    setTopProducts(Object.entries(productSales)
      .map(([flavor, sales]) => ({ flavor, sales }))
      .sort((a,b)=>b.sales-a.sales));

    setTopAddons(Object.entries(addonSales)
      .map(([addOn, sales]) => ({ addOn, sales }))
      .sort((a,b)=>b.sales-a.sales));

    setTopSizes(Object.entries(sizeSales)
      .map(([size, sales]) => ({ size, sales }))
      .sort((a,b)=>b.sales-a.sales));
  }

  function processPeakHours(orders) {
    const hourMap = {};
    orders.forEach((order) => {
      if (!order.createdAt) return;
      const hour = order.createdAt.toDate().getHours();
      hourMap[hour] = (hourMap[hour] || 0) + order.quantity;
    });

    const data = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: hourMap[i] || 0,
    }));
    setPeakHours(data);
  }

  function detectOrderSpike(orders) {
    const now = new Date();
    const lastHourOrders = orders.filter(
      (o) =>
        o.createdAt &&
        now - o.createdAt.toDate() <= 60 * 60 * 1000
    );
    if (lastHourOrders.length > 10) {
      addNotification("⚡ High order spike in the past hour!");
    }
  }

  function getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  const handleStockChange = async (collectionName, field, value) => {
    try {
      await updateDoc(doc(db, "inventory", collectionName), {
        [field]: Number(value),
      });

      const numVal = Number(value);
      if (
        (collectionName === "cups" && numVal < 20) ||
        (collectionName === "straw" && numVal < 20) ||
        (collectionName === "add-ons" && numVal < 10)
      ) {
        addNotification(`⚠️ Low stock: ${field}`);
      }
    } catch (err) {
      console.error("Error updating stock:", err);
    }
  };

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      5000
    );
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title">Tiger Mango</h2>
        <button onClick={() => setActiveTab("inventory")}>📦 Inventory</button>
        <button onClick={() => setActiveTab("charts")}>📊 Charts</button>
        <button onClick={() => setActiveTab("history")}>📝 Purchase History</button>
      </div>

      <div className="notifications">
        {notifications.map((n) => (
          <div key={n.id} className="notification">{n.message}</div>
        ))}
      </div>

      <div className="main-content">

        {activeTab === "inventory" && (
          <div className="grid">
            <div className="card summary">
              <h2>📊 Business Summary</h2>
              <p><strong>Total Sales:</strong> ₱{totalSales}</p>
              <p><strong>Total Drinks Sold:</strong> {totalOrders}</p>
            </div>

            <div className="card">
              <h2>🧃 Cups</h2>
              <ul>
                {["tall", "grande", "liter"].map((key) => (
                  <li key={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                    <input
                      type="number"
                      className={cups[key] < 20 ? "low-stock" : ""}
                      defaultValue={cups[key] ?? 0}
                      onBlur={(e) =>
                        handleStockChange("cups", key, e.target.value)
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>🥤 Straws</h2>
              <ul>
                {["regular", "big"].map((key) => (
                  <li key={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                    <input
                      type="number"
                      className={straws[key] < 20 ? "low-stock" : ""}
                      defaultValue={straws[key] ?? 0}
                      onBlur={(e) =>
                        handleStockChange("straw", key, e.target.value)
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>🍧 Add-ons</h2>
              <ul>
                {Object.keys(addons)
                  .sort()
                  .map((key) => (
                    <li key={key}>
                      {key.replace(/-/g, " ").replace(/\b\w/g, (c) =>
                        c.toUpperCase()
                      )}
                      :{" "}
                      <input
                        type="number"
                        className={addons[key] < 10 ? "low-stock" : ""}
                        defaultValue={addons[key] ?? 0}
                        onBlur={(e) =>
                          handleStockChange("add-ons", key, e.target.value)
                        }
                      />
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <div className="grid">
            <div className="card chart-card">
              <h2>📅 Daily Usage</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#E53935" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card chart-card">
              <h2>📈 Weekly Usage</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#FFD700" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card chart-card">
              <h2>📊 Monthly Usage</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#4CAF50" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2>⭐ Best Selling Flavors</h2>
              <ul>{topProducts.map(p=> <li key={p.flavor}>{p.flavor}: <strong>{p.sales}</strong></li>)}</ul>
            </div>

            <div className="card">
              <h2>🍧 Best Selling Add-ons</h2>
              <ul>{topAddons.map(a=> <li key={a.addOn}>{a.addOn}: <strong>{a.sales}</strong></li>)}</ul>
            </div>

            <div className="card">
              <h2>🥤 Best Selling Sizes</h2>
              <ul>{topSizes.map(s=> <li key={s.size}>{s.size}: <strong>{s.sales}</strong></li>)}</ul>
            </div>

            <div className="card chart-card">
              <h2>⏰ Peak Hours</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="card">
            <h2>📝 Purchase History</h2>
            <input
              className="history-search"
              type="text"
              placeholder="Search by flavor or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <table className="history-table">
              <thead>
                <tr>
                  <th>Flavor</th>
                  <th>Size</th>
                  <th>Add-ons</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory
                  .filter(o =>
                    o.flavor?.toLowerCase().includes(search.toLowerCase()) ||
                    o.createdAt?.toDate().toLocaleDateString().includes(search)
                  )
                  .map((o) => (
                  <tr key={o.id}>
                    <td>{o.flavor}</td>
                    <td>{o.size}</td>
                    <td>{o.addOns?.join(", ") || "-"}</td>
                    <td>{o.quantity}</td>
                    <td>₱{o.price}</td>
                    <td>{o.createdAt ? o.createdAt.toDate().toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "./firebase";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
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
  const [stockLogs, setStockLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [salesData, setSalesData] = useState({
    bestSellingFlavors: [],
    bestSellingSizes: [],
    bestSellingAddons: [],
    bestSellingCups: [],
    dailyReport: [],
    weeklyReport: [],
    monthlyReport: []
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    // ✅ Inventory listener
    const unsubInventory = onSnapshot(collection(db, "inventory"), (snap) => {
      snap.forEach((docSnap) => {
        if (docSnap.id === "cups") setCups(docSnap.data());
        if (docSnap.id === "straw") setStraws(docSnap.data());
        if (docSnap.id === "add-ons") setAddons(docSnap.data());
      });
    });

    // ✅ Orders (for usage + history)
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      let orders = [];
      snap.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPurchaseHistory(orders);
      processUsageData(orders);
      processSalesAnalytics(orders);
    });

    // ✅ Stock Logs
    const qLogs = query(collection(db, "stock-logs"), orderBy("timestamp", "desc"));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      let logs = [];
      snap.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setStockLogs(logs);
    });

    return () => {
      unsubInventory();
      unsubOrders();
      unsubLogs();
    };
  }, []);

  // ✅ Process usage data for time-based charts
  function processUsageData(orders) {
    if (!orders.length) return;

    const dailyMap = {};
    const weeklyMap = {};
    const monthlyMap = {};

    orders.forEach((order) => {
      if (!order.createdAt) return;
      const dateObj = order.createdAt.toDate();
      const dateKey = dateObj.toLocaleDateString();
      const weekKey = `Week ${getWeekNumber(dateObj)}`;
      const monthKey = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + order.quantity;
      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + order.quantity;
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + order.quantity;
    });

    setDailyUsage(Object.entries(dailyMap).map(([date, orders]) => ({ date, orders })).slice(-7));
    setWeeklyUsage(Object.entries(weeklyMap).map(([date, orders]) => ({ date, orders })).slice(-8));
    setMonthlyUsage(Object.entries(monthlyMap).map(([date, orders]) => ({ date, orders })).slice(-6));
  }

  // ✅ Process comprehensive sales analytics
  function processSalesAnalytics(orders) {
    if (!orders.length) return;

    const flavorSales = {};
    const sizeSales = {};
    const addonSales = {};
    const cupSales = {
      "Tall": 0,
      "Grande": 0,
      "1 Liter": 0
    };

    const dailySales = {};
    const weeklySales = {};
    const monthlySales = {};

    orders.forEach((order) => {
      if (!order.createdAt) return;
      const dateObj = order.createdAt.toDate();
      
      // Flavor sales
      flavorSales[order.flavor] = (flavorSales[order.flavor] || 0) + order.quantity;
      
      // Size sales
      sizeSales[order.size] = (sizeSales[order.size] || 0) + order.quantity;
      
      // Cup type sales (based on size)
      if (order.size === "TALL") cupSales["Tall"] += order.quantity;
      if (order.size === "GRANDE") cupSales["Grande"] += order.quantity;
      if (order.size === "1LITER") cupSales["1 Liter"] += order.quantity;
      
      // Add-on sales
      if (order.addOns && order.addOns.length > 0) {
        order.addOns.forEach(addon => {
          addonSales[addon] = (addonSales[addon] || 0) + order.quantity;
        });
      }

      // Time-based sales
      const dayKey = dateObj.toLocaleDateString();
      const weekKey = `Week ${getWeekNumber(dateObj)}`;
      const monthKey = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      dailySales[dayKey] = (dailySales[dayKey] || 0) + order.quantity;
      weeklySales[weekKey] = (weeklySales[weekKey] || 0) + order.quantity;
      monthlySales[monthKey] = (monthlySales[monthKey] || 0) + order.quantity;
    });

    setSalesData({
      bestSellingFlavors: Object.entries(flavorSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5),
      
      bestSellingSizes: Object.entries(sizeSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity),
      
      bestSellingAddons: Object.entries(addonSales)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 6),
      
      bestSellingCups: Object.entries(cupSales)
        .map(([name, quantity]) => ({ name, quantity })),
      
      dailyReport: Object.entries(dailySales)
        .map(([date, quantity]) => ({ date, quantity }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7),
      
      weeklyReport: Object.entries(weeklySales)
        .map(([week, quantity]) => ({ week, quantity }))
        .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]))
        .slice(-8),
      
      monthlyReport: Object.entries(monthlySales)
        .map(([month, quantity]) => ({ month, quantity }))
        .sort((a, b) => new Date(a.month) - new Date(b.month))
        .slice(-6)
    });
  }

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  // ✅ Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          <p className="intro" style={{ color: payload[0].color }}>
            {`Sales: ${payload[0].value} orders`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">Tiger Mango</h2>
        <button onClick={() => setActiveTab("inventory")}>📦 Inventory</button>
        <button onClick={() => setActiveTab("analytics")}>📊 Sales Analytics</button>
        <button onClick={() => setActiveTab("history")}>📝 Purchase History</button>
        <button onClick={() => setActiveTab("logs")}>📜 Stock Logs</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === "inventory" && (
          <div className="grid">
            <div className="card">
              <h2>🧃 Cups</h2>
              <ul>
                <li>Tall: {cups.tall ?? 0}</li>
                <li>Grande: {cups.grande ?? 0}</li>
                <li>1 Liter: {cups.liter ?? 0}</li>
              </ul>
            </div>
            <div className="card">
              <h2>🥤 Straws</h2>
              <ul>
                <li>Regular: {straws.regular ?? 0}</li>
                <li>Big: {straws.big ?? 0}</li>
              </ul>
            </div>
            <div className="card">
              <h2>🍧 Add-ons</h2>
              <ul>
                {Object.keys(addons).sort().map((key) => (
                  <li key={key}>
                    {key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: {addons[key]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-container">
            <h1>📊 Sales Analytics Dashboard</h1>
            
            {/* Sales Trends Section */}
            <div className="section">
              <h2>📈 Sales Trends</h2>
              <div className="chart-grid">
                <div className="chart-card">
                  <h3>Daily Sales (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salesData.dailyReport}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="quantity" fill="#8884d8" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Weekly Sales Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesData.weeklyReport}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="quantity" stroke="#82ca9d" name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Monthly Sales</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salesData.monthlyReport}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="quantity" fill="#ffc658" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Best Sellers Section */}
            <div className="section">
              <h2>🏆 Best Sellers</h2>
              <div className="chart-grid">
                <div className="chart-card">
                  <h3>Top 5 Flavors</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={salesData.bestSellingFlavors}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantity"
                      >
                        {salesData.bestSellingFlavors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Popular Sizes</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salesData.bestSellingSizes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Cup Types Sold</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={salesData.bestSellingCups}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="quantity"
                      >
                        {salesData.bestSellingCups.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Add-ons & Detailed Reports */}
            <div className="section">
              <h2>🍧 Add-ons Performance</h2>
              <div className="chart-grid">
                <div className="chart-card">
                  <h3>Top Add-ons</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salesData.bestSellingAddons} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card list-card">
                  <h3>📋 Quick Stats</h3>
                  <div className="stats-list">
                    <div className="stat-item">
                      <strong>Total Orders:</strong> {purchaseHistory.length}
                    </div>
                    <div className="stat-item">
                      <strong>Best Selling Flavor:</strong> 
                      {salesData.bestSellingFlavors[0]?.name || "N/A"}
                    </div>
                    <div className="stat-item">
                      <strong>Most Popular Size:</strong> 
                      {salesData.bestSellingSizes[0]?.name || "N/A"}
                    </div>
                    <div className="stat-item">
                      <strong>Top Add-on:</strong> 
                      {salesData.bestSellingAddons[0]?.name || "N/A"}
                    </div>
                    <div className="stat-item">
                      <strong>Today's Sales:</strong> 
                      {salesData.dailyReport[salesData.dailyReport.length - 1]?.quantity || 0}
                    </div>
                  </div>
                </div>

                <div className="chart-card list-card">
                  <h3>📊 Detailed Best Sellers</h3>
                  <div className="detailed-list">
                    <div className="list-section">
                      <h4>Flavors:</h4>
                      {salesData.bestSellingFlavors.map((item, index) => (
                        <div key={item.name} className="list-item">
                          <span>{index + 1}. {item.name}</span>
                          <span>{item.quantity} sold</span>
                        </div>
                      ))}
                    </div>
                    <div className="list-section">
                      <h4>Add-ons:</h4>
                      {salesData.bestSellingAddons.map((item, index) => (
                        <div key={item.name} className="list-item">
                          <span>{index + 1}. {item.name}</span>
                          <span>{item.quantity} orders</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="card">
            <h2>📝 Purchase History</h2>
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
                {purchaseHistory.map((order) => (
                  <tr key={order.id}>
                    <td>{order.flavor}</td>
                    <td>{order.size}</td>
                    <td>{order.addOns?.join(", ") || "-"}</td>
                    <td>{order.quantity}</td>
                    <td>₱{order.price}</td>
                    <td>{order.createdAt ? order.createdAt.toDate().toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="card">
            <h2>📜 Stock Update Logs</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>New Value</th>
                  <th>User</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stockLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.item}</td>
                    <td>{log.newValue}</td>
                    <td>{log.user}</td>
                    <td>{log.timestamp ? log.timestamp.toDate().toLocaleString() : "-"}</td>
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
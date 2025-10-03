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
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [salesData, setSalesData] = useState({
    bestSellingFlavors: [],
    bestSellingSizes: [],
    bestSellingAddons: [],
    bestSellingCups: [],
    dailyReport: [],
    weeklyReport: [],
    monthlyReport: [],
    todaySales: 0,
    thisWeekSales: 0,
    thisMonthSales: 0,
    todayEarnings: 0,
    thisWeekEarnings: 0,
    thisMonthEarnings: 0
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [addOnFilter, setAddOnFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Get unique values for filters
  const uniqueSizes = [...new Set(purchaseHistory.map(order => order.size))];
  const uniqueAddOns = [...new Set(purchaseHistory.flatMap(order => order.addOns || []))];
  const uniqueDates = [...new Set(purchaseHistory
    .filter(order => order.createdAt)
    .map(order => order.createdAt.toDate().toLocaleDateString())
  )].sort((a, b) => new Date(b) - new Date(a));

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setFilteredHistory(orders); // Initialize filtered history
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

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, sizeFilter, addOnFilter, dateFilter, startDate, endDate, purchaseHistory]);

  const applyFilters = () => {
    let filtered = [...purchaseHistory];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.flavor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.addOns && order.addOns.some(addon => 
          addon.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        order.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Size filter
    if (sizeFilter !== "all") {
      filtered = filtered.filter(order => order.size === sizeFilter);
    }

    // Add-on filter
    if (addOnFilter !== "all") {
      filtered = filtered.filter(order => 
        order.addOns && order.addOns.includes(addOnFilter)
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      filtered = filtered.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = order.createdAt.toDate().toLocaleDateString();
        return orderDate === dateFilter;
      });
    }

    // Date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = order.createdAt.toDate();
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include entire end date
        
        return orderDate >= start && orderDate <= end;
      });
    }

    setFilteredHistory(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSizeFilter("all");
    setAddOnFilter("all");
    setDateFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

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

    const today = new Date().toLocaleDateString();
    const currentWeek = `Week ${getWeekNumber(new Date())}`;
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    let todaySales = 0;
    let thisWeekSales = 0;
    let thisMonthSales = 0;
    let todayEarnings = 0;
    let thisWeekEarnings = 0;
    let thisMonthEarnings = 0;

    const weeklyData = {};
    const monthlyData = {};

    orders.forEach((order) => {
      if (!order.createdAt) return;
      const dateObj = order.createdAt.toDate();
      const orderDate = dateObj.toLocaleDateString();
      const orderWeek = `Week ${getWeekNumber(dateObj)}`;
      const orderMonth = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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

      // Today's sales and earnings
      if (orderDate === today) {
        todaySales += order.quantity;
        todayEarnings += order.price || 0;
      }

      // This week's sales and earnings
      if (orderWeek === currentWeek) {
        thisWeekSales += order.quantity;
        thisWeekEarnings += order.price || 0;
      }

      // This month's sales and earnings
      if (orderMonth === currentMonth) {
        thisMonthSales += order.quantity;
        thisMonthEarnings += order.price || 0;
      }

      // Weekly data for chart
      weeklyData[orderWeek] = (weeklyData[orderWeek] || 0) + order.quantity;

      // Monthly data for chart
      monthlyData[orderMonth] = (monthlyData[orderMonth] || 0) + order.quantity;
    });

    // Prepare weekly report (last 8 weeks)
    const weeklyReport = Object.entries(weeklyData)
      .map(([week, quantity]) => ({ week, quantity }))
      .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]))
      .slice(-8);

    // Prepare monthly report (last 6 months)
    const monthlyReport = Object.entries(monthlyData)
      .map(([month, quantity]) => ({ month, quantity }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-6);

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
      
      dailyReport: [{ date: "Today", quantity: todaySales }],
      
      weeklyReport: weeklyReport,
      
      monthlyReport: monthlyReport,

      todaySales: todaySales,
      thisWeekSales: thisWeekSales,
      thisMonthSales: thisMonthSales,
      todayEarnings: todayEarnings,
      thisWeekEarnings: thisWeekEarnings,
      thisMonthEarnings: thisMonthEarnings
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
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            {!sidebarCollapsed && "Tiger Mango"}
            {sidebarCollapsed && "TM"}
          </h2>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <button 
          onClick={() => handleTabClick("inventory")} 
          className={activeTab === "inventory" ? "active" : ""}
        >
          {sidebarCollapsed ? "📦" : "📦 Inventory"}
        </button>
        <button 
          onClick={() => handleTabClick("analytics")} 
          className={activeTab === "analytics" ? "active" : ""}
        >
          {sidebarCollapsed ? "📊" : "📊 Sales Analytics"}
        </button>
        <button 
          onClick={() => handleTabClick("history")} 
          className={activeTab === "history" ? "active" : ""}
        >
          {sidebarCollapsed ? "📝" : "📝 Purchase History"}
        </button>
        <button 
          onClick={() => handleTabClick("logs")} 
          className={activeTab === "logs" ? "active" : ""}
        >
          {sidebarCollapsed ? "📜" : "📜 Stock Logs"}
        </button>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Mobile header with toggle */}
        {isMobile && (
          <div className="mobile-header">
            <button className="mobile-sidebar-toggle" onClick={toggleSidebar}>
              ☰
            </button>
            <h1 className="mobile-title">
              {activeTab === "inventory" && "Inventory"}
              {activeTab === "analytics" && "Sales Analytics"}
              {activeTab === "history" && "Purchase History"}
              {activeTab === "logs" && "Stock Logs"}
            </h1>
          </div>
        )}

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
            {!isMobile && <h1>📊 Sales Analytics Dashboard</h1>}
            
            {/* Charts Section with Integrated Orders and Earnings */}
            <div className="section">
              <h2>📊 Sales Overview</h2>
              <div className="chart-grid">
                <div className="chart-card">
                  <h3>Today's Sales</h3>
                  <div className="chart-summary">
                    <div className="summary-number">{salesData.todaySales}</div>
                    <div className="summary-label">Total Orders</div>
                  </div>
                  <div className="earnings-summary">
                    <div className="earnings-amount">₱{salesData.todayEarnings}</div>
                    <div className="earnings-label">Total Earnings</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart 
                      data={salesData.dailyReport}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="quantity" fill="#8884d8" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Weekly Sales</h3>
                  <div className="chart-summary">
                    <div className="summary-number">{salesData.thisWeekSales}</div>
                    <div className="summary-label">Total Orders</div>
                  </div>
                  <div className="earnings-summary">
                    <div className="earnings-amount">₱{salesData.thisWeekEarnings}</div>
                    <div className="earnings-label">Total Earnings</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart 
                      data={salesData.weeklyReport}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="quantity" fill="#82ca9d" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>Monthly Sales</h3>
                  <div className="chart-summary">
                    <div className="summary-number">{salesData.thisMonthSales}</div>
                    <div className="summary-label">Total Orders</div>
                  </div>
                  <div className="earnings-summary">
                    <div className="earnings-amount">₱{salesData.thisMonthEarnings}</div>
                    <div className="earnings-label">Total Earnings</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart 
                      data={salesData.monthlyReport}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="quantity" fill="#ffc658" name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Best Sellers Section with Add-ons */}
            <div className="section">
              <h2>🏆 Best Sellers</h2>
              <div className="best-sellers-section">
                <div className="best-sellers-table">
                  <h3>Top Flavors</h3>
                  <div className="table-container">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Flavor</th>
                          <th>Total Sold</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.bestSellingFlavors.map((item, index) => {
                          const totalFlavorOrders = salesData.bestSellingFlavors.reduce((sum, flavor) => sum + flavor.quantity, 0);
                          const percentage = totalFlavorOrders > 0 ? ((item.quantity / totalFlavorOrders) * 100).toFixed(1) : 0;
                          
                          return (
                            <tr key={item.name}>
                              <td className="rank-cell">{index + 1}</td>
                              <td className="name-cell">{item.name}</td>
                              <td className="quantity-cell">{item.quantity}</td>
                              <td className="percentage-cell">{percentage}%</td>
                            </tr>
                          );
                        })}
                        {salesData.bestSellingFlavors.length === 0 && (
                          <tr>
                            <td colSpan="4" className="no-results">
                              No flavor data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="top-addons-table">
                  <h3>Top Add-ons</h3>
                  <div className="table-container">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Add-on Name</th>
                          <th>Total Orders</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesData.bestSellingAddons.map((item, index) => {
                          const totalAddonOrders = salesData.bestSellingAddons.reduce((sum, addon) => sum + addon.quantity, 0);
                          const percentage = totalAddonOrders > 0 ? ((item.quantity / totalAddonOrders) * 100).toFixed(1) : 0;
                          
                          return (
                            <tr key={item.name}>
                              <td className="rank-cell">{index + 1}</td>
                              <td className="name-cell">{item.name}</td>
                              <td className="quantity-cell">{item.quantity}</td>
                              <td className="percentage-cell">{percentage}%</td>
                            </tr>
                          );
                        })}
                        {salesData.bestSellingAddons.length === 0 && (
                          <tr>
                            <td colSpan="4" className="no-results">
                              No add-on data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="card">
            <h2>📝 Purchase History</h2>
            
            {/* Search and Filters */}
            <div className="filters-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search by flavor, add-ons, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <label>Size:</label>
                  <select 
                    value={sizeFilter} 
                    onChange={(e) => setSizeFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Sizes</option>
                    {uniqueSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Add-on:</label>
                  <select 
                    value={addOnFilter} 
                    onChange={(e) => setAddOnFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Add-ons</option>
                    {uniqueAddOns.map(addon => (
                      <option key={addon} value={addon}>{addon}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Specific Date:</label>
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Dates</option>
                    {uniqueDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>

                <button onClick={clearFilters} className="clear-filters-btn">
                  🗑️ Clear Filters
                </button>
              </div>

              <div className="date-range-filter">
                <h4>Date Range Filter:</h4>
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label>From:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="date-input"
                    />
                  </div>
                  <div className="date-input-group">
                    <label>To:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="date-input"
                    />
                  </div>
                </div>
              </div>

              <div className="results-info">
                Showing {filteredHistory.length} of {purchaseHistory.length} orders
                {filteredHistory.length !== purchaseHistory.length && (
                  <span className="filter-active"> • Filters Active</span>
                )}
              </div>
            </div>

            <div className="table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Flavor</th>
                    <th>Size</th>
                    <th>Add-ons</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-results">
                        {purchaseHistory.length === 0 ? 'No orders yet' : 'No orders match your filters'}
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((order) => (
                      <tr key={order.id}>
                        <td className="flavor-cell">{order.flavor}</td>
                        <td className="size-cell">{order.size}</td>
                        <td className="addons-cell">
                          {order.addOns?.join(", ") || "-"}
                        </td>
                        <td className="quantity-cell">{order.quantity}</td>
                        <td className="price-cell">₱{order.price}</td>
                        <td className="date-cell">
                          {order.createdAt ? order.createdAt.toDate().toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="card">
            <h2>📜 Stock Update Logs</h2>
            <div className="table-container">
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
          </div>
        )}
      </div>
    </div>
  );
}
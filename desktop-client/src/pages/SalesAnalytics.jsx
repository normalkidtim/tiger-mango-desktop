import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
// ✅ --- (NEW) Import chart components ---
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import '../assets/styles/tables.css';
import '../assets/styles/sales-analytics.css';

// Helper function to format prices for display
const formatPrice = (price) => `₱${(price || 0).toFixed(2)}`;

// Helper function to format axis ticks in charts
const formatAxisPrice = (tick) => `₱${tick}`;

const SalesAnalytics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "orders"), 
      where("status", "==", "Completed"),
      orderBy("createdAt", "asc") // Order by date for the line chart
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const completedOrders = [];
      querySnapshot.forEach((doc) => {
        completedOrders.push({ id: doc.id, ...doc.data() });
      });
      setOrders(completedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching completed orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Calculate Statistics ---
  const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // --- Calculate Data for Charts ---

  // 1. Sales over time (grouped by day)
  const salesByDay = orders.reduce((acc, order) => {
    if (order.createdAt && order.createdAt.toDate) {
      const date = order.createdAt.toDate().toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += order.totalPrice;
    }
    return acc;
  }, {});

  const salesChartData = Object.keys(salesByDay).map(date => ({
    date,
    sales: salesByDay[date],
  }));

  // 2. Best-selling items
  const itemSales = {};
  orders.forEach(order => {
    // Check if order.items is a valid array
    if (Array.isArray(order.items)) {
      order.items.forEach(item => {
        const itemName = item.name || 'Unknown Item';
        if (!itemSales[itemName]) {
          itemSales[itemName] = { quantity: 0, sales: 0 };
        }
        itemSales[itemName].quantity += item.quantity || 1;
        itemSales[itemName].sales += item.finalPrice || item.basePrice || 0;
      });
    }
  });

  const bestSellers = Object.entries(itemSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity);

  // Take top 7 for the bar chart to keep it clean
  const bestSellersChartData = bestSellers.slice(0, 7).reverse();

  if (loading) {
    return <div className="page-container">Loading sales data...</div>;
  }

  return (
    <div className="page-container">
      <h2>Sales Analytics</h2>
      <p>Summary of all completed sales from your milk tea shop.</p>

      {/* Summary Stat Boxes */}
      <div className="stats-grid">
        <div className="stat-box">
          <h3 className="stat-title">Total Sales</h3>
          <p className="stat-value">{formatPrice(totalSales)}</p>
        </div>
        <div className="stat-box">
          <h3 className="stat-title">Total Completed Orders</h3>
          <p className="stat-value">{totalOrders}</p>
        </div>
        <div className="stat-box">
          <h3 className="stat-title">Average Order Value</h3>
          <p className="stat-value">{formatPrice(averageOrderValue)}</p>
        </div>
      </div>

      {/* ✅ --- (NEW) Charts Section --- */}
      <div className="charts-grid">
        {/* Sales Over Time Chart */}
        <div className="chart-box">
          <h3>Sales Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatAxisPrice} />
              <Tooltip formatter={(value) => formatPrice(value)} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#0052cc" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Selling Items Chart */}
        <div className="chart-box">
          <h3>Top 7 Best Sellers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bestSellersChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => `${value} units`} />
              <Legend />
              <Bar dataKey="quantity" fill="#00875a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Sellers Table */}
      <div className="table-box">
        <h3>All Items Sold (By Quantity)</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity Sold</th>
              <th>Total Sales Value</th>
            </tr>
          </thead>
          <tbody>
            {bestSellers.length === 0 && (
              <tr>
                <td colSpan="3" className="no-data">No completed sales yet.</td>
              </tr>
            )}
            {bestSellers.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.sales)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesAnalytics;
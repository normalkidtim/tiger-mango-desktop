import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../assets/styles/inventory.css";

export default function Inventory() {
  const [cups, setCups] = useState({});
  const [straw, setStraw] = useState({});
  const [addons, setAddons] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const cupsSnap = await getDoc(doc(db, "inventory", "cups"));
        const strawSnap = await getDoc(doc(db, "inventory", "straw"));
        const addonsSnap = await getDoc(doc(db, "inventory", "add-ons"));

        if (cupsSnap.exists()) setCups(cupsSnap.data());
        if (strawSnap.exists()) setStraw(strawSnap.data());
        if (addonsSnap.exists()) setAddons(addonsSnap.data());
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

 const renderTable = (title, data) => {
  let icon = "📦";
  if (title === "Cups") icon = "🥤";
  if (title === "Straws") icon = "🧃";
  if (title === "Add-ons") icon = "🍧";

  return (
    <div className="inventory-card">
      <h3>
        <span>{icon}</span> {title}
      </h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(data).length > 0 ? (
            Object.entries(data).map(([name, stock]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{stock}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="no-items">
                No items
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <span role="img" aria-label="box">
          📦
        </span>{" "}
        Inventory Overview
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="inventory-grid">
          {renderTable("Cups", cups)}
          {renderTable("Straws", straw)}
          {renderTable("Add-ons", addons)}
        </div>
      )}
    </div>
  );
}

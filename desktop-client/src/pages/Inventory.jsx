// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { FiGrid, FiBox, FiFilter, FiPackage } from "react-icons/fi";
import "../assets/styles/inventory.css";

// Helper function to format names remains the same
const formatItemName = (category, key) => {
  const name = key.replace(/-/g, ' ');
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  return `${capitalized}`; // We no longer need the category prefix
};

const processInventoryDoc = (docSnap, categoryName) => {
  if (!docSnap.exists()) {
    return [];
  }
  const data = docSnap.data();
  return Object.entries(data).map(([key, value]) => ({
    id: key,
    name: formatItemName(categoryName, key),
    stock: value,
  }));
};

export default function Inventory() {
  const [cups, setCups] = useState([]);
  const [straws, setStraws] = useState([]);
  const [addons, setAddons] = useState([]);
  
  useEffect(() => {
    const unsubCups = onSnapshot(doc(db, "inventory", "cups"), (docSnap) => {
      setCups(processInventoryDoc(docSnap, "Cups"));
    });
    const unsubStraws = onSnapshot(doc(db, "inventory", "straw"), (docSnap) => {
      setStraws(processInventoryDoc(docSnap, "Straws"));
    });
    const unsubAddons = onSnapshot(doc(db, "inventory", "add-ons"), (docSnap) => {
      setAddons(processInventoryDoc(docSnap, "Add-ons"));
    });

    return () => {
      unsubCups();
      unsubStraws();
      unsubAddons();
    };
  }, []);

  return (
    <div>
      <div className="page-header">
        <FiGrid />
        <h2>Inventory Overview</h2>
      </div>
      <div className="page-header-underline"></div>

      <div className="inventory-sections">
        {/* Pass an icon to each card for the new design */}
        <InventoryCard title="Cups" items={cups} icon={<FiBox />} />
        <InventoryCard title="Straws" items={straws} icon={<FiFilter />} />
        <InventoryCard title="Add-ons" items={addons} icon={<FiPackage />} />
      </div>
    </div>
  );
}

// Renamed and updated the helper component
function InventoryCard({ title, items, icon }) {
  return (
    <div className="inventory-card">
      <div className="inventory-card-header">{icon}{title}</div>
      {items.length > 0 ? (
        <div className="inventory-item-list">
          {items.map((item) => (
            <div className="inventory-item" key={item.id}>
              <span className="inventory-item-name">{item.name}</span>
              <div className="inventory-item-stock">
                {/* This input is read-only to match your current functionality */}
                <input type="number" value={item.stock} readOnly />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-items-message">
          No items found
        </p>
      )}
    </div>
  );
}
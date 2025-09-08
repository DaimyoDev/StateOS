import React, { useState, useRef, useEffect } from "react";

const SubtabDropdown = ({ tabs, activeTab, onTabChange, label = "Select Subtab" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label || label;

  return (
    <div className="subtab-dropdown-container" ref={dropdownRef}>
      <button 
        type="button"
        className="subtab-dropdown-button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {activeTabLabel}
        <span className="dropdown-arrow">▼</span>
      </button>
      {isOpen && (
        <div className="subtab-dropdown-menu">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`subtab-dropdown-item ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange(tab.id);
                setIsOpen(false);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubtabDropdown;
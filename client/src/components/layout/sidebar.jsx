import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    {
      section: "MANAGEMENT",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: "fas fa-chart-pie" },
        { name: "Employees", path: "/employees", icon: "fas fa-users" },
        { name: "Departments", path: "/departments", icon: "fas fa-building" },
        { name: "Roles", path: "/roles", icon: "fas fa-user-tag" },
      ]
    },
    {
      section: "REPORTS", 
      items: [
        { name: "Attendance", path: "/attendance", icon: "fas fa-clock" },
        { name: "Reports", path: "/reports", icon: "fas fa-chart-bar" },
      ]
    },
    {
      section: "SETTINGS",
      items: [
        { name: "Settings", path: "/settings", icon: "fas fa-cog" },
      ]
    }
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-60'} bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300`}>
      {/* Logo Section */}
      <div className="flex items-center px-4 py-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <i className="fas fa-cube text-white text-lg"></i>
        </div>
        {!isCollapsed && (
          <span className="text-xl font-bold text-gray-800 ml-3">Arnifi</span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-gray-500`}></i>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {!isCollapsed && (
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-8 first:mt-0">
                {section.section}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = location === item.path || (item.path === "/dashboard" && location === "/");
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.name : ''}
                >
                  <i className={`${item.icon} text-lg`}></i>
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}

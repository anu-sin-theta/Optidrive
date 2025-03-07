// src/components/ui/sidebar.js
import React from 'react';

export const Sidebar = ({ children, className }) => {
  return (
    <aside className={`sidebar ${className}`}>
      {children}
    </aside>
  );
};

export const SidebarContent = ({ children }) => {
  return (
    <div className="sidebar-content">
      {children}
    </div>
  );
};

export const SidebarGroup = ({ children }) => {
  return (
    <div className="sidebar-group">
      {children}
    </div>
  );
};

export const SidebarGroupContent = ({ children }) => {
  return (
    <div className="sidebar-group-content">
      {children}
    </div>
  );
};

export const SidebarGroupLabel = ({ children }) => {
  return (
    <div className="sidebar-group-label">
      {children}
    </div>
  );
};

export const SidebarMenu = ({ children }) => {
  return (
    <ul className="sidebar-menu">
      {children}
    </ul>
  );
};

export const SidebarMenuItem = ({ children }) => {
  return (
    <li className="sidebar-menu-item">
      {children}
    </li>
  );
};

export const SidebarMenuButton = ({ children, ...props }) => {
  return (
    <button className="sidebar-menu-button" {...props}>
      {children}
    </button>
  );
};

export const SidebarProvider = ({ children }) => {
  return (
    <div className="sidebar-provider">
      {children}
    </div>
  );
};
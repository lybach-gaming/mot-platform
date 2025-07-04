'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { NavigationItem } from '../types/navigation';

interface SidebarProps {
  navigation: NavigationItem[];
  collapsed?: boolean;
}

export default function Sidebar({ navigation, collapsed }: SidebarProps) {
  return (
    <nav className="h-full w-full flex flex-col bg-sidebar text-white">
      <ul className="py-4">
        {navigation.map((item) => (
          <SidebarItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </ul>
    </nav>
  );
}

function SidebarItem({
  item,
  isPrimary = true,
  collapsed = false,
}: {
  item: NavigationItem;
  isPrimary?: boolean;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className="sidebar-item">
      <div
        className={`
          sidebar-item-row
          flex items-center w-full ${collapsed ? 'justify-center' : 'justify-between'}
          ${
            isPrimary
              ? `${collapsed ? 'px-2 py-3' : 'px-4 py-3'}`
              : 'pl-12 py-2'
          }
          hover:bg-[var(--color-accent)] hover:text-white
          transition-colors duration-200
          cursor-pointer
        `}
      >
        <div className="flex items-center space-x-2 w-full">
          {item.url ? (
            <Link
              href={item.url}
              className={`flex cursor-default w-full ${
                collapsed ? 'justify-center' : 'items-center space-x-2'
              }`}
            >
              {item.icon && (
                <i
                  className={`${item.icon} ${
                    collapsed ? 'text-2xl' : 'mx-2 text-base'
                  }`}
                ></i>
              )}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ) : (
            <div
              className={`flex cursor-default w-full ${
                collapsed ? 'justify-center' : 'items-center space-x-2'
              }`}
            >
              {item.icon && (
                <i
                  className={`${item.icon} ${
                    collapsed ? 'text-2xl pl-2' : 'mx-2 text-base'
                  }`}
                ></i>
              )}
              {!collapsed && <span>{item.label}</span>}
            </div>
          )}
        </div>

        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className={`text-white focus:outline-none ml-2 transition-transform duration-200 ${
              open ? 'rotate-90' : ''
            }`}
            aria-label="Toggle Submenu"
          >
            {!collapsed && <i className="fas fa-chevron-right text-xs"></i>}
          </button>
        )}
      </div>

      {hasChildren && open && (
        <ul className="mt-1 space-y-1 py-2 text-sm">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.label}
              item={child}
              isPrimary={false}
              collapsed={collapsed}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

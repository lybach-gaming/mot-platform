'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { NavigationItem } from '../types/navigation';

interface SidebarProps {
  navigation: NavigationItem[];
  collapsed?: boolean;
}

export default function Sidebar({ navigation, collapsed }: SidebarProps) {
  const [hovered, setHovered] = useState<{
    item: NavigationItem;
    top: number;
  } | null>(null);

  return (
    <nav className="h-full w-full flex flex-col bg-sidebar text-white relative">
      <ul className="py-4">
        {navigation.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            collapsed={collapsed}
            setHovered={setHovered}
          />
        ))}
      </ul>

      {collapsed && hovered && (
        <div
          className="
            fixed
            floating-dropdown
            rounded-sm shadow z-50
            bg-[var(--color-navigation-dropdown-bg)]
            text-white
            whitespace-nowrap
            px-0 py-0
          "
          style={{
            top: hovered.top,
            left: 65,
            width: '220px',
          }}
          onMouseEnter={() => setHovered(hovered)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="dropdown-title px-4 py-3 font-bold opacity-80 border-b border-white/20">
            {hovered.item.label.toUpperCase()}
          </div>
          <ul>
            {hovered.item.children?.map((child) => (
              <li key={child.label}>
                <Link
                  href={child.url ?? '#'}
                  className="
                    block
                    px-4 py-2
                    hover:bg-[var(--color-accent)]
                    transition-colors duration-200
                  "
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

function SidebarItem({
  item,
  isPrimary = true,
  collapsed = false,
  setHovered,
}: {
  item: NavigationItem;
  isPrimary?: boolean;
  collapsed?: boolean;
  setHovered?: (value: { item: NavigationItem; top: number } | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (collapsed && hasChildren && setHovered) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setHovered({ item, top: rect.top });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (collapsed && setHovered) {
      const related = e.relatedTarget as HTMLElement | null;
      if (
        !related ||
        !(related instanceof Element) ||
        !related.closest('.floating-dropdown')
      ) {
        setHovered(null);
      }
    }
  };
  return (
    <li
      className="sidebar-item relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        onClick={hasChildren && !collapsed ? () => setOpen(!open) : undefined}
        className={`
          sidebar-item-row
          flex items-center w-full ${
            collapsed ? 'justify-center' : 'justify-between'
          }
          ${isPrimary ? (collapsed ? 'px-2 py-3' : 'px-4 py-3') : 'pl-12 py-2'}
          hover:bg-[var(--color-accent)] hover:text-white
          transition-colors duration-200
          cursor-pointer
        `}
      >
        <div
          className={`flex cursor-pointer w-full ${
            collapsed ? 'justify-center' : 'items-center space-x-2'
          }`}
        >
          {item.url ? (
            <Link
              href={item.url}
              className={`flex cursor-pointer w-full ${
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
              className={`flex cursor-pointer w-full ${
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

      {hasChildren && open && !collapsed && (
        <ul className="mt-1 space-y-1 py-2 text-sm">
          {item.children!.map((child) => (
            <SidebarItem
              key={child.label}
              item={child}
              isPrimary={false}
              collapsed={collapsed}
              setHovered={setHovered}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

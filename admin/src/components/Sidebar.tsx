'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { NavigationItem } from '../types/navigation';

interface SidebarProps {
  navigation: NavigationItem[];
}

export default function Sidebar({ navigation }: SidebarProps) {
  return (
    <nav className="h-full w-full flex flex-col bg-sidebar text-white">
      <ul className="py-4">
        {navigation.map((item) => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </ul>
    </nav>
  );
}

function SidebarItem({
  item,
  isPrimary = true,
}: {
  item: NavigationItem;
  isPrimary?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className="sidebar-item">
      <div
        className={`
    sidebar-item-row
    flex items-center justify-between w-full
    ${isPrimary ? 'px-4 py-3' : 'pl-12 py-2'}
    hover:bg-[var(--color-accent)] hover:text-white
    transition-colors duration-200
    cursor-pointer
  `}
      >
        <div className="flex items-center space-x-2 w-full">
          {item.url ? (
            <Link
              href={item.url}
              className="flex items-center space-x-2 w-full"
            >
              {item.icon && <i className={`${item.icon} mx-2`}></i>}
              <span>{item.label}</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2 w-full cursor-default">
              {item.icon && <i className={`${item.icon} mx-2`}></i>}
              <span>{item.label}</span>
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
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        )}
      </div>

      {hasChildren && open && (
        <ul className="mt-1 space-y-1 py-2 text-sm">
          {item.children!.map((child) => (
            <SidebarItem key={child.label} item={child} isPrimary={false} />
          ))}
        </ul>
      )}
    </li>
  );
}

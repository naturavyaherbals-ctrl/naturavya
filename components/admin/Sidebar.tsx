'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  Boxes,
  UserCircle,
  Phone,
  ChevronDown,
  Menu,
  X,
  LogOut,
  FileText,
  Globe,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';
import { User } from '@/types/database';

interface SidebarProps {
  user: User;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[]; // roles allowed to see this
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    roles: ['super_admin', 'admin'],
    children: [
      { name: 'All Products', href: '/admin/products' },
      { name: 'Add Product', href: '/admin/products/new' },
    ],
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
    roles: ['super_admin', 'admin'],
  },
  {
    name: 'Inventory',
    href: '/admin/inventory',
    icon: Boxes,
    roles: ['super_admin', 'admin', 'manager'],
  },
  {
    name: 'CRM',
    href: '#',
    icon: Phone,
    children: [
      { name: 'Dashboard', href: '/admin/crm' },
      { name: 'All Leads', href: '/admin/crm/leads' },
      { name: 'My Leads', href: '/admin/crm/leads?my=true' },
      { name: 'Team', href: '/admin/crm/team' },
      { name: 'WhatsApp', href: '/admin/crm/whatsapp' },
    ],
  },
  // --- NEW SECTIONS START ---
  {
    name: 'Content',
    href: '#',
    icon: FileText,
    roles: ['super_admin', 'admin'],
    children: [
      { name: 'Pages', href: '/admin/pages' },
      { name: 'Testimonials', href: '/admin/testimonials' },
      { name: 'Reviews', href: '/admin/reviews' },
      { name: 'Media Library', href: '/admin/media' },
    ],
  },
  {
    name: 'Marketing',
    href: '#',
    icon: Globe,
    roles: ['super_admin', 'admin'],
    children: [
      { name: 'SEO Settings', href: '/admin/seo' },
      { name: 'Ad Analytics', href: '/admin/analytics/ads' },
    ],
  },
  // --- NEW SECTIONS END ---
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    roles: ['super_admin', 'admin', 'manager'],
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['super_admin', 'admin'],
  },
];

export function AdminSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Default expanded sections to make sure you see them immediately
  const [expandedItems, setExpandedItems] = useState<string[]>(['CRM', 'Content', 'Marketing']);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Helper to normalize role check (handles case sensitivity)
  const hasPermission = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true;
    const userRole = user?.role?.toLowerCase().replace(' ', '_');
    return allowedRoles.some(r => r === userRole);
  };

  const filteredNavigation = navigation.filter(
    (item) => hasPermission(item.roles)
  );

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#1a1c23] text-white">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
          <span className="text-xl font-bold">Naturavya</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || (item.children && item.children.some(child => pathname.startsWith(child.href)));
          const isExpanded = expandedItems.includes(item.name);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.name}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1',
                      isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 pl-4 border-l border-gray-700 space-y-1 mb-2">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'block px-3 py-2 rounded-lg text-sm transition-colors',
                            pathname === child.href
                              ? 'bg-green-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          )}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1',
                    pathname === item.href
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
          <button
            onClick={() => window.location.href = '/api/auth/logout'}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1c23] text-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#1a1c23] shadow-xl transition-transform">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <NavContent />
      </div>
    </>
  );
}
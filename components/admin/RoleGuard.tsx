'use client';

import React from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: string[];
  permission?: string;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
  // For now, just render children
  // Full role-based access control can be added later
  return <>{children}</>;
}
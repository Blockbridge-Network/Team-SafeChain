import React from 'react';
import { useWeb3 } from '../context/Web3Context';

interface RoleGuardProps {
  requiredRoles: ('admin' | 'defaultAdmin' | 'government' | 'auditor')[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRoles, children }) => {
  const { roles } = useWeb3();

  const hasRequiredRole = requiredRoles.some(role => {
    switch (role) {
      case 'admin':
        return roles.isAdmin;
      case 'defaultAdmin':
        return roles.isDefaultAdmin;
      case 'government':
        return roles.isGovernment;
      case 'auditor':
        return roles.isAuditor;
      default:
        return false;
    }
  });

  if (!hasRequiredRole) {
    return <div>You don't have permission to view this content.</div>;
  }

  return <>{children}</>;
};
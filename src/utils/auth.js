// src/utils/auth.js
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || 'guest';
};

export const hasRole = (requiredRoles = []) => {
  const role = getUserRole();
  return requiredRoles.includes(role);
};

export const isManagerOrHigher = () => hasRole(['manager', 'admin', 'superadmin']);
export const isAdminOrHigher = () => hasRole(['admin', 'superadmin']);
export const isSuperadmin = () => hasRole(['superadmin']);
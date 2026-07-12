import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';
import { API } from '../api/endpoints';

const AuthContext = createContext(null);

const ROLE_LABELS = {
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('transitops_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('transitops_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get(API.me)
      .then((res) => {
        if (res.data.isOk) {
          setUser(res.data.data);
          localStorage.setItem('transitops_user', JSON.stringify(res.data.data));
        }
      })
      .catch(() => {
        localStorage.removeItem('transitops_token');
        localStorage.removeItem('transitops_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login({ email, password, role, remember }) {
    const res = await api.post(API.login, {
      email: String(email || '').trim().toLowerCase(),
      password,
      role,
    });
    if (!res.data.isOk) throw new Error(res.data.message);
    const { token, user: u } = res.data.data;
    localStorage.setItem('transitops_token', token);
    localStorage.setItem('transitops_user', JSON.stringify(u));
    if (!remember) sessionStorage.setItem('transitops_token', token);
    setUser(u);
    return u;
  }

  function logout() {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    sessionStorage.removeItem('transitops_token');
    setUser(null);
  }

  function can(module, action = 'view') {
    const level = user?.permissions?.[module] || 'none';
    if (level === 'none') return false;
    if (action === 'view') return level === 'view' || level === 'full';
    return level === 'full';
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        can,
        roleLabel: user ? ROLE_LABELS[user.role] || user.role : '',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { ROLE_LABELS };

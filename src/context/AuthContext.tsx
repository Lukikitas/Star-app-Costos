import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { Business } from "../types";
import { listenAuthState } from "../services/authService";
import { listenUserBusinesses } from "../services/businessService";

interface AuthContextValue {
  user: User | null;
  business: Business | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, business: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubBiz: (() => void) | undefined;
    const unsubAuth = listenAuthState((nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setBusiness(null);
        setLoading(false);
        if (unsubBiz) unsubBiz();
        return;
      }

      unsubBiz = listenUserBusinesses(nextUser.uid, (biz) => {
        setBusiness(biz[0] ?? null);
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubBiz) unsubBiz();
    };
  }, []);

  const value = useMemo(() => ({ user, business, loading }), [user, business, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);

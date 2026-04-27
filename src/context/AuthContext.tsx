import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { Business } from "../types";
import { listenAuthState } from "../services/authService";
import { listenUserBusinesses } from "../services/businessService";
import { BusinessCategories, getDefaultCategories, listenCategories } from "../services/categoryService";

interface AuthContextValue {
  user: User | null;
  business: Business | null;
  categories: BusinessCategories;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  business: null,
  categories: getDefaultCategories(),
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<BusinessCategories>(getDefaultCategories());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubBiz: (() => void) | undefined;
    let unsubCats: (() => void) | undefined;
    const unsubAuth = listenAuthState((nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setBusiness(null);
        setCategories(getDefaultCategories());
        setLoading(false);
        if (unsubBiz) unsubBiz();
        if (unsubCats) unsubCats();
        return;
      }

      unsubBiz = listenUserBusinesses(nextUser.uid, (biz) => {
        const nextBusiness = biz[0] ?? null;
        setBusiness(nextBusiness);
        if (unsubCats) unsubCats();
        if (nextBusiness) unsubCats = listenCategories(nextBusiness.id, setCategories);
        else setCategories(getDefaultCategories());
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubBiz) unsubBiz();
      if (unsubCats) unsubCats();
    };
  }, []);

  const value = useMemo(() => ({ user, business, categories, loading }), [user, business, categories, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);

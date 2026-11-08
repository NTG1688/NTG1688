"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";

export interface UserProfile {
  id: string;
  user_code: string;
  username: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: "customer" | "staff" | "warehouse_china" | "warehouse_vietnam" | "admin";
  level_id: number;
  wallet_balance: number;
  default_warehouse_id: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDemo: (role: "admin" | "customer") => void;
}

const DEFAULT_ADMIN_PROFILE: UserProfile = {
  id: "admin-master-id-001",
  user_code: "ADMIN99",
  username: "admin99",
  full_name: "Quản Trị Viên (Nam Trung Logistics)",
  phone: "0987654321",
  email: "kd.namtrung@gmail.com",
  role: "admin",
  level_id: 99,
  wallet_balance: 999999999,
  default_warehouse_id: "a0000000-0000-0000-0000-000000000001",
  avatar_url: null,
  is_active: true,
};

const DEFAULT_CUSTOMER_PROFILE: UserProfile = {
  id: "customer-nt2820-id-001",
  user_code: "NT2820",
  username: "ahxdhn",
  full_name: "Nguyễn Văn Trung",
  phone: "0912345678",
  email: "ahxdhn@nhapkhaunamtrung.com",
  role: "customer",
  level_id: 1,
  wallet_balance: 24500000,
  default_warehouse_id: "a0000000-0000-0000-0000-000000000001",
  avatar_url: null,
  is_active: true,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
  loginAsDemo: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const setCookie = (name: string, value: string, days = 7) => {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  };

  const deleteCookie = (name: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch profile:", error.message);
        return null;
      }
      return data as UserProfile;
    } catch (err) {
      console.error("Profile fetch error:", err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const demoRole = getCookie("ntg_role");

        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          const p = await fetchProfile(initialSession.user.id);
          if (mounted && p) setProfile(p);
        } else if (demoRole) {
          // Khôi phục phiên demo đã lưu
          if (demoRole === "admin") {
            setProfile(DEFAULT_ADMIN_PROFILE);
            setUser({ id: DEFAULT_ADMIN_PROFILE.id, email: DEFAULT_ADMIN_PROFILE.email } as any);
          } else {
            setProfile(DEFAULT_CUSTOMER_PROFILE);
            setUser({ id: DEFAULT_CUSTOMER_PROFILE.id, email: DEFAULT_CUSTOMER_PROFILE.email } as any);
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const p = await fetchProfile(currentSession.user.id);
          if (mounted && p) setProfile(p);
        } else {
          const demoRole = getCookie("ntg_role");
          if (!demoRole) {
            setProfile(null);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loginAsDemo = (role: "admin" | "customer") => {
    setCookie("ntg_role", role);
    if (role === "admin") {
      setProfile(DEFAULT_ADMIN_PROFILE);
      setUser({ id: DEFAULT_ADMIN_PROFILE.id, email: DEFAULT_ADMIN_PROFILE.email } as any);
    } else {
      setProfile(DEFAULT_CUSTOMER_PROFILE);
      setUser({ id: DEFAULT_CUSTOMER_PROFILE.id, email: DEFAULT_CUSTOMER_PROFILE.email } as any);
    }
  };

  const signOut = async () => {
    deleteCookie("ntg_role");
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        refreshProfile,
        signOut,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

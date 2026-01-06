import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { authLogger } from '@/infra/logger';
type AppRole = Database['public']['Enums']['app_role'];

// Cache key for localStorage
const ROLE_CACHE_KEY = 'ifn-user-role-cache';

interface CachedRole {
  userId: string;
  role: AppRole;
  cachedAt: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: AppRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkRole: (role: AppRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Get cached role from localStorage
 */
function getCachedRole(userId: string): AppRole | null {
  try {
    const cached = localStorage.getItem(ROLE_CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedRole = JSON.parse(cached);
    
    // Cache valid for 30 minutes
    const CACHE_TTL = 30 * 60 * 1000;
    if (parsed.userId === userId && Date.now() - parsed.cachedAt < CACHE_TTL) {
      return parsed.role;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Save role to localStorage cache
 */
function setCachedRole(userId: string, role: AppRole): void {
  try {
    const cached: CachedRole = {
      userId,
      role,
      cachedAt: Date.now()
    };
    localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear cached role
 */
function clearCachedRole(): void {
  try {
    localStorage.removeItem(ROLE_CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  const fetchUserRole = useCallback(async (userId: string): Promise<AppRole | null> => {
    try {
      // Récupérer TOUS les rôles de l'utilisateur (sans .single() pour éviter erreur 406)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error || !data || data.length === 0) {
        authLogger.warn('No roles found for user', { userId, error: error?.message });
        return null;
      }
      
      // Si un seul rôle, le retourner directement
      if (data.length === 1) {
        return data[0].role as AppRole;
      }
      
      // Priorité des rôles : admin > agent > cooperative > merchant > user
      const rolePriority: Record<string, number> = {
        admin: 5,
        agent: 4,
        cooperative: 3,
        merchant: 2,
        user: 1
      };
      
      // Trier par priorité décroissante et prendre le premier
      const sortedRoles = [...data].sort((a, b) => 
        (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0)
      );
      
      authLogger.info('User has multiple roles, using highest priority', { 
        userId, 
        roles: data.map(r => r.role),
        selected: sortedRoles[0].role 
      });
      
      return sortedRoles[0].role as AppRole;
    } catch (err) {
      authLogger.error('Error in fetchUserRole', err, { userId });
      return null;
    }
  }, []);

  /**
   * Initialize auth with optimized parallel loading and caching
   */
  const initializeAuth = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setSession(null);
      setUser(null);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    const userId = currentSession.user.id;

    // Check cached role first (instant)
    const cachedRole = getCachedRole(userId);
    
    if (cachedRole) {
      // Use cached role immediately
      setSession(currentSession);
      setUser(currentSession.user);
      setUserRole(cachedRole);
      setIsLoading(false);

      // Refresh role in background (don't await)
      fetchUserRole(userId).then(freshRole => {
        if (freshRole && freshRole !== cachedRole) {
          setUserRole(freshRole);
          setCachedRole(userId, freshRole);
        }
      });
    } else {
      // No cache, fetch role
      setSession(currentSession);
      setUser(currentSession.user);
      
      const role = await fetchUserRole(userId);
      setUserRole(role);
      
      if (role) {
        setCachedRole(userId, role);
      }
      
      setIsLoading(false);
    }
  }, [fetchUserRole]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setUserRole(null);
          clearCachedRole();
          setIsLoading(false);
          return;
        }

        // IMPORTANT: éviter la course navigation vs. contexte auth.
        // Dès qu'un event arrive, on passe en "loading" pour que les guards n'auto-redirigent pas.
        setIsLoading(true);

        // Mettre à jour session/user immédiatement (sync), le rôle sera (re)chargé par initializeAuth.
        setSession(session ?? null);
        setUser(session?.user ?? null);

        // Defer initialization with setTimeout to avoid deadlock
        setTimeout(() => {
          initializeAuth(session);
        }, 0);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      initializeAuth(session);
    });

    return () => subscription.unsubscribe();
  }, [initializeAuth]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName }
        }
      });
      
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signInWithPhone = useCallback(async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : `+225${phone.replace(/\s/g, '')}`,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+225${phone.replace(/\s/g, '')}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms',
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    clearCachedRole();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  }, []);

  const checkRole = useCallback(async (role: AppRole): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: role
      });
      
      if (error) {
        authLogger.warn('Error checking role', { role, error: error.message });
        return false;
      }
      
      return data ?? false;
    } catch (err) {
      authLogger.error('Error in checkRole', err, { role });
      return false;
    }
  }, [user]);

  const value: AuthContextType = useMemo(() => ({
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    userRole,
    signIn,
    signUp,
    signInWithPhone,
    verifyOtp,
    signOut,
    checkRole
  }), [user, session, isLoading, userRole, signIn, signUp, signInWithPhone, verifyOtp, signOut, checkRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

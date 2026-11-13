"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ActorContext, Role, User } from "@/types";
import {
  getActorFromEmail,
  listDemoAccounts,
  readSessionEmail,
  writeSessionEmail,
} from "@/lib/auth/client-session";
import { activeRoles } from "@/lib/permissions/roles";
import { memoryRepository } from "@/lib/repository/memory";

type AppContextValue = {
  ready: boolean;
  user: User;
  roles: Role[];
  actor: ActorContext;
  demoAccounts: ReturnType<typeof listDemoAccounts>;
  switchUser: (email: string) => void;
  refresh: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState(DEMO_FALLBACK);
  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Touch store so seed runs in the browser once.
    memoryRepository.listUsers();
    setEmail(readSessionEmail());
    setReady(true);
  }, []);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const switchUser = useCallback(
    (next: string) => {
      writeSessionEmail(next);
      setEmail(next);
      refresh();
    },
    [refresh],
  );

  const value = useMemo(() => {
    const actor =
      getActorFromEmail(email) ?? getActorFromEmail(DEMO_FALLBACK)!;
    return {
      ready,
      user: actor.user,
      roles: activeRoles(actor.roles),
      actor,
      demoAccounts: listDemoAccounts(),
      switchUser,
      refresh,
    };
  }, [email, ready, switchUser, refresh, tick]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        กำลังโหลด AssessFlow...
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const DEMO_FALLBACK = "emp016@demo.local";

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

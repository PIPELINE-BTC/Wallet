/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, ReactNode, useState, useEffect, useRef } from 'react';

export const AccountContext = createContext<any>(null);

export const AccountProvider = ({ children, app }: { children?: ReactNode; app: any }) => {
  const { accessService } = app;
  const [appState, setAppState] = useState({});
  const currentRequest = useRef(0);

  useEffect(() => {
    accessService.store.cache.subscribe((value: Record<string, any>) => {
      if (value) setAppState((prev: any) => ({ ...prev, ...value }));
    });
    const isUnlocked = accessService.store.session.getState().isUnlocked;
    setAppState((prev: any) => ({ ...prev, isUnlocked }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AccountContext.Provider
      value={{
        ...app,
        ...appState,
        setAppState,
        currentRequest
      }}>
      {children}
    </AccountContext.Provider>
  );
};

"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

export type User = {
  name: string;
  email: string;
  profilePic: string;
  userId: number;
  isGoogle: boolean;
};

type UserContextType = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (userData: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  accessToken: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // This function stops the timer. Memoize it so it's stable.
  const stopTokenRefreshInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Memoize logout.
  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    stopTokenRefreshInterval();
  }, [stopTokenRefreshInterval]);

  // This function performs the token refresh API call.
  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      logout();
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await res.json();
      const newAccessToken = data.accessToken;

      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
      console.log("Access token refreshed successfully.");

    } catch (error) {
      console.error("Could not refresh token:", error);
      logout();
    }
  }, [logout]);

  // This function clears any existing timer and starts a new one.
  const startTokenRefreshInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const id = setInterval(() => {
      console.log("Scheduled token refresh initiated.");
      refreshToken();
    }, 55 * 60 * 1000);
    intervalRef.current = id;
  }, [refreshToken]);

  // On initial load, try to restore the session using the refresh token.
  useEffect(() => {
    const init = async () => {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (storedRefreshToken && storedUser) {
        setUser(JSON.parse(storedUser));
        await refreshToken();
        startTokenRefreshInterval();
      }
      setIsLoading(false);
    };
    init();

    return () => stopTokenRefreshInterval();
  }, [refreshToken, startTokenRefreshInterval, stopTokenRefreshInterval]);

  // Memoize login.
  const login = useCallback((userData: User, tokens: { accessToken: string; refreshToken: string }) => {
    setUser(userData);
    setAccessToken(tokens.accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    startTokenRefreshInterval();
  }, [startTokenRefreshInterval]);

  const value = { user, accessToken, isLoading, login, logout };

  return (
    <UserContext.Provider value={value}>
      {!isLoading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
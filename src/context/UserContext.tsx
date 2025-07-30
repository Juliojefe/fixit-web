"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";

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
  // Use a ref to hold the interval ID. This prevents re-renders when the ID changes.
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      logout(); // If there's no refresh token, we can't refresh. Log out.
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!res.ok) {
        // If the refresh fails (e.g., token is expired or invalid), log the user out.
        throw new Error("Failed to refresh token");
      }

      const data = await res.json();
      const newAccessToken = data.accessToken;

      // Update the access token in state and localStorage
      setAccessToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
      console.log("Access token refreshed successfully.");

    } catch (error) {
      console.error("Could not refresh token:", error);
      logout(); // The session is no longer valid, so log out.
    }
  };

  // This function clears any existing timer and starts a new one.
  const startTokenRefreshInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Set an interval to run every 55 minutes.
    // (55 min * 60 sec/min * 1000 ms/sec)
    const id = setInterval(() => {
      console.log("Scheduled token refresh initiated.");
      refreshToken();
    }, 55 * 60 * 1000);
    intervalRef.current = id;
  };

  // This function stops the timer.
  const stopTokenRefreshInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // On initial load, try to restore the session using the refresh token.
  useEffect(() => {
    const init = async () => {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (storedRefreshToken && storedUser) {
        setUser(JSON.parse(storedUser));
        await refreshToken(); // Get a fresh access token immediately
        startTokenRefreshInterval(); // Start the scheduled refresh
      }
      setIsLoading(false);
    };
    init();

    // Cleanup: ensure the interval is cleared if the component unmounts.
    return () => stopTokenRefreshInterval();
  }, []);

  const login = (userData: User, tokens: { accessToken: string; refreshToken: string }) => {
    setUser(userData);
    setAccessToken(tokens.accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    startTokenRefreshInterval(); // Start the refresh timer on login
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    stopTokenRefreshInterval(); // Stop the refresh timer on logout
  };

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
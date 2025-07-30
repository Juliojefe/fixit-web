"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

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

  // On initial load, check for stored user data and tokens.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("accessToken");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to parse user data from storage", error);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function to update state and persist data securely.
  const login = (userData: User, tokens: { accessToken: string; refreshToken: string }) => {
    setUser(userData);
    setAccessToken(tokens.accessToken);
    
    // Storing user info and tokens in localStorage.
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  };

  // Logout function to clear state and storage.
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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
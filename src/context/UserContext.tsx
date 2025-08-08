"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

export type User = {
  userId: number;
  name: string;
  email: string;
  profilePic: string;
  isGoogle: boolean;
};

type DecodedToken = {
  sub: string; // Subject (in this case email)
  userId: number; // The user ID
  iat: number; // Issued at
  exp: number; // Expiration time
};

type AuthResponse = Omit<User, 'userId'> & {
  accessToken: string;
  refreshToken: string;
};

type UserContextType = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (authData: AuthResponse) => void;
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

  const stopTokenRefreshInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    stopTokenRefreshInterval();
  }, [stopTokenRefreshInterval]);

  // This function's ONLY job is to get a new token. It does not set state.
  const getNewToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      return null;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!res.ok) {
        // If refresh fails, log the user out as the session is invalid.
        logout();
        return null;
      }

      // The response is {"accessToken": "..."}. We parse it and return the token string.
      const data = await res.json();
      if (typeof data.accessToken !== 'string') {
        throw new Error("Invalid token format received from server.");
      }
      return data.accessToken;

    } catch (error) {
      console.error("Could not refresh token:", error);
      logout();
      return null;
    }
  }, [logout]);

  const startTokenRefreshInterval = useCallback(() => {
    stopTokenRefreshInterval(); // Clear any existing interval first

    const id = setInterval(async () => {
      console.log("Scheduled token refresh initiated.");
      const newAccessToken = await getNewToken();
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);
      }
    }, 55 * 60 * 1000); // 55 minutes
    intervalRef.current = id;
  }, [getNewToken, stopTokenRefreshInterval]);

  // On initial load, restore the session.
  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const newAccessToken = await getNewToken();
        if (newAccessToken) {
          // Set both pieces of state together to prevent race conditions.
          setAccessToken(newAccessToken);
          setUser(JSON.parse(storedUser));
          localStorage.setItem("accessToken", newAccessToken);
          startTokenRefreshInterval();
        }
      }
      setIsLoading(false);
    };
    init();
    return stopTokenRefreshInterval;
  }, [getNewToken, startTokenRefreshInterval, stopTokenRefreshInterval]);

  // The login function takes one object and splits it
  // into the user data and the tokens for state and storage.
  const login = useCallback((authData: AuthResponse) => {
    const { accessToken, refreshToken, ...userDataFromApi } = authData;

    // Decode the token to get the real userId
    const decodedToken: DecodedToken = jwtDecode(accessToken);
    
    // Combine the user data from the API with the userId from the token
    const completeUser: User = {
      ...userDataFromApi,
      userId: decodedToken.userId,
    };

    setUser(completeUser);
    setAccessToken(accessToken);

    // Store the complete user object and tokens
    localStorage.setItem("user", JSON.stringify(completeUser));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    startTokenRefreshInterval();
  }, [startTokenRefreshInterval]);

  // This function runs on page load to restore the session
  const init = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
      startTokenRefreshInterval();
    }
    setIsLoading(false);
  }, [startTokenRefreshInterval]);

  useEffect(() => {
    init();
    return stopTokenRefreshInterval;
  }, [init, stopTokenRefreshInterval]);

  const value = { user, accessToken, isLoading, login, logout };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
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

interface UserContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  showLoginPopup: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginPopupVisible, setLoginPopupVisible] = useState(false);
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
        logout();
        return null;
      }

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
    stopTokenRefreshInterval();

    const id = setInterval(async () => {
      console.log("Scheduled token refresh initiated.");
      const newAccessToken = await getNewToken();
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        localStorage.setItem("accessToken", newAccessToken);
      }
    }, 55 * 60 * 1000);
    intervalRef.current = id;
  }, [getNewToken, stopTokenRefreshInterval]);

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const newAccessToken = await getNewToken();
        if (newAccessToken) {
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

  const login = (authData: AuthResponse) => {
    const { accessToken, refreshToken, ...userDataFromApi } = authData;

    const decodedToken: DecodedToken = jwtDecode(accessToken);
    const completeUser: User = { ...userDataFromApi, userId: decodedToken.userId };

    setUser(completeUser);
    setAccessToken(accessToken);

    localStorage.setItem("user", JSON.stringify(completeUser));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    startTokenRefreshInterval();
  };

  const showLoginPopup = useCallback(() => {
    setLoginPopupVisible(true);
  }, []);

  const value = { user, accessToken, isLoading, login, logout, showLoginPopup };

  return (
    <UserContext.Provider value={value}>
      {children}
      {isLoginPopupVisible && (
        <div style={popupStyles.overlay} onClick={() => setLoginPopupVisible(false)}>
          <div style={popupStyles.popup} onClick={(e) => e.stopPropagation()}>
            <h3 style={popupStyles.title}>Login Required</h3>
            <p style={popupStyles.text}>You need to be logged in to perform this action.</p>
            <button onClick={() => window.location.href = '/login'} style={popupStyles.button}>Login / Sign Up</button>
            <button onClick={() => setLoginPopupVisible(false)} style={{...popupStyles.button, ...popupStyles.cancelButton}}>Cancel</button>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

const popupStyles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  popup: { background: 'white', padding: '2rem', borderRadius: 12, textAlign: 'center', minWidth: 320, boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
  title: { margin: '0 0 0.5rem 0', color: '#000000', fontSize: '1.25rem', fontWeight: 'bold' },
  text: { margin: '0 0 1.5rem 0', color: '#333333' },
  button: { padding: '0.6rem 1.2rem', borderRadius: 8, border: 'none', cursor: 'pointer', margin: '0 0.5rem', fontWeight: 600, background: '#007bff', color: '#ffffff' },
  cancelButton: { background: '#e9ecef', color: '#212529', border: '1px solid #ced4da' },
};
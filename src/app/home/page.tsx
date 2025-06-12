"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from 'axios';
import { useUser } from "../../context/UserContext";

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useUser();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // function handleLogout() {
  //   setUser(null);
  //   router.push("/login");
  // }

  function handleLogout() {
    setUser(null);
    // router.push("/login"); // Remove this line, let useEffect handle redirect
  }

  // Don't render anything if user is null (prevents "Hello" with blank)
  if (!user) return null;  

  return (
    <div 
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f6fa",
      padding: "2rem",
      textAlign: "center",
    }}>
      <h1 style={{ color: "#222" }}>Hello {user?.name}</h1>
      <button
        onClick={handleLogout}
        style= {{
          marginTop: "1rem",
          padding: "0.7rem 1.5rem",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "1rem",
        }}
        >
          Log out
        </button>
    </div>
  );


}
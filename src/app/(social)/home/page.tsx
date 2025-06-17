"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import React, { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useUser();

  useEffect(() => {
      if (!user) {
        router.push("/login");
      }
    }, [user, router]);

  if (!user) return null;

  function handleLogout() {
    setUser(null);
  }

  function handleProfileClick() {
    router.push("/profile");
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
      {/* Posts will go here */}
    </div>
  );
}
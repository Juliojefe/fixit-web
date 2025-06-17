"use client";

import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import React, { useEffect, useState } from "react";
import { FaHome, FaUser, FaEnvelope, FaBell, FaSearch } from "react-icons/fa";

const sidebarItems = [
  { label: "Home", icon: <FaHome />, route: "/home" },
  { label: "Profile", icon: <FaUser />, route: "/profile" },
  { label: "Messages", icon: <FaEnvelope />, route: "/chats" },
  { label: "Notifications", icon: <FaBell />, route: "/notifications" },
  { label: "Search", icon: <FaSearch />, route: "/search" },
];

const DEFAULT_PROFILE =
  "https://ui-avatars.com/api/?name=User&background=cccccc&color=222222&size=128";

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fa" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "#fff",
          borderRight: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem 0 1rem 0",
          gap: "2rem",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", marginBottom: "2rem", color: "#0070f3" }}>
          FixIt Social
        </div>
        <nav style={{ width: "100%" }}>
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.route)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
                background: "none",
                border: "none",
                color: "#222",
                fontSize: "1.1rem",
                padding: "1rem 2rem",
                cursor: "pointer",
                fontWeight: "bold",
                borderRadius: "0 24px 24px 0",
                transition: "background 0.2s",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "1.5rem 2.5rem 1.5rem 0",
            background: "transparent",
            borderBottom: "1px solid #e0e0e0",
            minHeight: 80,
          }}
        >
          <span style={{ marginRight: "1rem", fontWeight: "bold", color: "#222", fontSize: "1.1rem" }}>
            {user?.name}
          </span>
          <img
            src={user?.profilePic && user.profilePic !== "" ? user.profilePic : DEFAULT_PROFILE}
            alt="Profile"
            onClick={handleProfileClick}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              objectFit: "cover",
              cursor: "pointer",
              border: "2px solid #0070f3",
              background: "#eee",
            }}
          />
        </div>
        {/* Center Content (empty for now) */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Posts will go here */}
        </div>
      </main>
    </div>
  );
}
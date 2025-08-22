"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { FaHome, FaCompass, FaPlusSquare, FaBell, FaUser, FaEnvelope, FaSearch } from "react-icons/fa";

const sidebarItems = [
  { label: "Home", icon: FaHome, route: "/home", isPrivate: true },
  { label: "Search", icon: FaSearch, route: "/search", isPrivate: false },
  { label: "Explore", icon: FaCompass, route: "/explore", isPrivate: false },
  { label: "Create", icon: FaPlusSquare, route: "/create", isPrivate: true },
  { label: "Notifications", icon: FaBell, route: "/notifications", isPrivate: true },
  { label: "Chats", icon: FaEnvelope, route: "/chats", isPrivate: true },
  { label: "Profile", icon: FaUser, route: "/profile", isPrivate: false },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, showLoginPopup } = useUser();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function handleNavClick(item: typeof sidebarItems[0]) {
    if (item.isPrivate && !user) {
      showLoginPopup();
      return;
    }

    if (item.label === "Profile") {
      if (user) {
        router.push(`/profile/${user.userId}`);
      } else {
        showLoginPopup();
      }
      return;
    }
    
    router.push(item.route);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 250, background: "#fff", borderRight: "1px solid #dbdbdb", padding: "2rem 1rem", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1.8rem", fontWeight: "bold", padding: "0 1rem 2rem 1rem", color: "#0070f3" }}>FixIt</div>
        <nav style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
          {sidebarItems.map((item) => {
            const isActive = pathname.startsWith(item.route);
            
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.8rem 1rem",
                  background: isActive ? "#eef5ff" : "transparent",
                  border: "none",
                  borderRadius: "8px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: isActive ? "#0070f3" : "#333",
                  fontWeight: isActive ? "bold" : "normal",
                }}
              >
                <item.icon size={22} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto" }}>
          {user ? (
            <button onClick={handleLogout} style={{ width: "100%", padding: "0.8rem", background: "#fdecec", color: "#c53030", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Logout
            </button>
          ) : (
            <button onClick={() => router.push('/login')} style={{ width: "100%", padding: "0.8rem", background: "#eef5ff", color: "#0070f3", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
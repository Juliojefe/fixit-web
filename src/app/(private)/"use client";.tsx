"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import { FaHome, FaCompass, FaPlusSquare, FaBell, FaUser, FaEnvelope } from "react-icons/fa";

const sidebarItems = [
  { label: "Home", icon: FaHome, route: "/home" },
  { label: "Explore", icon: FaCompass, route: "/explore" },
  { label: "Create", icon: FaPlusSquare, route: "/create" },
  { label: "Notifications", icon: FaBell, route: "/notifications" },
  { label: "Chats", icon: FaEnvelope, route: "/chats" },
  { label: "Profile", icon: FaUser, route: "/profile" },
];

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useUser();

  // This is the guard clause for private pages
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Don't render anything until we are sure the user is logged in
  if (isLoading || !user) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function handleProfileClick() {
    router.push(`/profile/${user.userId}`);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 250, background: "#fff", borderRight: "1px solid #dbdbdb", padding: "2rem 1rem", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "1.8rem", fontWeight: "bold", padding: "0 1rem 2rem 1rem", color: "#0070f3" }}>FixIt</div>
        <nav style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
          {sidebarItems.map((item) => {
            const isActive = pathname.startsWith(item.route);
            const targetRoute = item.label === "Profile" ? `/profile/${user.userId}` : item.route;

            return (
              <button
                key={item.label}
                onClick={() => router.push(targetRoute)}
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
          <button onClick={handleLogout} style={{ width: "100%", padding: "0.8rem", background: "#fdecec", color: "#c53030", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, background: "#f5f6fa", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
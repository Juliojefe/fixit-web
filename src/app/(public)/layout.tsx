"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { FaHome, FaCompass, FaPlusSquare, FaBell, FaUser, FaEnvelope, FaSearch } from "react-icons/fa"; // Import FaSearch

// Add "Search" and a flag for private routes
const sidebarItems = [
  { label: "Home", icon: FaHome, route: "/home", isPrivate: true },
  { label: "Search", icon: FaSearch, route: "/search", isPrivate: false },
  { label: "Explore", icon: FaCompass, route: "/explore", isPrivate: false },
  { label: "Create", icon: FaPlusSquare, route: "/create", isPrivate: true },
  { label: "Notifications", icon: FaBell, route: "/notifications", isPrivate: true },
  { label: "Chats", icon: FaEnvelope, route: "/chats", isPrivate: true },
  { label: "Profile", icon: FaUser, route: "/profile", isPrivate: false }, // Profile page itself is public
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [showLoginPopup, setShowLoginPopup] = useState(false); // State for the popup

  function handleLogout() {
    logout();
    router.push("/login");
  }

  // A single handler for all navigation clicks
  function handleNavClick(item: typeof sidebarItems[0]) {
    // If the route is private and there's no user, show the popup
    if (item.isPrivate && !user) {
      setShowLoginPopup(true);
      return;
    }
    // Handle profile route separately to include the user's ID
    if (item.label === "Profile") {
      if (user) {
        router.push(`/profile/${user.userId}`);
      } else {
        setShowLoginPopup(true);
      }
      return;
    }
        router.push(item.route);
  }

  return (
    <>
      {/* Login Popup with improved, darker styles */}
      {showLoginPopup && (
        <div style={popupStyles.overlay} onClick={() => setShowLoginPopup(false)}>
          <div style={popupStyles.popup} onClick={(e) => e.stopPropagation()}>
            <h3 style={popupStyles.title}>Login Required</h3>
            <p style={popupStyles.text}>You need to be logged in to access this page.</p>
            <button onClick={() => router.push('/login')} style={popupStyles.button}>Login / Sign Up</button>
            <button onClick={() => setShowLoginPopup(false)} style={{...popupStyles.button, ...popupStyles.cancelButton}}>Cancel</button>
          </div>
        </div>
      )}

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
                  onClick={() => handleNavClick(item)} // Use the new single handler
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
    </>
  );
}

// Styles for the popup
const popupStyles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  popup: { background: 'white', padding: '2rem', borderRadius: 12, textAlign: 'center', minWidth: 320, boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
  title: { margin: '0 0 0.5rem 0', color: '#000000', fontSize: '1.25rem', fontWeight: 'bold' },
  text: { margin: '0 0 1.5rem 0', color: '#333333' },
  button: { padding: '0.6rem 1.2rem', borderRadius: 8, border: 'none', cursor: 'pointer', margin: '0 0.5rem', fontWeight: 600, background: '#007bff', color: '#ffffff' },
  cancelButton: { background: '#e9ecef', color: '#212529', border: '1px solid #ced4da' },
};
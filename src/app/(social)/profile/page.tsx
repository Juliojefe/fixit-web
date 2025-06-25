"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import React, { useEffect, useState } from "react";

const DEFAULT_PROFILE =
  "https://ui-avatars.com/api/?name=User&background=cccccc&color=222222&size=128";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "liked">("posts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/user/${user?.userId}`);
        const data = await res.json();
        setProfileData(data);
      } catch (e) {
        setProfileData(null);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user, router]);

  if (!user || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f6fa",
          color: "#222",
        }}
      >
        Loading...
      </div>
    );
  }

  const profilePic =
    user.profilePic && user.profilePic !== "" ? user.profilePic : DEFAULT_PROFILE;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f6fa",
        color: "#222",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "3rem",
      }}
    >
      {/* Profile Header */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          padding: "2rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 340,
          marginBottom: "2rem",
        }}
      >
        <img
          src={profilePic}
          alt="Profile"
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #0070f3",
            marginBottom: "1rem",
            background: "#eee",
          }}
        />
        <div style={{ fontWeight: "bold", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          {user.name}
        </div>
        <div style={{ display: "flex", gap: "2.5rem", marginBottom: "1.5rem" }}>
          <button
            onClick={() => alert("Under Construction")}
            style={{
              background: "none",
              border: "none",
              color: "#0070f3",
              fontWeight: "bold",
              fontSize: "1.1rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              {profileData?.followerCount ?? 0}
            </span>
            <span style={{ fontSize: "0.95rem" }}>Followers</span>
          </button>
          <button
            onClick={() => alert("Under Construction")}
            style={{
              background: "none",
              border: "none",
              color: "#0070f3",
              fontWeight: "bold",
              fontSize: "1.1rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              {profileData?.followingCount ?? 0}
            </span>
            <span style={{ fontSize: "0.95rem" }}>Following</span>
          </button>
        </div>
        <button
          onClick={() => alert("Under Construction")}
          style={{
            padding: "0.5rem 1.5rem",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            marginBottom: "0.5rem",
          }}
        >
          Edit Profile
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          minWidth: 340,
          padding: "1.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "2.5rem", marginBottom: "1.5rem" }}>
          <button
            onClick={() => setActiveTab("posts")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "posts" ? "#0070f3" : "#222",
              fontWeight: activeTab === "posts" ? "bold" : "normal",
              fontSize: "1.1rem",
              borderBottom: activeTab === "posts" ? "2px solid #0070f3" : "2px solid transparent",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              transition: "color 0.2s, border-bottom 0.2s",
            }}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "saved" ? "#0070f3" : "#222",
              fontWeight: activeTab === "saved" ? "bold" : "normal",
              fontSize: "1.1rem",
              borderBottom: activeTab === "saved" ? "2px solid #0070f3" : "2px solid transparent",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              transition: "color 0.2s, border-bottom 0.2s",
            }}
          >
            Saved
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            style={{
              background: "none",
              border: "none",
              color: activeTab === "liked" ? "#0070f3" : "#222",
              fontWeight: activeTab === "liked" ? "bold" : "normal",
              fontSize: "1.1rem",
              borderBottom: activeTab === "liked" ? "2px solid #0070f3" : "2px solid transparent",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              transition: "color 0.2s, border-bottom 0.2s",
            }}
          >
            Liked
          </button>
        </div>
        {/* Skeleton content for each tab */}
        <div style={{ color: "#888", fontSize: "1.1rem", minHeight: 80 }}>
          {activeTab === "posts" && "Your posts will appear here."}
          {activeTab === "saved" && "Your saved posts will appear here."}
          {activeTab === "liked" && "Your liked posts will appear here."}
        </div>
      </div>
    </div>
  );
}
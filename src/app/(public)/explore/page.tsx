"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserSummaryList from "@/components/UserSummaryList";
import { useUser } from "../../../context/UserContext";

const DEFAULT_PROFILE =
  "https://ui-avatars.com/api/?name=User&background=cccccc&color=222222&size=128";

export default function ExplorePage() {
  const router = useRouter();
  const [userIds, setUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, accessToken, isLoading } = useUser();
  const currentUserId = user?.userId;

  useEffect(() => {
    async function fetchUserIds() {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/all-ids`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user IDs');
        }

        const data = await res.json();
        setUserIds(Array.isArray(data) && currentUserId
          ? data.filter(id => id !== currentUserId)
          : []);
      } catch (e) {
        console.error("Error fetching user IDs:", e);
        setUserIds([]);
      }
      setLoading(false);
    }
    if (currentUserId && accessToken) {
      fetchUserIds();
    }
  }, [currentUserId, accessToken]);

  const CARD_HEIGHT = 600;
  const HEADER_HEIGHT = 80;

  return (
    <div
      style={{
        height: "100vh",
        minHeight: "100vh",
        background: "#f5f6fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          padding: "2.5rem 2.5rem 2rem 2.5rem",
          minWidth: 420,
          maxWidth: 600,
          width: "100%",
          height: CARD_HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          marginTop: "-110px",
        }}
      >
        <h1
          style={{
            color: "#0070f3",
            fontWeight: "bold",
            fontSize: "2rem",
            marginBottom: "1.5rem",
            letterSpacing: "0.5px",
            height: 40,
            lineHeight: "40px",
          }}
        >
          Explore Users
        </h1>
        <div
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid #f0f0f0",
            background: "#fafbfc",
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            minHeight: 0,
            flex: 1,
            overflowY: 'auto',
            padding: '0 1.5rem'
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", color: "#888", padding: "2rem 0" }}>
              Loading users...
            </div>
          ) : currentUserId ? (
            <UserSummaryList
              userIds={userIds}
              currentUserId={currentUserId}
              renderUser={(user, idx, handleAction) => (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    borderBottom: "1px solid #eee",
                    padding: "0.8rem 0",
                    minHeight: 56,
                  }}
                >
                  <div
                    onClick={() => router.push(`/profile/${user.id}`)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#bbb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      color: "#fff",
                      flexShrink: 0,
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={user.profilePic && user.profilePic !== "" ? user.profilePic : DEFAULT_PROFILE}
                      alt={user.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                  <span style={{ flex: 1, fontWeight: 500, fontSize: "1.05rem", color: "#222" }}>
                    {user.name}
                  </span>
                  <button
                    onClick={() =>
                      handleAction(
                        user.follows ? "unfollow" : "follow",
                        user,
                        idx
                      )
                    }
                    style={{
                      background: user.follows ? "#eee" : "#0070f3",
                      color: user.follows ? "#222" : "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.4rem 1.2rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "1rem",
                      minWidth: 90,
                      textAlign: "center",
                      boxShadow: user.follows ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    {user.follows && user.followsBack
                      ? "Following"
                      : !user.follows && user.followsBack
                      ? "Follow Back"
                      : user.follows && !user.followsBack
                      ? "Following"
                      : "Follow"}
                  </button>
                </div>
              )}
            />
          ) : (
            <div style={{ textAlign: "center", color: "#888", padding: "2rem 0" }}>
              Could not load users.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
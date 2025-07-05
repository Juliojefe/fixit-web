"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import React, { useEffect, useState } from "react";
import UserSummaryList from "@/components/UserSummaryList";

const DEFAULT_PROFILE =
  "https://ui-avatars.com/api/?name=User&background=cccccc&color=222222&size=128";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const currentUserId = user?.userId;
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "liked">("posts");
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState<null | "followers" | "following">(null);
  const [pendingActions, setPendingActions] = useState<
    { id: number; action: "follow" | "unfollow" }[]
  >([]);

  // Fetch the logged-in user's profile data
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${currentUserId}`);
        const data = await res.json();
        setProfileData(data);
      } catch (e) {
        setProfileData(null);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user, router, currentUserId]);

  function handleShowFollowers() {
    setShowPopup("followers");
  }

  function handleShowFollowing() {
    setShowPopup("following");
  }

  // When popup closes, update followingIds/count based on actions taken in popup
  const handleClosePopup = () => {
    if (pendingActions.length > 0) {
      setProfileData((prev: any) => {
        let newData = { ...prev };
        pendingActions.forEach(({ id, action }) => {
          if (showPopup === "following" || showPopup === "followers") {
            if (action === "follow" && !newData.followingIds.includes(id)) {
              newData.followingIds = [...newData.followingIds, id];
              newData.followingCount = (newData.followingCount || 0) + 1;
            }
            if (action === "unfollow" && newData.followingIds.includes(id)) {
              newData.followingIds = newData.followingIds.filter((fid: number) => fid !== id);
              newData.followingCount = Math.max((newData.followingCount || 1) - 1, 0);
            }
          }
        });
        return newData;
      });
      setPendingActions([]);
    }
    setShowPopup(null);
  };

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

  // Choose which IDs to show in the popup
  const popupUserIds =
    showPopup === "followers"
      ? profileData?.followerIds || []
      : showPopup === "following"
      ? profileData?.followingIds || []
      : [];

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
            onClick={handleShowFollowers}
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
            onClick={handleShowFollowing}
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
        <div style={{ color: "#888", fontSize: "1.1rem", minHeight: 80 }}>
          {activeTab === "posts" && "Your posts will appear here."}
          {activeTab === "saved" && "Your saved posts will appear here."}
          {activeTab === "liked" && "Your liked posts will appear here."}
        </div>
      </div>

      {/* Popup for followers/following */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowPopup(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              minWidth: 320,
              maxWidth: 380,
              maxHeight: 480,
              overflowY: "auto",
              boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
              padding: "2rem 1.5rem",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem", color: "#0070f3" }}>
              {showPopup === "followers" ? "Followers" : "Following"}
            </h2>
            <UserSummaryList
              userIds={popupUserIds}
              currentUserId={currentUserId!}
              renderUser={(user, idx, handleAction) => (
                <div
                  key={`${user.id}-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.2rem",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "0.8rem",
                  }}
                >
                  <img
                    src={user.profilePic || DEFAULT_PROFILE}
                    alt={user.name}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                      background: "#eee",
                    }}
                  />
                  <span style={{ flex: 1, fontWeight: 500 }}>{user.name}</span>
                  <button
                    onClick={() =>
                      handleAction(
                        user.follows ? "unfollow" : "follow",
                        user,
                        idx
                      ).then(() => {
                        setPendingActions((prev) => [
                          ...prev.filter((a) => a.id !== user.id),
                          {
                            id: user.id,
                            action: user.follows ? "unfollow" : "follow",
                          },
                        ]);
                      })
                    }
                    style={{
                      background: user.follows ? "#eee" : "#0070f3",
                      color: user.follows ? "#222" : "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0.4rem 1rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "0.95rem",
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
            <button
              onClick={handleClosePopup}
              style={{
                position: "absolute",
                top: 12,
                right: 18,
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                color: "#888",
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
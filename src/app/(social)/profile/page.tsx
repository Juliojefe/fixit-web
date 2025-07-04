"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import React, { useEffect, useRef, useState, useCallback } from "react";

const DEFAULT_PROFILE =
  "https://ui-avatars.com/api/?name=User&background=cccccc&color=222222&size=128";
const BATCH_SIZE = 10;
const DEBOUNCE_MS = 200;

function debounce(fn: (...args: any[]) => void, ms: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const currentUserId = user?.userId;
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "liked">("posts");
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState<null | "followers" | "following">(null);
  const [popupUsers, setPopupUsers] = useState<
    { name: string; profilePic: string; id: number; follows: boolean; followsBack: boolean }[]
  >([]);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupIds, setPopupIds] = useState<number[]>([]);
  const [popupLoadedCount, setPopupLoadedCount] = useState(0);
  const [pendingActions, setPendingActions] = useState<
    { id: number; action: "follow" | "unfollow" }[]
  >([]);

  const popupContentRef = useRef<HTMLDivElement>(null);

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
  }, [user, router]);

  // Fetch a batch of user summaries in parallel
  const fetchUserBatch = useCallback(
    async (ids: number[]) => {
      if (!user || ids.length === 0) return;
      setPopupLoading(true);
      try {
        const batch = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/follow/mutual/${currentUserId}/${id}`
            );
            const data = await res.json();
            return { ...data, id };
          })
        );
        setPopupUsers((prev) => [...prev, ...batch]);
      } catch (e) {
        // Optionally handle error
      }
      setPopupLoading(false);
    },
    [user]
  );

  // When popup opens, reset and load first batch
  useEffect(() => {
    if (!showPopup || !profileData) return;
    const ids =
      showPopup === "followers"
        ? profileData.followerIds || []
        : profileData.followingIds || [];
    setPopupIds(ids);
    setPopupUsers([]);
    setPopupLoadedCount(0);
    if (ids.length > 0) {
      fetchUserBatch(ids.slice(0, BATCH_SIZE));
      setPopupLoadedCount(BATCH_SIZE);
    }
  }, [showPopup, profileData, fetchUserBatch]);

  // Debounced scroll handler
  const handleScroll = useCallback(
    debounce(() => {
      if (!popupContentRef.current || popupLoading) return;
      const { scrollTop, scrollHeight, clientHeight } = popupContentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 40) {
        // Near bottom, load next batch
        if (popupLoadedCount < popupIds.length) {
          const nextBatch = popupIds.slice(popupLoadedCount, popupLoadedCount + BATCH_SIZE);
          fetchUserBatch(nextBatch);
          setPopupLoadedCount((prev) => prev + BATCH_SIZE);
        }
      }
    }, DEBOUNCE_MS),
    [popupLoadedCount, popupIds, popupLoading, fetchUserBatch]
  );

  // Attach scroll handler
  useEffect(() => {
    if (!showPopup) return;
    const ref = popupContentRef.current;
    if (!ref) return;
    ref.addEventListener("scroll", handleScroll);
    return () => {
      ref.removeEventListener("scroll", handleScroll);
    };
  }, [showPopup, handleScroll]);

  function handleShowFollowers() {
    setShowPopup("followers");
  }

  function handleShowFollowing() {
    setShowPopup("following");
  }

  const handleClosePopup = () => {
    if (pendingActions.length > 0) {
      setProfileData((prev: any) => {
        let newData = { ...prev };
        pendingActions.forEach(({ id, action }) => {
          if (showPopup === "following") {
            if (action === "follow" && !newData.followingIds.includes(id)) {
              newData.followingIds = [...newData.followingIds, id];
              newData.followingCount = (newData.followingCount || 0) + 1;
            }
            if (action === "unfollow" && newData.followingIds.includes(id)) {
              newData.followingIds = newData.followingIds.filter((fid: number) => fid !== id);
              newData.followingCount = Math.max((newData.followingCount || 1) - 1, 0);
            }
          }
          if (showPopup === "followers") {
            // Only update follows (not followerIds), since you can't remove a follower here
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
        {/* Skeleton content for each tab */}
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
            ref={popupContentRef}
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
            {popupUsers.length === 0 && popupLoading ? (
              <div>Loading...</div>
            ) : popupUsers.length === 0 ? (
              <div style={{ color: "#888" }}>No users found.</div>
            ) : (
              popupUsers.map((user, idx) => (
                <div
                  key={user.id}
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
                    onClick={async () => {
                      if (!currentUserId) return;
                      let url = "";
                      let method: "POST" | "DELETE" = "POST";
                      let newFollows = user.follows;
                      let action: "follow" | "unfollow" = user.follows ? "unfollow" : "follow";

                      if (user.follows) {
                        url = `${process.env.NEXT_PUBLIC_API_URL}/api/follow/${currentUserId}/unfollow/${user.id}`;
                        method = "DELETE";
                        newFollows = false;
                      } else {
                        url = `${process.env.NEXT_PUBLIC_API_URL}/api/follow/${currentUserId}/follow/${user.id}`;
                        method = "POST";
                        newFollows = true;
                      }

                      try {
                        const res = await fetch(url, { method });
                        const success = await res.json();
                        if (success) {
                          setPopupUsers((prev) =>
                            prev.map((u, i) =>
                              i === idx ? { ...u, follows: newFollows } : u
                            )
                          );
                          setPendingActions((prev) => [
                            ...prev.filter((a) => a.id !== user.id),
                            { id: user.id, action },
                          ]);
                        }
                      } catch (e) {
                        // Optionally show error
                      }
                    }}
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
              ))
            )}
            {popupLoading && popupUsers.length > 0 && (
              <div style={{ textAlign: "center", color: "#888", margin: "1rem 0" }}>
                Loading more...
              </div>
            )}
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
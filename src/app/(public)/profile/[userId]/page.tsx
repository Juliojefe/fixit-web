"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "../../../../context/UserContext";
import React, { useEffect, useState, useCallback } from "react";
import PostSummaryList from "@/components/PostSummaryList";
import UserSummaryList from "@/components/UserSummaryList";

// --- TYPE DEFINITIONS ---
interface ProfileData {
  name: string;
  profilePicUrl: string;
  followerCount: number;
  followingCount: number;
  followerIds: number[];
  followingIds: number[];
  ownedPostIds: number[];
  likedPostIds: number[];
  savedPostIds?: number[];
}

interface FollowStatus {
  follows: boolean;
  followsBack: boolean;
}

const DEFAULT_PROFILE = "https://ui-avatars.com/api/?name=User&background=cccccc&color=222222&size=128";

// --- COMPONENT ---
export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileUserId = Number(params.userId);

  const { user: viewer, accessToken, showLoginPopup } = useUser();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "liked">("posts");
  const [loading, setLoading] = useState(true);
  const [showFollowList, setShowFollowList] = useState<"followers" | "following" | null>(null);
  const [pendingActions, setPendingActions] = useState<{ id: number; action: "follow" | "unfollow" }[]>([]);

  const isOwnProfile = viewer?.userId === profileUserId;

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!profileUserId || isNaN(profileUserId)) return;

    const fetchProfileData = async () => {
      setLoading(true);
      const endpoint = isOwnProfile
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/user/${profileUserId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/user/${profileUserId}/profile`;
      
      const headers: HeadersInit = {};
      if (isOwnProfile && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      try {
        const res = await fetch(endpoint, { headers });
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setProfileData(data);

        if (!isOwnProfile && accessToken) {
          const followRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/follow/mutual/${profileUserId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (followRes.ok) setFollowStatus(await followRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileUserId, isOwnProfile, accessToken]);

  // --- ACTIONS & HANDLERS ---
  const handleFollowAction = useCallback((action: "follow" | "unfollow", targetUserId: number) => {
    if (!accessToken) {
      showLoginPopup();
      return Promise.resolve();
    }

    // Optimistic update for the main follow button
    if (targetUserId === profileUserId) {
        const originalStatus = followStatus;
        setFollowStatus(prev => ({ follows: !prev?.follows, followsBack: prev?.followsBack ?? false }));
        setProfileData(prev => prev ? { ...prev, followerCount: prev.followerCount + (action === 'follow' ? 1 : -1) } : null);
        
        const method = action === "follow" ? "POST" : "DELETE";
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/follow/${targetUserId}`, {
          method,
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => {
          // Revert on failure
          setFollowStatus(originalStatus); // Use the saved originalStatus to revert
          setProfileData(prev => prev ? { ...prev, followerCount: prev.followerCount + (action === 'follow' ? -1 : 1) } : null);
        });
    }

    // This part is for the popup, which doesn't need the same local optimistic update logic
    const method = action === "follow" ? "POST" : "DELETE";
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/follow/${targetUserId}`, {
      method,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }, [accessToken, profileUserId, followStatus, showLoginPopup]);

  const handleClosePopup = () => {
    if (pendingActions.length > 0 && isOwnProfile) {
      setProfileData((prev: any) => {
        let newData = { ...prev };
        pendingActions.forEach(({ id, action }) => {
          if (action === "follow" && !newData.followingIds.includes(id)) {
            newData.followingIds = [...newData.followingIds, id];
            newData.followingCount = (newData.followingCount || 0) + 1;
          } else if (action === "unfollow" && newData.followingIds.includes(id)) {
            newData.followingIds = newData.followingIds.filter((fid: number) => fid !== id);
            newData.followingCount = Math.max((newData.followingCount || 1) - 1, 0);
          }
        });
        return newData;
      });
    }
    setPendingActions([]);
    setShowFollowList(null);
  };

  const getFollowButtonText = () => {
    if (!followStatus) return "Follow";
    if (followStatus.follows) return "Following";
    if (followStatus.followsBack) return "Follow Back";
    return "Follow";
  };

  const getTabPostIds = () => {
    if (!profileData) {
      return [];
    }
    switch (activeTab) {
      case 'posts':
        return profileData.ownedPostIds || [];
      case 'liked':
        return profileData.likedPostIds || [];
      case 'saved':
        return isOwnProfile ? (profileData.savedPostIds || []) : [];
      default:
        return [];
    }
  };

  // --- RENDER LOGIC ---
  if (loading) {
    return <div style={styles.centeredMessage}>Loading...</div>;
  }
  if (!profileData) {
    return <div style={styles.centeredMessage}>User not found.</div>;
  }

  const popupUserIds = showFollowList === "followers" ? profileData.followerIds : profileData.followingIds;

  return (
    <>
      {/* Main Page Content */}
      <div style={styles.container}>
        {/* Profile Header Card */}
        <div style={styles.profileCard}>
          <img src={profileData.profilePicUrl || DEFAULT_PROFILE} alt={profileData.name} style={styles.profilePic} />
          <div style={styles.name}>{profileData.name}</div>
          <div style={styles.statsContainer}>
            <button onClick={() => setShowFollowList("followers")} style={styles.statButton}>
              <span>{profileData.followerCount}</span> Followers
            </button>
            <button onClick={() => setShowFollowList("following")} style={styles.statButton}>
              <span>{profileData.followingCount}</span> Following
            </button>
          </div>
          {isOwnProfile ? (
            <button style={styles.actionButton}>Edit Profile</button>
          ) : (
            <button onClick={() => handleFollowAction(followStatus?.follows ? 'unfollow' : 'follow', profileUserId)} style={styles.actionButton}>
              {getFollowButtonText()}
            </button>
          )}
        </div>

        {/* Posts Card */}
        <div style={styles.postsCard}>
          <div style={styles.tabs}>
            <button onClick={() => setActiveTab("posts")} style={activeTab === "posts" ? styles.activeTab : styles.tab}>Posts</button>
            {isOwnProfile && (
              <button onClick={() => setActiveTab("saved")} style={activeTab === "saved" ? styles.activeTab : styles.tab}>Saved</button>
            )}
            <button onClick={() => setActiveTab("liked")} style={activeTab === "liked" ? styles.activeTab : styles.tab}>Liked</button>
          </div>
          <div style={styles.postListContainer}>
            <PostSummaryList postIds={getTabPostIds()} />
          </div>
        </div>
      </div>

      {/* Followers/Following Popup */}
      {showFollowList && (
        <div style={styles.popupOverlay} onClick={handleClosePopup}>
          <div style={styles.followListPopup} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.followListTitle}>{showFollowList === "followers" ? "Followers" : "Following"}</h2>
            <button onClick={handleClosePopup} style={styles.closeButton}>×</button>
            {viewer?.userId && (
              <UserSummaryList
                userIds={popupUserIds}
                currentUserId={viewer.userId}
                renderUser={(user, idx, handleActionInPopup) => (
                  <div key={user.id} style={styles.userRow}>
                    <img src={user.profilePic || DEFAULT_PROFILE} alt={user.name} style={styles.userRowPic} />
                    <span style={styles.userRowName}>{user.name}</span>
                    {viewer?.userId !== user.id && (
                      <button
                        onClick={() => {
                          handleActionInPopup(user.follows ? "unfollow" : "follow", user, idx).then(() => {
                            if (isOwnProfile) {
                              setPendingActions(prev => [...prev.filter(a => a.id !== user.id), { id: user.id, action: user.follows ? "unfollow" : "follow" }]);
                            }
                          });
                        }}
                        style={user.follows ? styles.followingButton : styles.followButton}
                      >
                        {user.follows ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                )}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  centeredMessage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f6fa", color: "#222" },
  container: { height: "100%", overflowY: "auto", minHeight: "100vh", background: "#f5f6fa", color: "#222", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3rem", gap: "2rem" },
  profileCard: { background: "#fff", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "2rem 2.5rem", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 600 },
  profilePic: { width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "3px solid #0070f3", marginBottom: "1rem", background: "#eee" },
  name: { fontWeight: "bold", fontSize: "1.5rem", marginBottom: "0.5rem" },
  statsContainer: { display: "flex", gap: "2.5rem", marginBottom: "1.5rem" },
  statButton: { background: "none", border: "none", color: "#0070f3", fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" },
  actionButton: { padding: "0.5rem 1.5rem", background: "#0070f3", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", marginBottom: "0.5rem" },
  postsCard: { background: "#fff", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", width: "100%", maxWidth: 600, padding: "0", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "3rem" },
  tabs: { display: "flex", gap: "2.5rem", padding: "1.5rem 0", borderBottom: "1px solid #eee", width: "100%", justifyContent: "center" },
  tab: { background: "none", border: "none", color: "#222", fontWeight: "normal", fontSize: "1.1rem", borderBottom: "2px solid transparent", padding: "0.5rem 1rem", cursor: "pointer", transition: "color 0.2s, border-bottom 0.2s" },
  activeTab: { background: "none", border: "none", color: "#0070f3", fontWeight: "bold", fontSize: "1.1rem", borderBottom: "2px solid #0070f3", padding: "0.5rem 1rem", cursor: "pointer", transition: "color 0.2s, border-bottom 0.2s" },
  postListContainer: { width: "100%", minHeight: 400, background: "#fafbfc", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  popupOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0, 0, 0, 0.2)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  followListPopup: { background: "#fff", borderRadius: "12px", width: "100%", maxWidth: 400, height: "70vh", maxHeight: 500, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", position: "relative" },
  followListTitle: { padding: "1rem", margin: 0, textAlign: "center", borderBottom: "1px solid #eee", color: "#0070f3" },
  closeButton: { position: "absolute", top: 8, right: 16, background: "none", border: "none", fontSize: "1.8rem", color: "#888", cursor: "pointer" },
  userRow: { display: "flex", alignItems: "center", gap: "1.2rem", padding: "0.8rem 1.5rem", borderBottom: "1px solid #ddd" },
  userRowPic: { width: 40, height: 40, borderRadius: "50%", objectFit: "cover" },
  userRowName: { flex: 1, fontWeight: 500, fontSize: "1.05rem", color: '#222' },
  followButton: { background: "#0070f3", color: "#fff", border: "none", borderRadius: "8px", padding: "0.4rem 1.2rem", fontWeight: "bold", cursor: "pointer", fontSize: "1rem", minWidth: 90, textAlign: "center" },
  followingButton: { background: "#eee", color: "#222", border: "1px solid #ddd", borderRadius: "8px", padding: "0.4rem 1.2rem", fontWeight: "bold", cursor: "pointer", fontSize: "1rem", minWidth: 90, textAlign: "center" },
};
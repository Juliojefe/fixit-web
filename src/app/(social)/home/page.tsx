"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";
import PostSummaryList from "@/components/PostSummaryList";

export default function HomePage() {
  // The parent SocialLayout handles loading states and redirection.
  const { user, accessToken } = useUser();
  const [postIds, setPostIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We only proceed if we have a user and a token.
    if (user && accessToken) {
      async function fetchPostIds() {
        setLoading(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/post/all-ids`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!res.ok) {
            throw new Error("Failed to fetch posts. Please try again.");
          }
          const data = await res.json();
          setPostIds(Array.isArray(data) ? data : []);
        } catch (e) {
          console.error("Error fetching post IDs:", e);
          setPostIds([]);
        }
        setLoading(false);
      }
      fetchPostIds();
    }
  }, [user, accessToken]); // Re-run this effect if the user or token changes.

  // The layout handles the case where there is no user.
  if (!user) return null;

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
      <div style={{ width: "100%", maxWidth: 600, height: "90vh" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#888",
              marginTop: "2rem",
            }}
          >
            Loading posts...
          </div>
        ) : (
          <PostSummaryList postIds={postIds} currentUserId={user.userId} />
        )}
      </div>
    </div>
  );
}
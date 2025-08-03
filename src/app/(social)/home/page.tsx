"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "../../../context/UserContext";
import PostSummaryList from "@/components/PostSummaryList";

export default function HomePage() {
  const { user, accessToken } = useUser();
  const [postIds, setPostIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Define the data fetching logic with useCallback.
  // It depends on accessToken, so it will be re-created if the token changes.
  const fetchPostIds = useCallback(async () => {
    // Add this console log to see the exact token being used.
    // console.log("Attempting to fetch post IDs with token:", accessToken);

    // Guard clause: ensure we have a token before fetching.
    if (!accessToken) {
      console.error("Fetch aborted: No access token available.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/post/all-ids`,
        {
          headers: {
            // Remove the "Bearer " prefix to match the successful curl command
            Authorization: `${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        let errorDetails = `Failed with status: ${res.status}`;
        try {
          const errorData = await res.json();
          errorDetails += `, Body: ${JSON.stringify(errorData)}`;
        } catch (e) {
          errorDetails += `, Body: Not a JSON response.`;
        }
        throw new Error(errorDetails);
      }

      const data = await res.json();
      setPostIds(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching post IDs:", e);
      setPostIds([]);
    }
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    // We only proceed if we have a user. The fetch function itself handles the token check.
    if (user) {
      fetchPostIds();
    }
  }, [user, fetchPostIds]); // Depend on user and the memoized function.

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
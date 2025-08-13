"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "../../../context/UserContext";
import PostSummaryList from "@/components/PostSummaryList";

export default function HomePage() {
  const { user, accessToken } = useUser();
  const [postIds, setPostIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPostIds = useCallback(async () => {
    if (!accessToken) {
      console.error("Fetch aborted: No access token available.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/post/following`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
    if (accessToken) {
      fetchPostIds();
    }
  }, [accessToken, fetchPostIds]);

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
          <PostSummaryList postIds={postIds} />
        )}
      </div>
    </div>
  );
}
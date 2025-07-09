"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import PostSummaryList from "@/components/PostSummaryList";

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [postIds, setPostIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchPostIds() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/post/all-ids`
        );
        const data = await res.json();
        setPostIds(Array.isArray(data) ? data : []);
      } catch (e) {
        setPostIds([]);
      }
      setLoading(false);
    }
    fetchPostIds();
  }, []);

  if (!user) return null;

  function handleLogout() {
    setUser(null);
  }

  function handleProfileClick() {
    router.push("/profile");
  }

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
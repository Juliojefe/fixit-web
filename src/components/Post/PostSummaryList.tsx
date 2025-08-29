"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Post from "./Post";

type PostSummary = {
  id: number;
  authorId: number; // userId
  description: string;
  createdBy: string;
  createdByProfilePicUrl: string;
  createdAt: string;
  likeIds: number[];
  likeCount: number;
  commentIds: number[];
  commentCount: number;
  imageUrls: string[];
  savedIds: number[];
};

type PostSummaryListProps = {
  postIds: number[];
  currentUserId?: number;
};

const BATCH_SIZE = 5;
const DEBOUNCE_MS = 120;

function debounce(fn: (...args: any[]) => void, ms: number) {
  let timeout: any;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

export default function PostSummaryList({ postIds, currentUserId }: PostSummaryListProps) {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch a batch of posts
  const fetchPostBatch = useCallback(
    async (ids: number[]) => {
      setLoading(true);
      try {
        const batch = await Promise.all(
          ids.map(async (id) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/post/${id}`);
            const data = await res.json();
            return { ...data, id };
          })
        );
        setPosts((prev) => [
          ...prev,
          ...batch.filter((newPost) => !prev.some((p) => p.id === newPost.id)),
        ]);
      } catch (e) {
        console.error("Failed to fetch post batch:", e);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setPosts([]);
    if (postIds.length > 0) {
      fetchPostBatch(postIds.slice(0, BATCH_SIZE));
    }
  }, [postIds, fetchPostBatch]);

  // Debounced scroll handler
  const handleScroll = useCallback(
    debounce(() => {
      if (!contentRef.current || loading) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 120 && posts.length < postIds.length) {
        const nextBatch = postIds.slice(posts.length, posts.length + BATCH_SIZE);
        fetchPostBatch(nextBatch);
      }
    }, DEBOUNCE_MS),
    [posts, postIds, loading, fetchPostBatch]
  );

  useEffect(() => {
    const ref = contentRef.current;
    if (!ref) return;
    ref.addEventListener("scroll", handleScroll);
    return () => ref.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // UI
  return (
    <div
      ref={contentRef}
      style={{
        overflowY: "auto",
        maxHeight: 600,
        width: "100%",
        padding: 0,
        background: "none",
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
      }}
      className="hide-scrollbar"
    >
      {posts.map((post) => (
        <Post key={post.id} initialPost={post} />
      ))}
      {loading && (
        <div style={{ textAlign: "center", color: "#888", margin: "1rem 0" }}>
          Loading more...
        </div>
      )}
    </div>
  );
}
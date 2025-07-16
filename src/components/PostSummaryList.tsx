"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark } from "react-icons/fa";

type PostSummary = {
  id: number;
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
  currentUserId: number;
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

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2419200) return `${Math.floor(diff / 604800)} weeks ago`;
  return `${Math.floor(diff / 31536000)} years ago`;
}

export default function PostSummaryList({ postIds, currentUserId }: PostSummaryListProps) {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [liked, setLiked] = useState<{ [postId: number]: boolean }>({});
  const [saved, setSaved] = useState<{ [postId: number]: boolean }>({});
  const [expanded, setExpanded] = useState<{ [postId: number]: boolean }>({});
  const [imageIndex, setImageIndex] = useState<{ [postId: number]: number }>({});

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
        // Initialize liked and saved state based on loaded posts
        setLiked((prev) => ({
          ...prev,
          ...Object.fromEntries(
            batch.map((post) => [post.id, Array.isArray(post.likeIds) && post.likeIds.includes(currentUserId)])
          ),
        }));
        setSaved((prev) => ({
          ...prev,
          ...Object.fromEntries(
            batch.map((post) => [post.id, Array.isArray(post.savedIds) && post.savedIds.includes(currentUserId)])
          ),
        }));
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    },
    [currentUserId]
  );

  // Load first batch on mount or when postIds change
  useEffect(() => {
    setPosts([]);
    setLoadedCount(0);
    if (postIds.length > 0) {
      fetchPostBatch(postIds.slice(0, BATCH_SIZE));
      setLoadedCount(BATCH_SIZE);
    }
  }, [postIds, fetchPostBatch]);

  // Debounced scroll handler
  const handleScroll = useCallback(
    debounce(() => {
      if (!contentRef.current || loading) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 120 && loadedCount < postIds.length) {
        const nextBatch = postIds.slice(loadedCount, loadedCount + BATCH_SIZE);
        fetchPostBatch(nextBatch);
        setLoadedCount((prev) => prev + nextBatch.length);
      }
    }, DEBOUNCE_MS),
    [loadedCount, postIds, loading, fetchPostBatch]
  );

  useEffect(() => {
    const ref = contentRef.current;
    if (!ref) return;
    ref.addEventListener("scroll", handleScroll);
    return () => ref.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Add these async handlers inside your component:
  const handleLike = async (postId: number) => {
    const wasLiked = liked[postId];
    // Optimistically update UI
    setLiked((prev) => ({ ...prev, [postId]: !wasLiked }));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likeCount: post.likeCount + (!wasLiked ? 1 : -1),
              likeIds: !wasLiked
                ? [...(post.likeIds || []), currentUserId]
                : (post.likeIds || []).filter((id) => id !== currentUserId),
            }
          : post
      )
    );

    try {
      if (!wasLiked) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/post/like-post/${postId}/${currentUserId}`,
          { method: "POST" }
        );
      } else {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/post/unlike-post/${postId}/${currentUserId}`,
          { method: "DELETE" }
        );
      }
    } catch (e) {
      // Revert if API fails
      setLiked((prev) => ({ ...prev, [postId]: wasLiked }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likeCount: post.likeCount + (wasLiked ? 1 : -1),
                likeIds: wasLiked
                  ? [...(post.likeIds || []), currentUserId]
                  : (post.likeIds || []).filter((id) => id !== currentUserId),
              }
            : post
        )
      );
    }
  };

  const handleSave = async (postId: number) => {
    if (!saved[postId]) {
      // Save post
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/post/save-post/${postId}/${currentUserId}`,
        { method: "POST" }
      );
      if (await res.json()) {
        setSaved((prev) => ({ ...prev, [postId]: true }));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  savedIds: [...(post.savedIds || []), currentUserId],
                }
              : post
          )
        );
      }
    } else {
      // Unsave post
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/post/unSave-post/${postId}/${currentUserId}`,
        { method: "DELETE" }
      );
      if (await res.json()) {
        setSaved((prev) => ({ ...prev, [postId]: false }));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  savedIds: (post.savedIds || []).filter((id) => id !== currentUserId),
                }
              : post
          )
        );
      }
    }
  };

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
        <div
          key={post.id}
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            margin: "2rem 0",
            maxWidth: 500,
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            paddingBottom: "1rem",
            border: "1px solid #f0f0f0",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", padding: "1rem 1.2rem 0.5rem 1.2rem" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                overflow: "hidden",
                marginRight: 12,
                border: "2px solid #eee",
                cursor: "pointer",
              }}
              onClick={() => alert("Profile under construction")}
              title="Profile under construction"
            >
              <img
                src={post.createdByProfilePicUrl}
                alt={post.createdBy}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                  display: "block",
                }}
              />
            </div>
            <span style={{ fontWeight: 600, fontSize: "1.08rem", color: "#222" }}>{post.createdBy}</span>
          </div>

          {/* Images */}
          {post.imageUrls && post.imageUrls.length > 0 && (
            <div
              style={{
                width: "100%",
                position: "relative",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 320,
                maxHeight: 420,
                overflow: "hidden",
              }}
            >
              <img
                src={post.imageUrls[imageIndex[post.id] || 0]}
                alt="post"
                style={{
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "cover",
                  borderRadius: 0,
                  display: "block",
                }}
              />
              {/* Image navigation arrows if more than one */}
              {post.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setImageIndex((prev) => ({
                        ...prev,
                        [post.id]: Math.max((prev[post.id] || 0) - 1, 0),
                      }))
                    }
                    disabled={(imageIndex[post.id] || 0) === 0}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.4)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      fontSize: 18,
                      cursor: "pointer",
                      zIndex: 2,
                      opacity: (imageIndex[post.id] || 0) === 0 ? 0.5 : 1,
                    }}
                  >
                    {"<"}
                  </button>
                  <button
                    onClick={() =>
                      setImageIndex((prev) => ({
                        ...prev,
                        [post.id]: Math.min(
                          (prev[post.id] || 0) + 1,
                          post.imageUrls.length - 1
                        ),
                      }))
                    }
                    disabled={(imageIndex[post.id] || 0) === post.imageUrls.length - 1}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.4)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      fontSize: 18,
                      cursor: "pointer",
                      zIndex: 2,
                      opacity:
                        (imageIndex[post.id] || 0) === post.imageUrls.length - 1 ? 0.5 : 1,
                    }}
                  >
                    {">"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "1rem 1.2rem 0.2rem 1.2rem" }}>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleLike(post.id)}
            >
              {liked[post.id] ? (
                <FaHeart color="#e74c3c" size={22} />
              ) : (
                <FaRegHeart color="#222" size={22} />
              )}
            </span>
            <span style={{ cursor: "pointer" }}>
              <FaRegComment color="#222" size={22} />
            </span>
            <span
              style={{ cursor: "pointer", marginLeft: "auto" }}
              onClick={() => handleSave(post.id)}
            >
              {saved[post.id] ? (
                <FaBookmark color="#0070f3" size={20} />
              ) : (
                <FaRegBookmark color="#222" size={20} />
              )}
            </span>
          </div>

          {/* Like count */}
          <div style={{ fontWeight: 600, fontSize: "1.02rem", padding: "0.2rem 1.2rem" }}>
            {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
          </div>

          {/* Description */}
          <div style={{ padding: "0.2rem 1.2rem", fontSize: "1.03rem", color: "#222" }}>
            <span style={{ fontWeight: 600 }}>{post.createdBy}</span>{" "}
            {post.description.length > 120 && !expanded[post.id]
              ? (
                <>
                  {post.description.slice(0, 120)}...
                  <span
                    style={{ color: "#0070f3", cursor: "pointer", fontWeight: 500, marginLeft: 4 }}
                    onClick={() =>
                      setExpanded((prev) => ({ ...prev, [post.id]: true }))
                    }
                  >
                    Read more
                  </span>
                </>
              )
              : post.description}
          </div>

          {/* Comments link */}
          <div style={{ padding: "0.2rem 1.2rem", color: "#888", fontSize: "0.98rem", cursor: "pointer" }}>
            View all {post.commentCount} comments
          </div>

          {/* Time ago */}
          <div style={{ padding: "0.2rem 1.2rem", color: "#bbb", fontSize: "0.93rem" }}>
            {timeAgo(post.createdAt)}
          </div>
        </div>
      ))}
      {loading && (
        <div style={{ textAlign: "center", color: "#888", margin: "1rem 0" }}>
          Loading more...
        </div>
      )}
    </div>
  );
}
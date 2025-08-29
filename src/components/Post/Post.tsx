// src/components/Post/Post.tsx
import React, { useState } from "react";
import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { timeAgo } from "./utils";
import {
  containerStyle,
  headerStyle,
  profilePicContainerStyle,
  profilePicStyle,
  usernameStyle,
  imageContainerStyle,
  imageStyle,
  arrowButtonStyle,
  actionsStyle,
  iconStyle,
  likeCountStyle,
  descriptionStyle,
  readMoreStyle,
  commentsStyle,
  timeAgoStyle,
} from "./Post.styles";

export type PostSummary = {
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

type PostProps = {
  initialPost: PostSummary;
};

export default function Post({ initialPost }: PostProps) {
  const [post, setPost] = useState(initialPost);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const { user, accessToken, showLoginPopup } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    const isLiked = user ? (Array.isArray(post.likeIds) && post.likeIds.includes(user.userId)) : false;
    const isSaved = user ? (Array.isArray(post.savedIds) && post.savedIds.includes(user.userId)) : false;
    setLiked(isLiked);
    setSaved(isSaved);
  }, [user, post]);

  const handleLike = async () => {
    if (!accessToken || !user) {
      showLoginPopup();
      return;
    }
    const wasLiked = liked;

    // Optimistically update UI
    setLiked(!wasLiked);
    setPost((prev) => ({
      ...prev,
      likeCount: prev.likeCount + (!wasLiked ? 1 : -1),
      likeIds: !wasLiked
        ? [...(prev.likeIds || []), user.userId]
        : (prev.likeIds || []).filter((id) => id !== user.userId),
    }));

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/post/${post.id}/like`;
      const method = wasLiked ? "DELETE" : "POST";

      await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      // Revert if API fails
      setLiked(wasLiked);
      setPost((prev) => ({
        ...prev,
        likeCount: prev.likeCount + (wasLiked ? 1 : -1),
        likeIds: wasLiked
          ? [...(prev.likeIds || []), user.userId]
          : (prev.likeIds || []).filter((id) => id !== user.userId),
      }));
    }
  };

  const handleSave = async () => {
    if (!accessToken || !user) {
      showLoginPopup();
      return;
    }
    const wasSaved = saved;

    // Optimistically update UI
    setSaved(!wasSaved);
    setPost((prev) => ({
      ...prev,
      savedIds: !wasSaved
        ? [...(prev.savedIds || []), user.userId]
        : (prev.savedIds || []).filter((id) => id !== user.userId),
    }));

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/post/${post.id}/save`;
      const method = wasSaved ? "DELETE" : "POST";

      await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      // Revert if API fails
      setSaved(wasSaved);
      setPost((prev) => ({
        ...prev,
        savedIds: wasSaved
          ? [...(prev.savedIds || []), user.userId]
          : (prev.savedIds || []).filter((id) => id !== user.userId),
      }));
    }
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div
          style={profilePicContainerStyle}
          onClick={() => router.push(`/profile/${post.authorId}`)}
          title={`View ${post.createdBy}'s profile`}
        >
          <img
            src={post.createdByProfilePicUrl}
            alt={post.createdBy}
            style={profilePicStyle}
          />
        </div>
        <span style={usernameStyle}>{post.createdBy}</span>
      </div>

      {/* Images */}
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div style={imageContainerStyle}>
          <img
            src={post.imageUrls[imageIndex]}
            alt="post"
            style={imageStyle}
          />
          {/* Image navigation arrows if more than one */}
          {post.imageUrls.length > 1 && (
            <>
              <button
                onClick={() =>
                  setImageIndex(Math.max(imageIndex - 1, 0))
                }
                disabled={imageIndex === 0}
                style={{
                  ...arrowButtonStyle,
                  left: 10,
                  opacity: imageIndex === 0 ? 0.5 : 1,
                }}
              >
                {"<"}
              </button>
              <button
                onClick={() =>
                  setImageIndex(Math.min(imageIndex + 1, post.imageUrls.length - 1))
                }
                disabled={imageIndex === post.imageUrls.length - 1}
                style={{
                  ...arrowButtonStyle,
                  right: 10,
                  opacity: imageIndex === post.imageUrls.length - 1 ? 0.5 : 1,
                }}
              >
                {">"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={actionsStyle}>
        <span
          style={iconStyle}
          onClick={handleLike}
        >
          {liked ? (
            <FaHeart color="#e74c3c" size={22} />
          ) : (
            <FaRegHeart color="#222" size={22} />
          )}
        </span>
        <span style={iconStyle}>
          <FaRegComment color="#222" size={22} />
        </span>
        <span
          style={{ ...iconStyle, marginLeft: "auto" }}
          onClick={handleSave}
        >
          {saved ? (
            <FaBookmark color="#0070f3" size={20} />
          ) : (
            <FaRegBookmark color="#222" size={20} />
          )}
        </span>
      </div>
      {/* Like count */}
      <div style={likeCountStyle}>
        {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
      </div>

      {/* Description */}
      <div style={descriptionStyle}>
        <span style={{ fontWeight: 600 }}>{post.createdBy}</span>{" "}
        {post.description.length > 120 && !expanded
          ? (
            <>
              {post.description.slice(0, 120)}...
              <span
                style={readMoreStyle}
                onClick={() => setExpanded(true)}
              >
                Read more
              </span>
            </>
          )
          : post.description}
      </div>

      {/* Comments link */}
      <div style={commentsStyle}>
        View all {post.commentCount} comments
      </div>

      {/* Time ago */}
      <div style={timeAgoStyle}>
        {timeAgo(post.createdAt)}
      </div>
    </div>
  );
}
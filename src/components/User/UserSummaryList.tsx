// src/components/User/UserSummaryList.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "../../context/UserContext";
import User, { UserSummary } from "./User";
import { debounce } from "./utils";
import {
  containerStyle,
  loadingStyle,
  noUsersStyle,
  loadingMoreStyle,
} from "./UserSummaryList.styles";

const DEFAULT_PROFILE = "https://ui-avatars.com/api/?name=User&background=cccccc&color=222222&size=128";

const BATCH_SIZE = 10;
const DEBOUNCE_MS = 200;

type UserSummaryListProps = {
  userIds: number[];
  currentUserId?: number;
  renderUser: (
    user: UserSummary,
    idx: number,
    handleAction: (action: "follow" | "unfollow", user: UserSummary, idx: number) => Promise<void>,
    onProfileClick: () => void
  ) => React.ReactNode;
  onAction?: (userId: number, action: "follow" | "unfollow") => void;
  style?: React.CSSProperties;
  className?: string;
};

export default function UserSummaryList({
  userIds,
  currentUserId,
  renderUser,
  onAction,
  style,
  className,
}: UserSummaryListProps) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const { accessToken } = useUser();

  const fetchUserBatch = useCallback(
    async (ids: number[]) => {
      if (ids.length === 0) return;
      setLoading(true);
      try {
        const batch = await Promise.all(
          ids.map(async (id, index) => {
            // If logged in, get full follow status.
            if (accessToken) {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/follow/mutual/${id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  }
                }
              );
              const data = await res.json();
              return { ...data, id };
            } 
            // If not logged in
            else {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/summary/${id}`);
              const data = await res.json();
              console.log(`Call #${index + 1} for user summary (ID: ${id}):`, data);
              return {
                id: id,
                name: data.name,
                profilePic: data.profilePic || DEFAULT_PROFILE,
                follows: false,
                followsBack: false,
              };
            }
          })
        );
        setUsers((prev) => [
          ...prev,
          ...batch.filter((newUser) => !prev.some((u) => u.id === newUser.id)),
        ]);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    setUsers([]);
    setLoadedCount(0);
    if (userIds.length > 0) {
      fetchUserBatch(userIds.slice(0, BATCH_SIZE));
      setLoadedCount(BATCH_SIZE);
    }
  }, [userIds, fetchUserBatch]);

  const handleScroll = useCallback(
    debounce(() => {
      if (!contentRef.current || loading) return;
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 40) {
        if (loadedCount < userIds.length) {
          const nextBatch = userIds.slice(loadedCount, loadedCount + BATCH_SIZE);
          fetchUserBatch(nextBatch);
          setLoadedCount((prev) => prev + BATCH_SIZE);
        }
      }
    }, DEBOUNCE_MS),
    [loadedCount, userIds, loading, fetchUserBatch]
  );

  // Attach scroll handler
  useEffect(() => {
    const ref = contentRef.current;
    if (!ref) return;
    ref.addEventListener("scroll", handleScroll);
    return () => {
      ref.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      ref={contentRef}
      style={{
        ...containerStyle,
        ...style,
      }}
      className={`hide-scrollbar${className ? " " + className : ""}`}
    >
      {users.length === 0 && loading ? (
        <div style={loadingStyle}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={noUsersStyle}>No users found.</div>
      ) : (
        users.map((user, idx) => (
          <User
            key={user.id}
            initialUser={user}
            idx={idx}
            onAction={onAction}
          >
            {(user, handleAction, onProfileClick) =>
              renderUser(user, idx, handleAction, onProfileClick)
            }
          </User>
        ))
      )}
      {loading && users.length > 0 && (
        <div style={loadingMoreStyle}>
          Loading more...
        </div>
      )}
    </div>
  );
}
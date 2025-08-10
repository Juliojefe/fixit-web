import React, { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "../context/UserContext";

const DEFAULT_PROFILE = "https://ui-avatars.com/api/?name=User&background=cccccc&color=222222&size=128";

const BATCH_SIZE = 10;
const DEBOUNCE_MS = 200;

function debounce(fn: (...args: any[]) => void, ms: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

export type UserSummary = {
  id: number;
  name: string;
  profilePic: string;
  follows: boolean;
  followsBack: boolean;
};

type UserSummaryListProps = {
  userIds: number[];
   currentUserId: number;
  renderUser: (
    user: UserSummary,
    idx: number,
    handleAction: (action: "follow" | "unfollow", user: UserSummary, idx: number) => Promise<void>
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
      if (!accessToken || ids.length === 0) return;
      setLoading(true);
      try {
        const batch = await Promise.all(
          ids.map(async (id) => {
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

  // Handler for follow/unfollow actions
  const handleAction = async (
    action: "follow" | "unfollow",
    user: UserSummary,
    idx: number
  ) => {
    if (!accessToken) return;

    const originalUsers = [...users];
    const wasFollowing = user.follows;

    // Optimistically update UI
    setUsers((prev) =>
      prev.map((u, i) =>
        i === idx ? { ...u, follows: action === "follow" } : u
      )
    );

    let url = "";
    let method: "POST" | "DELETE" = "POST";

    if (action === "follow") {
      url = `${process.env.NEXT_PUBLIC_API_URL}/api/follow/${user.id}`;
      method = "POST";
    } else {
      url = `${process.env.NEXT_PUBLIC_API_URL}/api/follow/${user.id}`;
      method = "DELETE";
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const success = await res.json();
      if (!success) {
        // Revert on failure
        setUsers(originalUsers);
      } else {
        // Propagate successful action
        if (onAction) onAction(user.id, action);
      }
    } catch (e) {
      setUsers(originalUsers);
    }
  };

  return (
    <div
      ref={contentRef}
      style={{
        overflowY: "auto",
        maxHeight: 480,
        ...style,
      }}
      className={`hide-scrollbar${className ? " " + className : ""}`}
    >
      {users.length === 0 && loading ? (
        <div>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ color: "#888" }}>No users found.</div>
      ) : (
        users.map((user, idx) =>
          renderUser(user, idx, handleAction)
        )
      )}
      {loading && users.length > 0 && (
        <div style={{ textAlign: "center", color: "#888", margin: "1rem 0" }}>
          Loading more...
        </div>
      )}
    </div>
  );
}
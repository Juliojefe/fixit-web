// src/components/User/User.tsx
import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";

export type UserSummary = {
  id: number;
  name: string;
  profilePic: string;
  follows: boolean;
  followsBack: boolean;
};

type UserProps = {
  initialUser: UserSummary;
  idx: number;
  onAction?: (userId: number, action: "follow" | "unfollow") => void;
  children: (
    user: UserSummary,
    handleAction: (action: "follow" | "unfollow", user: UserSummary, idx: number) => Promise<void>,
    onProfileClick: () => void
  ) => React.ReactNode;
};

export default function User({
  initialUser,
  idx,
  onAction,
  children,
}: UserProps) {
  const [user, setUser] = useState(initialUser);
  const { accessToken, showLoginPopup } = useUser();
  const router = useRouter();

  const handleAction = async (
    action: "follow" | "unfollow",
    _user: UserSummary, // Ignored, use local user
    _idx: number // Ignored
  ) => {
    // If user is not logged in, show the popup and stop.
    if (!accessToken) {
      showLoginPopup();
      return;
    }

    const originalUser = { ...user };

    // Optimistically update UI
    setUser({
      ...user,
      follows: action === "follow",
    });

    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/follow/${user.id}`;
    let method: "POST" | "DELETE" = "POST";

    if (action === "follow") {
      method = "POST";
    } else {
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
        setUser(originalUser);
      } else {
        // Propagate successful action
        if (onAction) onAction(user.id, action);
      }
    } catch (e) {
      setUser(originalUser);
    }
  };

  const onProfileClick = () => {
    router.push(`/profile/${user.id}`);
  };

  return children(user, handleAction, onProfileClick);
}
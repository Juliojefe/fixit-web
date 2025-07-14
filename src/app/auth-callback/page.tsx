"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../context/UserContext";
export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUser();

  useEffect(() => {
    const success = searchParams.get("success") === "true";
    const userId = parseInt(searchParams.get("userId") || "0", 10);
    const name = decodeURIComponent(searchParams.get("name") || "");
    const email = decodeURIComponent(searchParams.get("email") || "");
    const profilePic = decodeURIComponent(searchParams.get("profilePic") || "");
    const isGoogle = searchParams.get("isGoogle") === "true";

    if (success) {
      setUser({ userId, name, email, profilePic, isGoogle });
      router.push("/home"); // Redirect to home page on success
    } else {
      router.push("/login?error=Authentication failed"); // Redirect to login on failure
    }
  }, [searchParams, setUser, router]);

  return <div>Processing authentication...</div>;
}
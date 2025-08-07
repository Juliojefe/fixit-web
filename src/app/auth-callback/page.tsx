"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../context/UserContext";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useUser();

  useEffect(() => {
    const success = searchParams.get("success") === "true";
    const name = decodeURIComponent(searchParams.get("name") || "");
    const email = decodeURIComponent(searchParams.get("email") || "");
    const profilePic = decodeURIComponent(searchParams.get("profilePic") || "");
    const isGoogle = searchParams.get("isGoogle") === "true";
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    // Check if the authentication was successful AND we received all necessary data
    if (success && name && email && accessToken && refreshToken) {
      const authData = {
        name,
        email,
        profilePic,
        isGoogle,
        accessToken,
        refreshToken,
      };

      login(authData);
      console.log("Login called with:", authData);
      router.push("/home");
    } else {
      router.push("/login?error=Authentication failed. Please try again.");
    }
  }, [searchParams, login, router]);

  return <div>Processing authentication...</div>;
}
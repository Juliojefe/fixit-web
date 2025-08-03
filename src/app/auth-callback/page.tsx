"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../context/UserContext";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useUser();

  useEffect(() => {
    // Extract all user and token data from the URL query parameters
    const success = searchParams.get("success") === "true";
    const userId = parseInt(searchParams.get("userId") || "0", 10);
    const name = decodeURIComponent(searchParams.get("name") || "");
    const email = decodeURIComponent(searchParams.get("email") || "");
    const profilePic = decodeURIComponent(searchParams.get("profilePic") || "");
    const isGoogle = searchParams.get("isGoogle") === "true";
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    // Check if the authentication was successful AND we received the necessary tokens
    if (success && accessToken && refreshToken) {
      const userData = { userId, name, email, profilePic, isGoogle };
      const tokens = { accessToken, refreshToken };

      login(userData, tokens);  // Call the login function to establish the session
      console.log("Login called with:", userData, tokens);
      router.push("/home");
    } else {
      router.push("/login?error=Authentication failed. Please try again.");
    }
  }, [searchParams, login, router]);

  return <div>Processing authentication...</div>;
}
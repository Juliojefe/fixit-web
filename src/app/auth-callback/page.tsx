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
      router.push("/home");
    } else {
      router.push("/login?error=Authentication failed. Please try again.");
    }
  }, [searchParams, login, router]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img
          src="https://media1.tenor.com/m/KEzW7ALwfUAAAAAC/cat-what.gif"
          alt="Loading cat"
          style={styles.gif}
        />
        <p style={styles.text}>Processing authentication</p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f2f5",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  gif: {
    width: "300px",
    height: "300px",
    marginBottom: "1rem",
  },
  spinner: {
    border: "4px solid rgba(0, 0, 0, 0.1)",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    borderLeftColor: "#09f",
    marginBottom: "1rem",
    animation: "spin 1s ease infinite",
  },
  text: {
    fontSize: "1.1rem",
    color: "#333",
    fontWeight: 500,
  },
};

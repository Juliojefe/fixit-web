"use client";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6fa",
        color: "#222",
      }}
    >
      <h1>Welcome to the Create page, at this time it is under construction</h1>
      <button
        onClick={() => router.push("/home")}
        style={{
          marginTop: "2rem",
          padding: "0.7rem 1.5rem",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Go back
      </button>
    </div>
  );
}
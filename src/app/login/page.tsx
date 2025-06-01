"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Not connected to the backend");
  }

  function handleSignUp() {
    // navigate to a sign up page here
    alert("Sign up not implemented");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6fa",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          padding: "2.5rem 2rem",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          minWidth: "340px",
          background: "#fff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ color: "#222", marginBottom: "1rem" }}>Login</h2>
        <label style={{ color: "#555", fontWeight: 500 }}>
          Email
          <input
            type="email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.25rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#fafbfc",
              color: "#222",
              fontSize: "1rem",
            }}
          />
        </label>
        <label style={{ color: "#555", fontWeight: 500 }}>
          Password
          <input
            type="password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.25rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "#fafbfc",
              color: "#222",
              fontSize: "1rem",
            }}
          />
        </label>
        <button
          type="submit"
          style={{
            padding: "0.7rem",
            fontWeight: "bold",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "0.5rem",
            transition: "background 0.2s",
          }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleSignUp}
          style={{
            padding: "0.7rem",
            fontWeight: "bold",
            background: "#e0e0e0",
            color: "#222",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "0.5rem",
            transition: "background 0.2s",
          }}
        >
          Sign up
        </button>
        {message && (
          <div style={{ color: "#d32f2f", marginTop: "1rem", textAlign: "center" }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

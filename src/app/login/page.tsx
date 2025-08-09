"use client";

import React from "react";
import axios from 'axios';
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    try {
      // 1. Call the login endpoint
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email: email,
        password: password,
      });

      // 2. The entire response.data is the AuthResponse object
      const authData = response.data;

      // 3. Pass the complete object to the context's login function
      login(authData);
      
      router.push("/home");

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data.message || "Login failed. Please check your credentials.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again later.");
      }
    }
  }

  function handleSignUp() {
    router.push("/signUp");
  }

  function handleLoginWithGoogle() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`;
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
              background: "#fafbfc",
              color: "#222",
              fontSize: "1rem",
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.25rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
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
              background: "#fafbfc",
              color: "#222",
              fontSize: "1rem",
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.25rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
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
          Create Account
        </button>
        <button
          type="button"
          onClick={handleLoginWithGoogle}
          style={{
            padding: "0.7rem",
            fontWeight: "bold",
            background: "#fff",
            color: "#222",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png"
            alt="Google"
            style={{ width: 20, height: 20 }}
          />
          Continue with Google
        </button>
        {errorMessage && (
          <div style={{
            color: "#d32f2f",
            fontSize: "0.85rem",
            marginTop: "1.2rem",
            textAlign: "center",
            whiteSpace: "pre-line"
          }}>
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
}

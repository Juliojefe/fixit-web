"use client";

import React from "react";

export default function SignUpPage() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Not connected to the backend");
  }

  function hangleSignIn() {
    // navigate to a sign in page here
    alert("Sign in not implemented");
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
        <h2 style = {{ color: "#222", marginBottom: "1rem" }}>Sign Up</h2>
        <label style = {{ color: "#555", fontWeight: 500 }}>
        First Name
        <input
          type="text"
          value={firstName}
          required
          onChange={e => setFirstName(e.target.value)}
          style= {{
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
        <label style = {{ color: "#555", fontWeight: 500 }}>
        Last Name
        <input
          type="text"
          value={lastName}
          required
          onChange={e => setLastName(e.target.value)}
          style= {{
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
        <label style = {{ color: "#555", fontWeight: 500 }}>
          Email
          <input
            type = "email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            style = {{
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
        <label style = {{ color : "#555", fontWeight: 500}}>
          Password
          <input
            type = "password"
            value = {password}
            required
            onChange = {e => setPassword(e.target.value)}
            style = {{
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
            <label style = {{ color: "#555", fontWeight: 500 }}>
              Confirm Password
              <input
                type = "password"
                value= {confirmPassword}
                required
                onChange = {e => setConfirmPassword(e.target.value)}
                style = {{
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
              type = "submit"
              style = {{
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
              >Sign Up</button>
              <button
                type = "button"
                onClick = {hangleSignIn}
                style = {{
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
              >Login</button>    
      </form>
    </div>
  );
}
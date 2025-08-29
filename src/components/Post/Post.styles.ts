import React from "react";

export const containerStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  margin: "2rem 0",
  maxWidth: 500,
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
  paddingBottom: "1rem",
  border: "1px solid #f0f0f0",
};

export const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "1rem 1.2rem 0.5rem 1.2rem",
};

export const profilePicContainerStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  overflow: "hidden",
  marginRight: 12,
  border: "2px solid #eee",
  cursor: "pointer",
};

export const profilePicStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "50%",
  display: "block",
};

export const usernameStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "1.08rem",
  color: "#222",
};

export const imageContainerStyle: React.CSSProperties = {
  width: "100%",
  position: "relative",
  background: "#000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 320,
  maxHeight: 420,
  overflow: "hidden",
};

export const imageStyle: React.CSSProperties = {
  width: "100%",
  maxHeight: 420,
  objectFit: "cover",
  borderRadius: 0,
  display: "block",
};

export const arrowButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.4)",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 32,
  height: 32,
  fontSize: 18,
  cursor: "pointer",
  zIndex: 2,
};

export const actionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  padding: "1rem 1.2rem 0.2rem 1.2rem",
};

export const iconStyle: React.CSSProperties = {
  cursor: "pointer",
};

export const likeCountStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "1.02rem",
  padding: "0.2rem 1.2rem",
  color: "#333",
};

export const descriptionStyle: React.CSSProperties = {
  padding: "0.2rem 1.2rem",
  fontSize: "1.03rem",
  color: "#222",
};

export const readMoreStyle: React.CSSProperties = {
  color: "#0070f3",
  cursor: "pointer",
  fontWeight: 500,
  marginLeft: 4,
};

export const commentsStyle: React.CSSProperties = {
  padding: "0.2rem 1.2rem",
  color: "#888",
  fontSize: "0.98rem",
  cursor: "pointer",
};

export const timeAgoStyle: React.CSSProperties = {
  padding: "0.2rem 1.2rem",
  color: "#bbb",
  fontSize: "0.93rem",
};
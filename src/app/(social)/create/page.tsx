"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import React, { useState, useEffect } from "react";

type PostSummary = {
  postId: number; // Assuming the post ID is returned
  description: string;
  createdBy: string;
  createdByProfilePicUrl: string;
  createdAt: string; // ISO date string
  likeIds: number[];
  likeCount: number;
  commentIds: number[];
  commentCount: number;
  imageUrls: string[];
  savedIds: number[];
};

export default function CreatePage() {
  const router = useRouter();
  const { user } = useUser();
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState<PostSummary | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);

      imagePreviews.forEach((url) => URL.revokeObjectURL(url));

      const previews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
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
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#222" }}>
          Create New Post
        </h1>
        <form 
          action={`${process.env.NEXT_PUBLIC_API_URL}/api/post/create-post-images`} 
          method="POST" 
          encType="multipart/form-data"
        >
          <input type="hidden" name="user_id" value={user?.userId || ''} />
          <input type="hidden" name="createdAt" value={new Date().toISOString()} />

          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a caption..."
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "0.8rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "1rem",
              marginBottom: "1rem",
              resize: "vertical",
            }}
          />
          <input
            name="requestImages"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            style={{
              width: "100%",
              padding: "0.8rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          />
          {imagePreviews.length > 0 && (
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {imagePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt="Image preview"
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                />
              ))}
            </div>
          )}
          {error && <p style={{ color: "#e74c3c", marginBottom: "1rem" }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.8rem",
              background: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            Create Post
          </button>
        </form>

        {/* Show a preview of the post */}
        {newPost && (
          <div style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "2rem" }}>
            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Post Created!</h2>
            <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem" }}>
              {newPost.imageUrls && newPost.imageUrls[0] && (
                <img 
                  src={newPost.imageUrls[0]} 
                  alt="Newly created post" 
                  style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }} 
                />
              )}
              <p><strong>{newPost.createdBy}:</strong> {newPost.description}</p>
              <p style={{ color: "#777", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                {new Date(newPost.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
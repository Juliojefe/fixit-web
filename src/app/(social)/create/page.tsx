"use client";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import React, { useState, useEffect } from "react";

type PostSummary = {
  postId: number;
  description: string;
  createdBy: string;
  createdByProfilePicUrl: string;
  createdAt: string;
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
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description to create a post.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("description", description);
    formData.append("user_id", String(user.userId));
    formData.append("createdAt", new Date().toISOString());
    
    images.forEach((image) => {
      formData.append("requestImages", image);
    });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/post/create-post-images`,
        {
          method: "POST",
          body: formData,
          credentials: 'include',
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create post.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setIsSuccess(false);
    setDescription("");
    setImages([]);
    setImagePreviews([]);
    setError(null);
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
        background: "#f0f2f5",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem 2.5rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "550px",
          border: "1px solid #ddd",
        }}
      >
        {/* Conditionally render the form or the success message */}
        {!isSuccess ? (
          <>
            <h1 style={{ textAlign: "center", marginBottom: "2rem", color: "#222", fontWeight: 600 }}>
              Create New Post
            </h1>
            {/* The form no longer needs an onSubmit handler */}
            <form>
              {/* Image Upload Section */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label 
                  htmlFor="file-upload" 
                  style={{
                    display: "block",
                    padding: "2rem",
                    border: "2px dashed #ddd",
                    borderRadius: "8px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: imagePreviews.length > 0 ? "#f9f9f9" : "#fff",
                    transition: "background-color 0.2s",
                  }}
                >
                  {imagePreviews.length > 0 ? (
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                      {imagePreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt="Image preview"
                          style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: 0, color: "#555", fontWeight: 500 }}>
                        Click to upload images
                      </p>
                      <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.9rem", color: "#888" }}>
                        PNG, JPG, GIF
                      </p>
                    </div>
                  )}
                </label>
                <input
                  id="file-upload"
                  name="requestImages"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              {/* Description Section */}
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a caption..."
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  marginBottom: "1.5rem",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />

              {error && <p style={{ color: "#d93025", marginBottom: "1.5rem", textAlign: "center" }}>{error}</p>}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  background: loading ? "#ccc" : "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "1.1rem",
                  transition: "background-color 0.2s",
                }}
              >
                {loading ? "Creating..." : "Create Post"}
              </button>
            </form>
          </>
        ) : (
          // This is the success view
          <div style={{ textAlign: "center" }}>
            <h2 style={{ marginBottom: "2rem", color: "#0070f3", fontWeight: 600 }}>
              Post Created Successfully!
            </h2>
            <button
              onClick={handleCreateAnother}
              style={{
                width: "100%",
                padding: "0.9rem",
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              Create Another Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
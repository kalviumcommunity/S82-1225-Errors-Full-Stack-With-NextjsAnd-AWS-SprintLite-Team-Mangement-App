import React, { useRef } from "react";

export default function S3Uploader() {
  const fileInput = useRef();

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInput.current.files[0];
    if (!file) return alert("No file selected");
    if (!["image/jpeg", "image/png"].includes(file.type)) return alert("Only JPG or PNG allowed");
    if (file.size > 2 * 1024 * 1024) return alert("File too large (max 2MB)");

    // Get presigned URL
    const res = await fetch(
      `/api/upload-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`
    );
    if (!res.ok) return alert("Failed to get upload URL");
    const { uploadUrl } = await res.json();

    // Upload file
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (uploadRes.ok) {
      alert("Upload successful!");
    } else {
      alert("Upload failed!");
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <input type="file" ref={fileInput} accept="image/jpeg,image/png" />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
        Upload to S3
      </button>
    </form>
  );
}

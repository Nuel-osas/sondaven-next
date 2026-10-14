"use client";
import { useState } from "react";
export default function ExternalVideo({ url, className, style }) {
  const [playing, setPlaying] = useState(false);
  const valid =
    /\/(?:video\/)?[A-Za-z0-9_-]{6,}/.test(url || "") &&
    !url?.endsWith("/video/");
  return (
    <div
      className={className}
      style={{
        ...style,
        width: "100%",
        height: "100%",
        minHeight: 180,
        display: "grid",
        placeItems: "center",
        background: "#25241f",
        color: "#b7a88b",
      }}
    >
      {playing && valid ? (
        <iframe
          src={url}
          title="Son Daven video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ border: 0, width: "100%", height: "100%" }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          style={{
            background: "none",
            color: "inherit",
            border: "1px solid currentColor",
            padding: "18px 24px",
            cursor: "pointer",
          }}
        >
          {!valid
            ? "Video unavailable"
            : playing
              ? "Video unavailable"
              : "▶ Play video"}
        </button>
      )}
    </div>
  );
}

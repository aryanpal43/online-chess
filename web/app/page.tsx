"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

const Chessboard = dynamic(() => import("../components/Chessboard"), { ssr: false });

type Mode = "local" | "online";

export default function Home() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [room, setRoom] = useState("");
  const [inputRoom, setInputRoom] = useState("");

  if (!mode) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #eaf1fb 0%, #b6e0fe 100%)",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <span style={{ color: "gold", fontSize: 72, marginBottom: 12 }}>♔</span>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, color: "#134074" }}>
          Welcome to Chess Online
        </h1>
        <div
          style={{
            color: "#134074",
            fontSize: 20,
            marginBottom: 32,
            textAlign: "center",
            maxWidth: 420,
            lineHeight: 1.5,
            background: "rgb(235, 210, 210)",
            borderRadius: 12,
            padding: "18px 24px",
            boxShadow: "0 2px 12px #0001",
          }}
        >
          <div>Play chess with a friend locally or online.</div>
          <div style={{ marginTop: 10 }}>
            <b>Local Play:</b> Two players on the same device.
            <br />
            <b>Online Play:</b> Enter a room code and share it with a friend to play remotely.
          </div>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          <button
            onClick={() => setMode("local")}
            style={{
              padding: "18px 38px",
              fontSize: 22,
              borderRadius: 10,
              border: "none",
              background: "#134074",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px #0002",
              transition: "background 0.2s",
            }}
          >
            Local Play
          </button>
          <button
            onClick={() => setMode("online")}
            style={{
              padding: "18px 38px",
              fontSize: 22,
              borderRadius: 10,
              border: "none",
              background: "#6fa8dc",
              color: "#134074",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px #0002",
              transition: "background 0.2s",
            }}
          >
            Online Play
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'online' && !room) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eaf1fb 0%, #b6e0fe 100%)' }}>
        <h1 style={{ color: 'black', fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Enter Room Code</h1>
        <input
          type="text"
          placeholder="Room code"
          value={inputRoom}
          onChange={e => setInputRoom(e.target.value)}
          style={{ color: 'black', fontSize: 20, padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', marginBottom: 16 }}
        />
        <button
          onClick={() => { if (inputRoom.trim()) setRoom(inputRoom.trim()); }}
          style={{ padding: '12px 28px', fontSize: 18, borderRadius: 8, border: 'none', background: '#134074', color: 'white', fontWeight: 600, cursor: 'pointer' }}
        >
          Join Room
        </button>
        <button
          onClick={() => setMode(null)}
          style={{ marginTop: 16, background: 'none', border: 'none', color: '#134074', textDecoration: 'underline', cursor: 'pointer', fontSize: 16 }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <Chessboard mode={mode} room={room} />
  );
}

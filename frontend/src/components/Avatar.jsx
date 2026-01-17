import React, { useRef, useState } from "react";
import "./avatar.css";

const Avatar2D = ({ isSpeaking }) => {
  const avatarRef = useRef(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    setDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  return (
    <div
      ref={avatarRef}
      className="avatar-draggable"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        left: position.x,
        top: position.y,
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      <div className="avatar-container">
        <img
          src="/avatar/face.png"
          alt="AI Avatar"
          className="avatar-face"
        />
        <img
          src="/avatar/mouth.png"
          alt="Mouth"
          className={`avatar-mouth ${isSpeaking ? "speaking" : ""}`}
        />
      </div>
    </div>
  );
};

export default Avatar2D;

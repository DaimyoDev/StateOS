import React from "react";
import useGameStore from "../store";
import "./LoadingScreen.css";

function LoadingScreen() {
  const loadingMessage = useGameStore((state) => state.loadingMessage);

  return (
    <div className="loading-screen-container">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-title">Building Your World...</h2>
        <p className="loading-message">{loadingMessage}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;

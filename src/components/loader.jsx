import React, { useEffect } from 'react';
import './loader.css'; // Ensure correct path
import tap from '../assets/img/tap.png'; // Ensure correct path

const Loader = () => {
  useEffect(() => {
    const createFallingCoins = () => {
      for (let i = 0; i < 10; i++) { // More coins for extra luxury
        let coin = document.createElement("div");
        coin.classList.add("falling-coin");

        // Random positioning
        coin.style.left = Math.random() * 100 + "vw";
        coin.style.animationDuration = (Math.random() * 2 + 2) + "s"; // Different speeds
        coin.style.animationDelay = Math.random() * 3 + "s";

        document.body.appendChild(coin);

        // Remove after animation ends
        setTimeout(() => {
          coin.remove();
        }, 5000);
      }
    };

    // Run falling coin animation every few seconds
    const interval = setInterval(createFallingCoins, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      {/* Glowing Ring */}
      <div className="glow-ring"></div>

      {/* Center Gold Coin */}
      <img src={tap} alt="Gold Coin" className="gold-coin" />

      {/* Animated Text */}
      <div className="loading-text">Loading... Please Wait</div>
    </div>
  );
};

export default Loader;
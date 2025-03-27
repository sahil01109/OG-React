import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase/config";
import logo from "./assets/img/logo.webp";
import tap from "./assets/img/tap.png";
import Navbar from "./footer";
import { Link } from "react-router-dom";
import walletIcon from "/wallet.webp";
import { useUser } from "./components/UserContext";
import { formatNumber } from "../src/utils/format";
import Loader from "./components/loader";

function App() {
  const { userData, loading } = useUser();
  const userId = userData?.id || ""; // ✅ Use a single variable to reference Firestore data

  const [score, setScore] = useState(1500);
  const [points, setPoints] = useState(0);
  const [userBalance, setUserBalance] = useState(0); // ✅ Store balance directly
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isTappingAllowed, setIsTappingAllowed] = useState(true);
  const [tapEffects, setTapEffects] = useState([]);
  const [username, setUsername] = useState("");

  const levelThresholds = [5000, 10000, 40000, 80000, 120000, 160000, 200000, 220000, 2500000];

  useEffect(() => {
    if (userData?.balance !== undefined) {
      console.log("User balance loaded:", userData.balance);
      setUserBalance(userData.balance);
    }
  }, [userData]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user) setUsername(user.username);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScore((prev) => (prev < 1500 ? prev + 2 : 1500));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let newLevel = 1, progressPercentage = 0;
    for (let i = 0; i < levelThresholds.length; i++) {
      if (userBalance >= levelThresholds[i]) newLevel = i + 1;
      else {
        progressPercentage = ((userBalance - (levelThresholds[i - 1] || 0)) / (levelThresholds[i] - (levelThresholds[i - 1] || 0))) * 100;
        break;
      }
    }
    setLevel(newLevel);
    setProgress(progressPercentage);
  }, [userBalance]);

  const createTapEffect = (event) => {
    const newEffect = { id: Date.now(), x: event.clientX, y: event.clientY, amount: 1 };
    setTapEffects((prev) => [...prev, newEffect]);
    setTimeout(() => setTapEffects((prev) => prev.filter((effect) => effect.id !== newEffect.id)), 1000);
  };

  const handleTap = (event) => {
    if (!isTappingAllowed) return;
    const tapAmount = Math.min(event.touches ? event.touches.length : 1, 7);
    setScore((prev) => Math.max(prev - tapAmount, 0));
    setPoints((prev) => prev + tapAmount);
    createTapEffect(event);
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!userId) return console.error("Invalid user ID:", userId);

    try {
      const userRef = doc(db, "user", String(userId));
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) return console.error("User document not found");

      const currentBalance = Number(docSnap.data().balance) || 0;
      const newBalance = currentBalance + points;

      console.log(`Updating balance from ${currentBalance} to ${newBalance}`);

      await updateDoc(userRef, { balance: newBalance });

      setUserBalance(newBalance);
      setPoints(0);
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  if (loading) return <Loader />;
  if (!userData) return <p>User not found</p>;

  return (
    <>
    
      <header className="profile">
       <div style={{ display: "flex", flexDirection: "column" }}>
       <div className="user-info">
          <img src={logo} alt="User Avatar" className="avatar" />
          <h2>{username || userData?.username}</h2>
        </div>
        <div>
          <p className="gold-status">Level: <span>{level}</span></p>
          <div className="progress-container">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
       </div>
        <button className="wallet-btn">
          <img src={walletIcon} alt="Wallet Icon" className="icon" />
          Connect your wallet
        </button>
      </header>

      <section className="mining-section">
        <div className="actions">
          <Link to="/daily" className="btn daily-checkin">✅ Daily Check-in</Link>
          <Link to="/codereward" className="btn airdrop">🎁 Code Reward</Link>
        </div>

        <div className="token-display">
          <h1>{formatNumber(userBalance)} <span className="max">OG</span></h1>
          <p className="mine-instruction">Tap to mine coins</p>
          <div className="coin tapCount border-attractive" onTouchStart={handleTap} onClick={handleTap}>
            <img src={tap} alt="Token Image" />
            {tapEffects.map((effect) => (
              <span key={effect.id} className="tap-effect" style={{ position: "absolute", left: effect.x, top: effect.y, animation: "rise 1s ease-out" }}>
                +{effect.amount}
              </span>
            ))}
          </div>
          <h3><span>{score}</span>/1500</h3>
          <div className="tap-coin">
            <form className="claim" onSubmit={handleClaim}>
              <span className="points">{points}</span>
              <button className="btn-point" type="submit">Claim</button>
            </form>
          </div>
        </div>
        <p style={{ paddingBottom: "50%" }}> </p>
      </section>

      <Navbar />
    </>
  );
}

export default App;

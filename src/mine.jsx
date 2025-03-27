import { useState, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase/config";
import "./mine.css";
import Navbar from './footer';
import { useUser } from "./components/UserContext";
import { formatNumber } from "../src/utils/format";

const miningDuration = 7 * 60 * 60 * 1000; // 1 minute (for testing) - change to 3 hours in production
const baseMiningRate =0.005; // Base points per second

const Mine = () => {
  const { userData, loading } = useUser();
  const [isMining, setIsMining] = useState(false);
  const [points, setPoints] = useState(0);
  const [balance, setBalance] = useState(0); // Fetch from Firestore
  const [timeLeft, setTimeLeft] = useState(miningDuration);
  const [canClaim, setCanClaim] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1); // Default 1x speed
  const [rotation, setRotation] = useState(0);
  const [boostMenuOpen, setBoostMenuOpen] = useState(false);
  const [boostMessage, setBoostMessage] = useState(null);
  const [confirmBoost, setConfirmBoost] = useState(null);


  if (loading) return <Loader />;
  if (!userData) return <p>User not found</p>;

  useEffect(() => {
    if (loading || !userData) return;

    setBalance(userData.balance || 0); // Set balance when user data loads
  }, [userData, loading]);

  useEffect(() => {
    let interval;

    if (isMining) {
      interval = setInterval(() => {
        setPoints((prev) => prev + baseMiningRate * rotationSpeed);

        setTimeLeft((prevTime) => {
          if (prevTime - 1000 * rotationSpeed <= 0) {
            clearInterval(interval);
            setIsMining(false);
            setCanClaim(true);
            return 0;
          }
          return prevTime - 1000 * rotationSpeed;
        });

        setRotation((prevRotation) => (prevRotation + (360 / miningDuration) * 1000 * rotationSpeed) % 360);
      }, 1000 / rotationSpeed);
    }

    return () => clearInterval(interval);
  }, [isMining, rotationSpeed]);


  const startMining = async () => {
    const miningStartTime = Date.now(); // Get current timestamp
    
    setPoints(0);
    setIsMining(true);
    setCanClaim(false);
    setTimeLeft(miningDuration);
    setRotation(0);
    setBoostMessage(null);
    setRotationSpeed(1);
  
    // Store mining start time in localStorage
    localStorage.setItem("miningStartTime", miningStartTime);
    localStorage.setItem("isMining", "true");
  };
  
  useEffect(() => {
    if (loading || !userData) return;
  
    setBalance(userData.balance || 0); // Set balance when user data loads
  
    // Retrieve mining state from localStorage
    const storedMiningStart = localStorage.getItem("miningStartTime");
    const storedIsMining = localStorage.getItem("isMining") === "true";
  
    if (storedMiningStart && storedIsMining) {
      const elapsedTime = Date.now() - parseInt(storedMiningStart);
      const remainingTime = Math.max(miningDuration - elapsedTime, 0);
      
      if (remainingTime > 0) {
        setIsMining(true);
        setTimeLeft(remainingTime);
      } else {
        setIsMining(false);
        setCanClaim(true);
      }
    }
  }, [userData, loading]);

  
  useEffect(() => {
    let interval;
  
    if (isMining) {
      interval = setInterval(() => {
        setPoints((prev) => prev + baseMiningRate * rotationSpeed);
  
        setTimeLeft((prevTime) => {
          if (prevTime - 1000 * rotationSpeed <= 0) {
            clearInterval(interval);
            setIsMining(false);
            setCanClaim(true);
            localStorage.setItem("isMining", "false"); // Stop mining
            return 0;
          }
          return prevTime - 1000 * rotationSpeed;
        });
  
        setRotation((prevRotation) => 
          (prevRotation + (360 / miningDuration) * 1000 * rotationSpeed) % 360
        );
      }, 1000 / rotationSpeed);
    }
  
    return () => clearInterval(interval);
  }, [isMining, rotationSpeed]);
  


  const formatTime = (ms) => {
    const totalSeconds = Math.max(ms / 1000, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
  
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
  const toggleBoostMenu = async () => {
    if (!userData || !userData.id) return;

    try {
      const userRef = doc(db, "user", String(userData.id));
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setBalance(docSnap.data().balance || 0);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }

    setBoostMenuOpen((prev) => !prev);
    setConfirmBoost(null);
  };

  const confirmBoostPurchase = async (multiplier, cost) => {
    if (!userData || !userData.id) return;
  
    // Prevent boost activation if mining is completed
    if (canClaim) {
      setBoostMessage("⚠️ Mining completed! Claim the reward first.");
      setTimeout(() => setBoostMessage(null), 3000);
      return;
    }
  
    try {
      const userRef = doc(db, "user", String(userData.id));
      const docSnap = await getDoc(userRef);
  
      if (!docSnap.exists()) {
        console.error("User document not found in Firestore");
        return;
      }
  
      const userBalance = Number(docSnap.data().balance) || 0;
  
      if (userBalance < cost) {
        setBoostMessage("❌ Insufficient balance!");
        setTimeout(() => setBoostMessage(null), 3000);
        return;
      }
  
      setConfirmBoost({ multiplier, cost });
    } catch (error) {
      console.error("Error checking balance:", error);
    }
  };
  
  const applyBoost = async () => {
    if (!confirmBoost || !userData || !String(userData.id)) return;

    try {
      const userRef = doc(db, "user", String(userData.id));
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        console.error("User document not found in Firestore");
        return;
      }

      const userBalance = Number(docSnap.data().balance) || 0;

      if (userBalance < confirmBoost.cost) {
        setBoostMessage("❌ Insufficient balance!");
        setTimeout(() => setBoostMessage(null), 3000);
        return;
      }

      const newBalance = userBalance - confirmBoost.cost;
      await updateDoc(userRef, { balance: newBalance });

      setBalance(newBalance);
      setRotationSpeed(confirmBoost.multiplier);
      setBoostMessage(`🚀 Boost Activated! ${confirmBoost.multiplier}x Speed`);
      setConfirmBoost(null);

      setTimeout(() => setBoostMessage(null), 3000);
    } catch (error) {
      console.error("Error applying boost:", error);
    }
  };
 const handleClaim = async (e) => {
    e.preventDefault();
  
    console.log("User Data:", userData);
  
    if (!userData || !userData.id) {
      console.error("Invalid Firestore document ID:", userData);
      return;
    }
  
    try {
      // Convert ID to a string for Firestore reference
      const userRef = doc(db, "user", String(userData.id));
      console.log("Updating balance for user ID:", userData.id);
  
      // Fetch the user document
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        console.error("User document not found in Firestore");
        return;
      }
  
      // Get current balance and ensure it's a number
      const userData2 = docSnap.data();
      console.log("Fetched user data:", userData2);
  
      const currentBalance = Number(userData2.balance) || 0;
      const newBalance = currentBalance + points;
  
      console.log("Updating balance from", currentBalance, "to", newBalance);
  
      // Update Firestore document
      await updateDoc(userRef, { balance: newBalance });
      console.log("Balance updated successfully:", newBalance);
  
      // Update UI state
 
      setCanClaim(false);
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };
  

  return (
    <>
      <div className="mine-section">
      <p className="balance">💰 Balance</p>
        <h1> {formatNumber(balance)} <span className="max">OG</span></h1>
        
       
        <div className="mining-box">
          <div className="circular-timer">
            <div 
              className="pin" 
              style={{ transform: `rotate(${rotation}deg)`, transition: `transform ${1 / rotationSpeed}s linear` }}
            ></div>
          </div>

          <div className="mining-info">
            <h2>Mined Tokens</h2>
            <span className="mine-coin">Mining Per Second 💰 {(baseMiningRate * rotationSpeed).toFixed(4)}</span>
            <p>{points.toFixed(5)}</p>
            <p>⏳ {isMining ? formatTime(timeLeft) : "Mining Complete"}</p>
          </div>

          <div className="button-container">
            <button className="btn-mine" onClick={startMining} disabled={isMining || canClaim}>
              {isMining ? "Mining.." : "Start Mine"}
            </button>
            <button 
              onClick={handleClaim}
              disabled={!canClaim}
              className={canClaim ? "active-claim" : "btn-mine"}
            >
              Claim
            </button>
          </div>
        </div>
        <div className="boost-data">
          <h2>Boost Mining</h2>
          <span style={{ color: "gold", cursor: "pointer" }} onClick={toggleBoostMenu}>Click Here</span>
        </div>
        <p style={{ paddingBottom: "50%" }}> </p>
      </div>

      {boostMenuOpen && (
        <div id="boost-overlay">
           {boostMessage && <div className="boost-message">{boostMessage}</div>}
          <div className="modal-content">
            <button className="mine-close" onClick={() => setBoostMenuOpen(false)}>✖</button>
            <h2>Upgrade Timer & Mining Speed</h2>
            <div className="mine-container">
              <button className="mine-button" onClick={() => confirmBoostPurchase(2, 20)}>2x Speed (2000 Coins)</button>
              <button className="mine-button" onClick={() => confirmBoostPurchase(3, 3000)}>3x Speed (3000 Coins)</button>
              <button className="mine-button" onClick={() => confirmBoostPurchase(5, 5000)}>5x Speed (5000 Coins)</button>
            </div>
          </div>
        </div>
      )}

      {confirmBoost && (
        <div className="boost-confirm-overlay">
          <div className="boost-confirm">
            <h3>Confirm Purchase</h3>
            <p>Activate {confirmBoost.multiplier}x speed for {confirmBoost.cost} coins?</p>
            <button className="confirm-btn" onClick={applyBoost}>Yes, Activate</button>
            <button className="cancel-btn" onClick={() => setConfirmBoost(null)}>Cancel</button>
          </div>
        </div>
      )}

      <Navbar />
    </>
  );
};

export default Mine;

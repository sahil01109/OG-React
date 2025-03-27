import React, { useState, useEffect } from 'react';
import { db } from '../src/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Navbar from './footer';
import logo from './assets/img/logo.webp';
import youGif from './assets/img/you.gif';
import teleImg from './assets/img/tele.png';
import faImg from './assets/img/fa.png';
import istaImg from './assets/img/ista.png';
import { useUser } from "./components/UserContext";
import DailyTasklist from './components/DailyTaskList';


function Daily() {
  const [claimed, setClaimed] = useState(false);
  const [tasksCompleted, setTasksCompleted] = useState({});

  const { userData, loading } = useUser();
  const userId = userData?.id || ""; 
  useEffect(() => {
    if (userId) {
      checkClaimStatus();
    }
  }, [userId]);

  const checkClaimStatus = async () => {
    if (!userId) return;

    const userRef = doc(db, 'user', String(userId));
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const { lastClaimed, tasksCompleted } = userSnap.data();
      const today = new Date().toISOString().split('T')[0];

      if (lastClaimed === today) setClaimed(true);
      setTasksCompleted(tasksCompleted || {});
    }
  };




  const handleClaim = async () => {
    if (claimed || !userId) return; // Prevent multiple claims
  
    try {
      const userRef = doc(db, "user", String(userId)); // Ensure correct collection name
      const docSnap = await getDoc(userRef);
  
      if (!docSnap.exists()) {
        console.error("User document not found in Firestore");
        return; 
      }
  
      const userData = docSnap.data();
      const today = new Date().toISOString().split('T')[0];
  
      // Check if already claimed today
      if (userData.lastClaimed === today) {
        console.warn("Already claimed today's reward");
        setClaimed(true);
        return;
      }
  
      const newBalance = (Number(userData.balance) || 0) + 100;
  
      await updateDoc(userRef, { 
        balance: newBalance, 
        activeDays: (userData.activeDays || 0) + 1,
        lastClaimed: today 
      });
  
      console.log('Balance updated successfully:', newBalance);
  
      // Update UI state
      setClaimed(true);
  
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };
  
  if (loading) return <p>Loading...</p>;
  if (!userId) return <p>User not found</p>;

  return (
    <>
      <div className="back" onClick={() => window.history.back()}>
        <button type="button"><i className="fa fa-solid fa-arrow-left"></i></button>
      </div>
      <div className="mining-section">
        <div className="daily-reward">
          <div className="token-display">
            <p className="mine-instruction">Claim Daily Reward</p>
            <h1>100<span className="max">OG</span></h1>
            <button 
              type="button" 
              className="btn-point" 
              disabled={claimed} 
              onClick={handleClaim}
            >
              {claimed ? 'Claimed' : 'Claim'}
            </button>
          </div>
        </div>
        <div className="tasks">
        <DailyTasklist/>
         
        </div>
      </div>
      <Navbar />
    </>
  );
}

export default Daily;

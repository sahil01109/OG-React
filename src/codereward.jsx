import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase/config';
import { collection,getDoc, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import Navbar from './footer';
import { useUser } from "./components/UserContext";
import { formatNumber } from "../src/utils/format";


function Codereward() {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success or error
  const navigate = useNavigate();
  const {userData, updateBalance } = useUser();
  const [recentCodes, setRecentCodes] = useState([]);
 const userId = userData?.id || "";

 const checkCode = async (e) => {
  e.preventDefault();

  try {
    const codesRef = collection(db, "codes");
    const querySnapshot = await getDocs(codesRef);

    let foundCode = null;

    querySnapshot.docs.forEach((doc) => {
      console.log("Checking Firestore Code:", doc.data().code);
      console.log("User Input Code:", code);

      if (typeof doc.data().code === "string" && typeof code === "string") {
        if (doc.data().code.trim().toLowerCase() === code.trim().toLowerCase()) {
          foundCode = { id: doc.id, ...doc.data() };
        }
      }
    });

    if (foundCode) {
      console.log("✅ Found Code:", foundCode);

      if (typeof foundCode.reward !== "number") {
        console.error("🚨 Error: foundCode.reward is not a number", foundCode.reward);
        setMessage("⚠️ Error: Invalid reward value. Try again later.");
        setMessageType("error");
        return;
      }

      // ✅ Ensure user ID exists
      if (!userId) {
        console.error("🚨 Error: userId is missing");
        setMessage("⚠️ Error: User ID missing.");
        return;
      }

      // ✅ Call CodeRewardinfo to update user data
      CodeRewardinfo(userId, foundCode.code, foundCode.reward);

      // ✅ Update UI state      await CodeRewardinfo(userId, foundCode.code, foundCode.reward);

      setMessage(`✅ Code accepted! You earned ${foundCode.reward} OG.`);
      setMessageType("success");

      // ✅ Add code to past codes list
      setRecentCodes([...recentCodes, foundCode]);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setMessage("❌ Wrong code! Try again.");
      setMessageType("error");
    }
  } catch (error) {
    console.error("🔥 Error checking code:", error);
    setMessage("⚠️ Error checking the code. Try again later.");
    setMessageType("error");
  }
};

const CodeRewardinfo = async (userId, code, rewardAmount) => {
  if (!userId) return;
   const userRef = doc(db, "user", String(userId));
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.error("🚨 Error: User not found.");
    setMessage("⚠️ Error: User not found.");
    return;
  }

  const userData = userSnap.data();

  // ✅ Ensure `redeemedCodes` is an array
  let redeemedCodes = userData.redeemedCodes;
  if (!Array.isArray(redeemedCodes)) {
    redeemedCodes = []; // Initialize as an empty array if missing
  }

  // ✅ Check if the code was already claimed
  if (redeemedCodes.includes(String(code))) {
    setMessage("⚠️ You have already claimed this code.");
    setMessageType("error");
    return;
  }

  // ✅ Update user balance and store redeemed code
  await updateDoc(userRef, {
    balance: Number(userData.balance || 0) + Number(rewardAmount || 0),
    redeemedCodes: arrayUnion(String(code)) // Ensure it's a string
  });
};

  return (
    <>
      <section>
        <div className="back" onClick={() => navigate(-1)}>
          <button type="button"><i className="fa fa-solid fa-arrow-left"></i></button>
        </div>

        <div className="token-display">
          <h1>{formatNumber(userData?.balance)}<span className="max">OG</span></h1>
        </div>

        <div className="code">
          <span className="code_header">Enter Code Here</span> <br />
          <form onSubmit={checkCode}>
            <br />
            <input 
              type="text" 
              id="inp" 
              placeholder="code..." 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              required 
            />
            <br /><br /><br />
            <button className="reward-btn" type="submit">Submit</button>
          </form>
        </div>

        {message && (
          <div className={`message-box ${messageType}`}>
            {message}
          </div>
        )}

<div className="mining-section">
  <div className="code-history">
    <h2>Past Code</h2>
    
    {userData?.redeemedCodes && userData.redeemedCodes.length > 0 ? (
      userData.redeemedCodes
        .slice(-5) // Get last 5 elements
        .map((code, index) => <p className='codes' key={index}>{code}</p>) // Display each code
    ) : (
      <p>No codes used yet</p>
    )}
  </div>
</div>

      </section>

      <Navbar />
    </>
  );
}

export default Codereward;

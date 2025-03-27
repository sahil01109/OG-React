import React, { useState, useEffect } from 'react';
import logo from './assets/img/logo.webp';

import Navbar from './footer';
import { useUser } from "./components/UserContext";
import Loader from "./components/loader";
import { formatNumber } from "../src/utils/format";


import Tasklist from './components/Tasklist';



function Activities() {

  const { userData, loading ,getReferralCount , claimReferralReward } = useUser();
  
  const userId = userData?.id || "";
  const [username, setUsername] = useState("");
  const referralCode = userData?.referralCode || userId; // Use referralCode if stored, otherwise fallback to userId
  const referralLink = `https://t.me/Coinoxy_bot/OxyGreen/referral?code=${referralCode}`;
  const [referralCount, setReferralCount] = useState(0); 
  const [userBalance, setUserBalance] = useState(0); // ✅ Store balance directly
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const levelThresholds = [5000, 10000, 40000, 80000, 120000, 160000, 200000, 220000, 2500000];
  const referralMilestones = [
    { count: 5, reward: 2000 },
    { count: 10, reward: 4000 },
    { count: 25, reward: 8000 },
    { count: 50, reward: 20000 },
    { count: 100, reward: 100000 },
  ];
 
  useEffect(() => {
    if (userData?.balance !== undefined) {
      setUserBalance(userData.balance);
    }
  }, [userData]);
  useEffect(() => {
    if (!userId) return;

    const fetchReferralData = async () => {
        const { referralCount, claimedRewards } = await getReferralCount(userId);
        setReferralCount(referralCount);
        setClaimedRewards(claimedRewards); // ✅ Ensure claimed rewards are set on reload
    };

    fetchReferralData();
}, [userId]);

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

  function copyText() {
    navigator.clipboard.writeText(referralLink);
    document.querySelector('.copy-btn').innerText = 'Copied!';
    setTimeout(() => {
      document.querySelector('.copy-btn').innerText = '🔗 Copy';
    }, 2000);
  }

  function toggleShareMenu() {
    const menu = document.getElementById("shareMenu");
    menu.style.display = menu.style.display === "none" ? "flex" : "none";
  }

  function close() {
    const menu = document.getElementById("shareMenu");
    menu.style.display = 'none';
  }

  function shareOnWhatsApp() {
    window.open(`https://wa.me/?text=Join%20this%20amazing%20platform%20using%20my%20referral%20link!%20${encodeURIComponent(referralLink)}`, "_blank");
  }

  function shareOnTelegram() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Join%20now!`, "_blank");
  }

  function shareOnInstagram() {
    alert("Instagram doesn't support direct link sharing. Please copy the referral link manually.");
  }

  function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("refer");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }
  const handleClaim = async (milestone, reward) => {
    const success = await claimReferralReward(userId, milestone, reward);
    if (success) {
      setClaimedRewards([...claimedRewards, milestone]); // ✅ Update UI after claim
    }
  };

  
  if (loading) return <Loader />;
  if (!userData) return <p>User not found</p>;

  return (
    <>
      <header className="profile">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="user-info">
            <img src={logo} alt="User Avatar" className="avatar" />
            <h2>{username || userData?.username}</h2>
          </div>
          <div>
            <p className="gold-status">Level: <span id="level">{level}</span></p>
            <div className="progress-container">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        <div className="stat-box">
          <span>Balance</span>
          <p>{formatNumber(userData?.balance)}</p>
        </div>
      </header>

      <div className="mining-section">
        <div className="tab">
          <button className="tab-btn active" onClick={(e) => openCity(e, 'refer-data')}>Refer & Earn</button>
          <button className="tab-btn" onClick={(e) => openCity(e, 'complete-task')}>Complete Task</button>
        </div>
        <div id="shareMenu" className="share-menu">
          <div className="share" style={{ display: 'flex' }}>
            <a href="#" onClick={shareOnWhatsApp}><i className="fa fa-brands fa-whatsapp"></i>Whatsapp</a>
            <a href="#" onClick={shareOnTelegram}><i className="fa fa-brands fa-telegram"></i>telegram</a>
            <a href="#" onClick={shareOnInstagram}><i className="fa fa-brands fa-facebook"></i>facebook</a>
          </div>
          <button onClick={close} className="share-close"><i className="fa fa-remove"></i></button>
        </div>

        <div className="refer" id="refer-data">
          <section className="tasks">
            <main>
              <h2>Invite friends, get rewards!</h2>
              <p>The more friends you refer, the more you earn and get rewarded!</p>
              <div className="invite-buttons">
                <button className="invite-btn" onClick={toggleShareMenu}>📤 Share invite link</button>
                <button className="copy-btn" onClick={copyText}>🔗 Copy</button>
              </div>
            </main>
            {referralMilestones.map((milestone, index) => {
            const isUnlocked = referralCount >= milestone.count;
            const isClaimed = claimedRewards.includes(milestone.count);

            return (
              <div key={index} className="task-container">
                <div className="task">
                  <div className="task-detail">
                    <div>
                      <h4>Invite <b>{referralCount}/{milestone.count}</b></h4>
                      <div className="task-data">
                        <h5>{milestone.reward} Coins</h5>
                      </div>
                    </div>
                  </div>

                  {/* 🔒 Disable button if reward is already claimed or referrals are too low */}
                  <button
                    className={`refer-button ${isClaimed ? "claimed" : ""}`} // ✅ Add "claimed" class dynamically
                    disabled={!isUnlocked || isClaimed}
                    onClick={() => handleClaim(milestone.count, milestone.reward)}
                    
                  >
                    {isClaimed ? "✅ Claimed" : isUnlocked ? "Claim" : "🔒 Locked"}
                  </button>
                </div>
              </div>
            );
          })}
            <p style={{ paddingBottom: '50%' }}> </p>
          </section>
        </div>

        <div style={{ display: 'none', flexDirection: 'column' }} className="refer" id="complete-task">
          <span className="task-header">Complete Task and Earn Coins</span>
          <section className="tasks">
       
         <Tasklist/>
          
            <p style={{ paddingBottom: '50%' }}> </p>
          </section>
        </div>
      </div>

      <Navbar />
    </>
  );
}

export default Activities;
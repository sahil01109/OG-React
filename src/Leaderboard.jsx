import React, { useEffect, useState } from "react";
import { db } from "./firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useUser } from "./components/UserContext";
import Navbar from "./footer";
import Loader from "./components/loader";

// Function to format numbers into K, M, B
const formatNumber = (num) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + "B"; // Billions
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M"; // Millions
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + "K"; // Thousands
  } else {
    return num.toFixed(2); // Keep two decimal places for small numbers
  }
};

function Leaderboard() {
  const { userData, loading } = useUser();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "user"));
        let leaderboard = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          leaderboard.push({
            id: data.id,
            username: data.username || `User${data.id}`,
            balance: data.balance || 0,
          });
        });

        leaderboard.sort((a, b) => b.balance - a.balance);
        setPlayers(leaderboard);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return  <Loader />;

  const userRank = players.findIndex((p) => p.id === userData?.id) + 1;

  return (
    <>
      <section className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p className="ranking-info">Ranking info ℹ️</p>
      </section>

      <section className="top-players">
        {players.slice(0, 3).map((player, index) => (
          <div key={player.id} className={`player-card ${["first", "second", "third"][index]}`}>
            <span className="crown">{["🥇", "🥈", "🥉"][index]}</span>
            <h3>{player.username}</h3>
            <p className="player-score">{formatNumber(player.balance)}</p>
          </div>
        ))}
      </section>

      <section className="mining-section">
        {userData && (
          <section className="user-rank">
            <div className="rank-box">
              <span className="rank-number">{userRank || "Unranked"}</span>
              <div className="rank-info">
                <p className="username">{userData.username}</p>
                <p className="user-points">{formatNumber(userData.balance)}</p>
              </div>
              <span className="rank-position">#{userRank || "Unranked"}</span>
            </div>
          </section>
        )}

        <section className="leaderboard-list">
          {players.slice(3, 50).map((player, index) => (
            <div key={player.id} className="leaderboard-item">
              <div className="profile-icon gold">{index + 4}</div>
              <p>{player.username}</p>
              <span className="point">{formatNumber(player.balance)}</span>
            </div>
          ))}
        </section>
        <p style={{ paddingBottom: "80%" }}> </p>
      </section>

      <Navbar />
    </>
  );
}

export default Leaderboard;

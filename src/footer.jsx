import React from 'react'
import './index.css';
import { Link } from 'react-router-dom';

function footer() {
  return (
    <nav className="bottom-nav">
            <Link className="nav-item active" to="/">🏦 Earn</Link>
            <Link className="nav-item" to="/leaderboard">🏆 Leaderboard</Link>
            <Link className="nav-item" to="/mine">⛏️ Mine</Link>
            <Link className="nav-item" to="/activity">📋 Activities</Link>
            <Link className="nav-item" to="/airdrop">🎁 Airdrop</Link>
        </nav>
  )
}

export default footer

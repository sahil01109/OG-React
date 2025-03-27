import React, { useEffect, useState } from "react";
import { useUser } from "./UserContext"; // Get user data
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import logo from "../assets/img/logo.webp";
import youGif from '../assets/img/you.gif';
import teleImg from '../assets/img/tele.png';
import faImg from '../assets/img/fa.png';
import istaImg from '../assets/img/ista.png';
import whatsapp from '../assets/img/whatsapp.jpg'


const getCategoryImage = (category) => {
 
  switch (category) {
    case "youtube":
      return youGif;
    case "facebook":
      return faImg;
    case "telegram":
      return teleImg;
    case "instagram":
      return istaImg;
    case "whatsapp":
        return whatsapp ;
    default:
      return logo; // Default logo if no category matches
  }
};

const TaskCard = ({ title, reward, link, taskId, category }) => {
  const { userData } = useUser();
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!userData) return;
 
    const checkTaskStatus = async () => {
      const userRef = doc(db, "user", String(userData.id));
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userTasks = userSnap.data().claimedTasks || [];
        if (userTasks.includes(taskId)) {
          setClaimed(true);
        }
      }
    };

    checkTaskStatus();
  }, [userData, taskId]);

  const completeTask = async () => {
    if (claimed || !userData) return;

    window.open(link, "_blank");

    try {
      const userRef = doc(db, "user", String(userData.id));
      await updateDoc(userRef, {
        claimedTasks: arrayUnion(taskId),
        balance: userData.balance + reward,
       
      });
      setClaimed(true);
 
    } catch (error) {
      console.error("Error claiming task:", error);
    }
  };

  return (
    <div className="task-container">
      <div className="task">
        <div className="task-detail">
          <div className="task-image">
            <img src={getCategoryImage(category)} width="45px" alt={category} />
          </div>
          <div>
            <h4>{title}</h4>
            <div className="task-data">
              <img src={logo} width="20px" alt="Coin Icon" />
              <h5>{reward}</h5>
            </div>
          </div>
        </div>
        <button className="task-button" onClick={completeTask} disabled={claimed}>
          {claimed ? "✅ Claimed" : "Claim"}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;

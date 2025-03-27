import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
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

const TasksList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksRef = collection(db, "Dailytask"); // Ensure collection name is correct
        const querySnapshot = await getDocs(tasksRef);

        console.log("Documents fetched:", querySnapshot.docs.length); // Check if data exists

        if (querySnapshot.empty) {
          console.warn("No tasks found in Firestore");
        }

        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched tasks:", tasksData); // Debug Firestore response
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="task-container">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task.id} className="task">
            <div className="task-detail">
              <div className="task-image">
                <img src={getCategoryImage(task.category)} width="45px" alt={task.category} />
              </div>
              <div>
                <h4>{task.title}</h4>
                <div className="task-data">
                  <img src={logo} width="20px" alt="Coin Icon" />
                  <h5>{task.reward}</h5>
                </div>
              </div>
            </div>
            <button className="task-button" onClick={() => window.open(task.link, "_blank")}>
              Go
            </button>
          </div>
        ))
      ) : (
        <p>No tasks available</p>
      )}
    </div>
  );
};

export default TasksList;

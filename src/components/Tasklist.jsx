import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import TaskCard from "./TaskCard";

const TasksList = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
        try {
          const tasksRef = collection(db, "task"); // Ensure collection name is correct
          const querySnapshot = await getDocs(tasksRef);
      
          console.log("Documents fetched:", querySnapshot.docs.length); // Check if data exists
      
          if (querySnapshot.empty) {
            console.warn("No tasks found in Firestore");
          }
      
          const tasksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
      
          console.log("Fetched tasks:", tasksData);
           // Debug Firestore response
          setTasks(tasksData);
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };
      
    fetchTasks();
  }, []);

  return (
    <div className="tasks-list">
    {tasks.map((task) => (
  <TaskCard
    key={task.id}
    taskId={task.id}
    title={task.title}
    reward={task.reward}
    link={task.link}
    category={task.category} // Pass category
  />
))}

    </div>
  );
};

export default TasksList;

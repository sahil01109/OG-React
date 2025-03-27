import React, { useEffect, useState } from "react";
import "./admin.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import AdminNav from "./AdminNav";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [task, settask] = useState([]);
  const [dtask, setdtask] = useState([]);
  const [code, setcode] = useState([]);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "user"));
        const userData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  useEffect(() => {
    const fetchtask = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "task"));
        const taskData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        settask(taskData);
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };

    fetchtask();
  }, []);

  useEffect(() => {
    const fetchtask = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Dailytask"));
        const dtaskData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setdtask(dtaskData);
      } catch (error) {
        console.error("Error fetching DailyTask:", error);
      }
    };

    fetchtask();
  }, []);

  useEffect(() => {
    const fetchtask = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "codes"));
        const codeData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setcode(codeData);
      } catch (error) {
        console.error("Error fetching DailyTask:", error);
      }
    };

    fetchtask();
  }, []);

  return (
    <>
      <AdminNav />
      <div className="detail">
        <h2>OxyGreen Dashboard</h2>
      </div>
      <div className="detail-card">
      <div className="card">
  <div className="card-body">
    <h5 className="card-title">Total Users</h5>
    <p className="card-text">{users.length}</p>
  </div>
</div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Total Tasks</h5>
          <div className="task-type">
         <div className="data">
         <h5 className="card-title">Daily</h5>
         <p className="card-text">{dtask.length}</p>
         </div>
          <div className="data">
          <h5 className="card-title">Other</h5>
          <p className="card-text">{task.length}</p>
          </div>
          </div>
        
       
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">code</h5>
          <p className="card-text">{code.length}</p>
        </div>
      </div>
    </div >
    </>
  );
};

export default AdminDashboard;
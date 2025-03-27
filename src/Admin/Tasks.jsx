import React, { useEffect, useState } from "react";
import "./admin.css";
import { collection, getDocs, doc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase/config"; // Adjust import based on your project structure
import AdminNav from './AdminNav'


const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "Instagram", reward: "" });

  // Fetch tasks from Firestore
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "task"));
        const taskData = [];
        querySnapshot.forEach((doc) => {
          taskData.push({ id: doc.id, ...doc.data() });
        });

        setTasks(taskData);
        setFilteredTasks(taskData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  // Delete task function
  const handleDelete = async (id) => {
    try {
      console.log("Deleting task with ID:", id, typeof id); // Debugging
  
      await deleteDoc(doc(db, "task", id.toString())); // Ensure it's a string
  
      // Update the state using a fresh filter
      setTasks((prev) => {
        const updatedTasks = prev.filter((task) => task.id !== id.toString());
        console.log("Updated tasks after deletion:", updatedTasks);
        return [...updatedTasks]; // Return a new array to trigger a re-render
      });
  
      setFilteredTasks((prev) => {
        const updatedFilteredTasks = prev.filter((task) => task.id !== id.toString());
        console.log("Updated filtered tasks:", updatedFilteredTasks);
        return [...updatedFilteredTasks]; // Return a new array to trigger a re-render
      });
  
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  
  
  // Handle search by ID
  const handleSearch = () => {
    if (searchId.trim() === "") {
      setFilteredTasks(tasks);
    } else {
      const searchResult = tasks.filter((task) =>
        task.id.toString().includes(searchId)
      );
      setFilteredTasks(searchResult);
    }
  };

  // Handle new task input change
  const handleChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  // Handle adding a new task
  const handleAddTask = async () => {
    if (!newTask.title || !newTask.category || !newTask.reward) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "task"), {
        id: Number(newTask.id),
        title: newTask.title,
        category: newTask.category,
        reward: Number(newTask.reward),
        link: newTask.link,
      });

      const addedTask = { id: docRef.id, ...newTask, reward: Number(newTask.reward) };

      setTasks((prev) => [...prev, addedTask]);
      setFilteredTasks((prev) => [...prev, addedTask]);
      setNewTask({ title: "", category: "Instagram", reward: "" });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
  
    <>
     <AdminNav/> 
    <main className="main-content">
      <h1>Tasks</h1>

      {/* Create Task Button */}
      <button className="create-btn" onClick={() => setShowModal(true)}>
        ➕ Create Task
      </button>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="search"
          placeholder="Search Task by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button className="search-btn" onClick={handleSearch}>
          🔍 Search
        </button>
      </div>

      {/* Task Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Reward</th>
              <th>Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.id}</td>
                  <td>{task.title}</td>
                  <td>{task.category}</td>
                  <td>{task.reward}</td>
                  <td>{task.link}</td>
                  <td>
                    <button className="d-btn" onClick={() => handleDelete(String(task.id))}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Creating Task */}
      {showModal && (
        <div className="task-modal">
          <div className="task-modal-content">
            <h3>Create New Task</h3>
            <input
              type="number"
              name="id"
              placeholder="id"
              value={newTask.id}
              onChange={handleChange}
            />
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newTask.title}
              onChange={handleChange}
            />

            {/* Dropdown for Category Selection */}
            <select name="category" value={newTask.category} onChange={handleChange}>
              <option value="instagram">Instagram</option>
              <option value="telegram">Telegram</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
              <option value="whatsapp">Whatsapp</option>
            </select>

            <input
              type="number"
              name="reward"
              placeholder="Reward"
              value={newTask.reward}
              onChange={handleChange}
            />
             <input
              type="link"
              name="link"
              placeholder="web link"
              value={newTask.link}
              onChange={handleChange}
            />
            <div className="task-modal-buttons">
              <button onClick={handleAddTask}>Add Task</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    
      <p style={{ paddingBottom: '80%' }}> </p>
    </main>
    
    </>
 
  );
};

export default Tasks;

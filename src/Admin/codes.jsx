import React, { useEffect, useState } from "react";
import "./admin.css";
import { collection, getDocs, doc, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase/config"; // Adjust import based on your project structure
import AdminNav from "./AdminNav";

const Codes = () => {
  const [codes, setCodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", reward: "" });

  // Fetch codes from Firestore
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "codes"));
        const codeData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCodes(codeData);
      } catch (error) {
        console.error("Error fetching codes:", error);
      }
    };

    fetchCodes();
  }, []);

  // Delete code function
  const handleDelete = async (id) => {
    try {
      console.log("Deleting code with ID:", id); // Debugging

      await deleteDoc(doc(db, "codes", id));

      // Update state to remove deleted code
      setCodes((prev) => prev.filter((code) => code.id !== id));
    } catch (error) {
      console.error("Error deleting code:", error);
    }
  };

  // Handle new code input change
  const handleChange = (e) => {
    setNewCode({ ...newCode, [e.target.name]: e.target.value });
  };

  // Handle adding a new code
  const handleAddCode = async () => {
    if (!newCode.code || !newCode.reward) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "codes"), {
        code: newCode.code,
        reward: Number(newCode.reward),
      });

      setCodes((prev) => [
        ...prev,
        { id: docRef.id, ...newCode, reward: Number(newCode.reward) },
      ]);
      setShowModal(false);
    } catch (error) {
      console.error("Error adding code:", error);
    }
  };

  return (
    <>
      <AdminNav />
      <main className="main-content">
        <h1>Codes</h1>

        {/* Create Code Button */}
        <button className="create-btn" onClick={() => setShowModal(true)}>
          ➕ Create Code
        </button>

        {/* Codes Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Reward</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.length > 0 ? (
                codes.map((code) => (
                  <tr key={code.id}>
                    <td>{code.code}</td>
                    <td>{code.reward}</td>
                    <td>
                      <button className="d-btn" onClick={() => handleDelete(code.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No codes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for Creating Code */}
        {showModal && (
          <div className="task-modal">
            <div className="task-modal-content">
              <h3>Add New Code</h3>

              <input
                type="text"
                name="code"
                placeholder="Code"
                value={newCode.code}
                onChange={handleChange}
              />

              <input
                type="number"
                name="reward"
                placeholder="Reward"
                value={newCode.reward}
                onChange={handleChange}
              />

              <div className="task-modal-buttons">
                <button onClick={handleAddCode}>Add Code</button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <p style={{ paddingBottom: "80%" }}></p>
      </main>
    </>
  );
};

export default Codes;

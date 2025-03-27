import React, { useEffect, useState } from "react";
import "./admin.css";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config"; 
import AdminNav from "./AdminNav";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

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
        setFilteredUsers(userData); 
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Delete user function
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "user", id));

      // Update users list
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      setFilteredUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Search users by ID or Username (case-insensitive)
  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();

    if (query === "") {
      setFilteredUsers(users);
    } else {
      const searchResult = users.filter(
        (user) =>
          user.id.toString().includes(query) || 
          (user.username && user.username.toLowerCase().includes(query))
      );

      setFilteredUsers(searchResult);
    }
  };

  return (
    <main className="main-content">
      <AdminNav />
      <h2>Manage Users</h2>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="search"
          placeholder="Search by ID or Username"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-btn" onClick={handleSearch}>
          🔍 Search
        </button>
      </div>

      {/* User Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Balance</th>
              <th>Mining Boost</th>
              <th>Active Days</th>
              <th>Last Claimed</th>
              <th>Referrals</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username || `User${user.id}`}</td>
                  <td>{user.balance || 0}</td>
                  <td>{user.mining_boost || 1}</td>
                  <td>{user.activeDays || 0}</td>
                  <td>{user.lastClaimed || "N/A"}</td>
                  <td>{user.referrals && user.referrals.length > 0 ? user.referrals.length : "None"}</td>
                  <td>
                    <button className="d-btn" onClick={() => handleDelete(String(user.id))}>
                      ❌ Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default ManageUsers;

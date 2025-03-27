import { useState } from "react";
import { Link } from "react-router-dom";
import "./admin.css"; // Import the CSS file
import { auth } from "../firebase/config"; // Import the auth object from the firebase
import logo from '../assets/img/logo.webp'


const AdminNav = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Logout function
    const handleLogout = async () => {
      await auth.signOut();
      window.location.href = "/admin-login"; // Redirect to login page after logout
    };
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  function open() {
    const menu = document.getElementById("dropdown-content");
    menu.style.display = 'block';
  }
  return (
   <>
    <div className="admin-container">
      <button className="menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      <aside className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
        <button className="close-btn" onClick={toggleSidebar}>×</button>
        <div className="logo">
          <img src={logo} alt="logo" style={{ width: "180px" }} />
        </div>
        <nav>
          <ul>
            <li><Link to="/admin">Home</Link></li>
            <li className="active"><Link to="/admin/users">Users</Link></li>
            <li className="dropdown">
          <button onClick={open} className="dropbtn" >Task</button>
          <div id="dropdown-content">
            <Link to="/admin/dtask">Daily</Link>
            <Link to="/admin/task">Other Task</Link>
            <Link to="/admin/code">Code</Link>
          </div>
        </li>
          </ul>
        </nav>
        <div className="user-profile">
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      
    </div>
    
   </>
   
  );
};

export default AdminNav;

import React from "react"; // Fix 1: Import React
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./airdrop.css";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from "./home";
import Leaderboard from "./Leaderboard";
import Mine from "./mine";
import Activity from "./activities";
import Airdrop from "./airdrop";
import Daily from "./daily";
import Codereward from "./codereward";
import ReferralHandler from "./components/handlerefer";
import { UserProvider } from "./components/UserContext";
import AdminDashboard from "./Admin/AdminDAshboard";
import ManageUsers from "./Admin/ManageUsers";
import Task from "./Admin/Tasks";
import DailyTasks from "./Admin/DailyTasks";
import ProtectedRoute from "./Admin/ProtectedRoute";
import AdminLogin from "./Admin/AdminLogin";
import Code from "./Admin/codes"



const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/leaderboard",
    element: <Leaderboard />,
  },
  {
    path: "/mine",
    element: <Mine />,
  },
  {
    path: "/activity",
    element: <Activity />,
  },
  {
    path: "/airdrop",
    element: <Airdrop />,
  },
  {
    path: "/daily",
    element: <Daily />,
  },
  {
    path: "/codereward",
    element: <Codereward />,
  },
  {
    path: "/referral",
    element: <ReferralHandler />,
  },
  { path: "/admin-login", element: <AdminLogin /> },
  {
    path: "/admin",
    element: <ProtectedRoute />,
    // Protect admin routes
    children: [
      { path: "", element: <AdminDashboard /> },
      { path: "users", element: <ManageUsers /> },
      { path: "task", element: <Task /> },
      { path: "dtask", element: <DailyTasks /> },
      { path: "code", element: <Code/> },
      
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root")); // Fix 5: Ensure "root" exists in index.html
root.render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>
);
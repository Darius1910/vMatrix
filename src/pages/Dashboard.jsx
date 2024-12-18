import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ color: "#e20074" }}>Welcome to vMatrix Dashboard</h1>
      <p>This is the secure area of the application.</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: "1rem",
          padding: "0.8rem 1.5rem",
          backgroundColor: "#e20074",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#c70063")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#e20074")}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;

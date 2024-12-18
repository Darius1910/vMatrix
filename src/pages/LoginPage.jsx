import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import "../styles/Common.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const savedMode = localStorage.getItem("dark-mode");
    if (savedMode === "true") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const tempErrors = {};

    if (!username) {
      tempErrors.username = "Please enter your username.";
    }
    if (!password) {
      tempErrors.password = "Please enter your password.";
    }
    if (username && password && (username !== "admin" || password !== "password")) {
      tempErrors.username = "Incorrect username or password.";
    }

    setErrors(tempErrors);

    // Spusti "shake" animáciu
    if (Object.keys(tempErrors).length > 0) {
      triggerShakeAnimation("username", tempErrors.username);
      triggerShakeAnimation("password", tempErrors.password);
      return;
    }

    localStorage.setItem("isAuthenticated", "true");
    navigate("/dashboard");
  };

  const triggerShakeAnimation = (fieldId, error) => {
    const field = document.getElementById(fieldId);
    if (field && error) {
      field.classList.remove("error-input");
      void field.offsetWidth; // Resetovanie animácie
      field.classList.add("error-input");
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("dark-mode", newMode);
    document.body.classList.toggle("dark-mode", newMode);
  };

  return (
    <div className="container">
      {/* Dark Mode Switch */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          cursor: "pointer",
        }}
        onClick={toggleTheme}
      >
        <FontAwesomeIcon
          icon={isDarkMode ? faSun : faMoon}
          size="2x"
          style={{ color: isDarkMode ? "#f5f5f5" : "#e20074" }}
        />
      </div>

      <div className="card">
        <h1>vMatrix Login</h1>
        <form onSubmit={handleLogin}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            className="input"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors((prev) => ({ ...prev, username: "" }));
            }}
          />
          {errors.username && <p className="error-message">{errors.username}</p>}

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
          />
          {errors.password && <p className="error-message">{errors.password}</p>}

          <button className="button" type="submit">
            Login
          </button>
        </form>

        <a href="/forgot-password" className="link">
          Forgot Password?
        </a>
      </div>
    </div>
  );
};

export default LoginPage;

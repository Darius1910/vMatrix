import React, { useState } from "react";
import "../styles/Common.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const handleReset = (e) => {
    e.preventDefault();
    const tempErrors = {};

    if (!email) {
      tempErrors.email = "Please enter your email address.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    setErrors(tempErrors);

    // Ak neexistujú chyby, vykonajte reset hesla (tu len simulujeme úspešnú akciu)
    if (Object.keys(tempErrors).length === 0) {
      alert("Password reset link has been sent to your email.");
      setEmail("");
    } else {
      triggerShakeAnimation("email", tempErrors.email);
    }
  };

  const triggerShakeAnimation = (fieldId, error) => {
    const field = document.getElementById(fieldId);
    if (field && error) {
      field.classList.remove("error-input");
      void field.offsetWidth; // Resetovanie animácie
      field.classList.add("error-input");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Forgot Password</h1>
        <form onSubmit={handleReset}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className="input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}

          <button className="button" type="submit">
            Reset Password
          </button>
        </form>

        <a href="/" className="link">
          Back to Login
        </a>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

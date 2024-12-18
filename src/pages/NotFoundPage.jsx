import React from "react";
import "../styles/Common.css";

const NotFoundPage = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>404</h1>
        <p>Sorry, the page you're looking for does not exist.</p>
        <a href="/" className="link">
          Back to Login
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;

import React from 'react';

const loaderContainerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  zIndex: 1000
};

const loaderStyle = {
  border: "8px solid #f3f3f3",
  borderTop: "8px solid #e20074",
  borderRadius: "50%",
  width: "50px",
  height: "50px",
  animation: "spin 1s linear infinite"
};

const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Loader = () => {
  return (
    <>
      <style>{keyframes}</style> {/* Pridanie keyframes do JSX */}
      <div style={loaderContainerStyle}>
        <div style={loaderStyle}></div>
      </div>
    </>
  );
};

export default Loader;

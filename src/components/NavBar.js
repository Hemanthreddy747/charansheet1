// Navbar.js
import React from "react";
import "../styles/Navbar.css"; // Import the CSS file

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h1 className="navbar-logo"> </h1>
      </div>
      <div className="navbar-links">
        <a href="/Billing">Home</a>
        <a href="#about">About</a>
        <a href="#ManageStocks">Services</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  );
};

export default Navbar;

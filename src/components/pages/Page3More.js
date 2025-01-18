import React from "react";
import { auth, db, realdb } from "../firebase";
import { ref, onValue } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "react-bootstrap";

const More = () => {
  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
      toast.error("Error logging out!"); // Show error toast
    }
  }
  return (
    <div className="more-container text-center">
      <Button
        variant="danger"
        className="more-container mx-auto m-4 "
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
};

export default More;

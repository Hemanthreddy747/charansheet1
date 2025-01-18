import React, { useEffect, useState, useCallback } from "react";
import { auth, db, realdb } from "./firebase";
import { ref, onValue } from "firebase/database";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Profile.css";
import { doc, getDoc } from "firebase/firestore";
import Billing from "./pages/Page1Billing";
import More from "./pages/Page3More";
import AddProduct from "./pages/Page2Inventory";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [imagesList, setImagesList] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = ["dashboard", "billing", "inventory", "more"];

  // Memoize fetchProducts and fetchImages so they don't get redefined on each render
  const fetchProducts = useCallback(() => {
    const productsRef = ref(realdb, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductsList((prev) => {
          const newProducts = Object.values(data);
          // Only update if data has changed
          return JSON.stringify(prev) !== JSON.stringify(newProducts)
            ? newProducts
            : prev;
        });
      }
    });
  }, []);

  const fetchImages = useCallback(() => {
    const imagesRef = ref(realdb, "images");
    onValue(imagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setImagesList((prev) => {
          const newImages = Object.values(data);
          // Only update if data has changed
          return JSON.stringify(prev) !== JSON.stringify(newImages)
            ? newImages
            : prev;
        });
      }
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchUserData();
        fetchProducts();
        fetchImages();
      } catch (err) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchProducts, fetchImages]); // Only run once, on component mount

  const fetchUserData = async () => {
    return new Promise((resolve, reject) => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserDetails(docSnap.data());
            resolve();
          } else {
            reject(new Error("User not found"));
          }
        } else {
          reject(new Error("No user authenticated"));
        }
      });
    });
  };

  const renderContentTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <div>Dashboard Content</div>;
      case "billing":
        return <Billing />;
      case "inventory":
        return <AddProduct />;
      case "more":
        return <More />;
      default:
        return <More />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>Fetching...</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <nav className="navbarhead d-flex">
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/012/986/755/small_2x/abstract-circle-logo-icon-free-png.png"
          alt="Logo"
          className="logo"
        />
        <div>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
          <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
            {tabs.map((tab) => (
              <li
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMenuOpen(false);
                }}
                className={activeTab === tab ? "active" : ""}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <main>{renderContentTab()}</main>

      <ToastContainer />
    </div>
  );
}

export default Profile;

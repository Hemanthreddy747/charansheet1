import React, { useEffect, useState } from "react";
import { auth, db, realdb } from "../firebase"; // Adjust the import path as necessary
import { ref, set, onValue, remove } from "firebase/database";
import { Button, Form, Table } from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa"; // Import icons for delete and edit
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import CSS for Toastify
import "../../styles/Page1.css";
import { doc, getDoc } from "firebase/firestore";
import Resizer from "react-image-file-resizer";

function Billing() {
  const [productData, setProductData] = useState({
    productName: "", // Changed from "product-name" to productName
    mrp: "",
    purchasePrice: "", // Changed from "purchase-price" to purchasePrice
    productImg: "", // Changed from "product-img" to productImg
    retailSellPrice: "", // Changed from "retail-sell-price" to retailSellPrice
    wholesaleSellPrice: "", // Changed from "wholesale-sell-price" to wholesaleSellPrice
    stockTotal: "", // Changed from "stock-total" to stockTotal
    rank: "",
    uqid: "", // Added uqid for editing
    category: "",
    archive: false,
    brand: "",
    description: "",
    discount: 0,
  });
  const [userDetails, setUserDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [fileInput, setFileInput] = useState(null); // State for file input

  useEffect(() => {
    fetchUserData();
    fetchProducts();
    fetchProducts2();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        }
      }
      setLoading(false);
    });
  };

  // Fetch products from Firebase Realtime Database
  const fetchProducts = () => {
    const productsRef = ref(realdb, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productsList = data ? Object.values(data) : [];
      console.log(productsList);
      setProducts(productsList);
    });
  };
  const fetchProducts2 = () => {
    const productsRef = ref(realdb, "images");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productsList = data ? Object.values(data) : [];
      console.log(productsList);
    });
  };

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login"; // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
      toast.error("Error logging out!"); // Show error toast
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const resizedImage = await resizeFile(file);
      setProductData({ ...productData, "product-img": resizedImage });
      setFileInput(file); // Store the file input
    }
  };

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300, // max width
        400, // max height
        "JPEG", // output format
        80, // quality (0-100)
        0, // rotation
        (uri) => {
          resolve(uri);
        },
        "base64" // output type
      );
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newProductPayload = {
      "product-name": productData["product-name"],
      mrp: parseFloat(productData.mrp),
      "purchase-price": parseFloat(productData["purchase-price"]),
      "product-img": productData["product-img"],
      "retail-sell-price": parseFloat(productData["retail-sell-price"]),
      "wholesale-sell-price": parseFloat(productData["wholesale-sell-price"]),
      "stock-total": parseInt(productData["stock-total"]),
      rank: parseInt(productData.rank),
      uqid: productData.uqid || Date.now().toString(), // Use existing uqid or generate a new one
      category: productData.category,
      archive: productData.archive,
      brand: productData.brand,
      description: productData.description,
      discount: parseFloat(productData.discount),
    };

    try {
      // Save to Realtime Database
      await set(
        ref(realdb, `products/${newProductPayload.uqid}`),
        newProductPayload
      );
      toast.success("Product submitted successfully!"); // Show success toast

      // Clear form after submission
      setProductData({
        productName: "", // Changed from "product-name" to productName
        mrp: "",
        purchasePrice: "", // Changed from "purchase-price" to purchasePrice
        productImg: "", // Changed from "product-img" to productImg
        retailSellPrice: "", // Changed from "retail-sell-price" to retailSellPrice
        wholesaleSellPrice: "", // Changed from "wholesale-sell-price" to wholesaleSellPrice
        stockTotal: "", // Changed from "stock-total" to stockTotal
        rank: "",
        uqid: "", // Added uqid for editing
        category: "",
        archive: false,
        brand: "",
        description: "",
        discount: 0,
      });
      setFileInput(null); // Reset file input

      // Refresh products after submission
      // fetchProducts();
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Failed to submit product!"); // Show error toast
    }
  };

  const handleDelete = async (uqid) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await remove(ref(realdb, `products/${uqid}`));
        fetchProducts(); // Refresh products after deletion
        toast.success("Product deleted successfully!"); // Show success toast
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product!"); // Show error toast
      }
    }
  };

  const handleEdit = (product) => {
    setProductData(product); // Populate form with selected product details
    setFileInput(null); // Reset file input for editing
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  return (
    <div className="profile-container">
      <ToastContainer /> {/* Add ToastContainer here */}
      <header className="header">
        <h1>Product Management</h1>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </header>
      <section className="form-section">
        <h2>Submit Product Details</h2>
        <Form onSubmit={handleSubmit} className="product-form">
          <Form.Group controlId="formProductName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              name="product-name"
              placeholder="Enter product name"
              value={productData["product-name"]}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formMRP">
            <Form.Label>MRP</Form.Label>
            <Form.Control
              type="number"
              name="mrp"
              placeholder="Enter MRP"
              value={productData.mrp}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formPurchasePrice">
            <Form.Label>Purchase Price</Form.Label>
            <Form.Control
              type="number"
              name="purchase-price"
              placeholder="Enter purchase price"
              value={productData["purchase-price"]}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formImageUpload">
            <Form.Label>Product Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!productData.uqid} // Require file only if creating a new product
            />
          </Form.Group>

          {productData["product-img"] && (
            <img
              src={productData["product-img"]}
              alt="Product Preview"
              style={{ width: "100px", height: "100px", marginTop: "10px" }}
            />
          )}

          <Form.Group controlId="formRetailSellPrice">
            <Form.Label>Retail Sell Price</Form.Label>
            <Form.Control
              type="number"
              name="retail-sell-price"
              placeholder="Enter retail sell price"
              value={productData["retail-sell-price"]}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formWholesaleSellPrice">
            <Form.Label>Wholesale Sell Price</Form.Label>
            <Form.Control
              type="number"
              name="wholesale-sell-price"
              placeholder="Enter wholesale sell price"
              value={productData["wholesale-sell-price"]}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formStockTotal">
            <Form.Label>Stock Total</Form.Label>
            <Form.Control
              type="number"
              name="stock-total"
              placeholder="Enter total stock"
              value={productData["stock-total"]}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formRank">
            <Form.Label>Rank</Form.Label>
            <Form.Control
              type="number"
              name="rank"
              placeholder="Enter rank"
              value={productData.rank}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formCategory">
            <Form.Label>Category</Form.Label>
            <Form.Control
              type="text"
              name="category"
              placeholder="Enter category"
              value={productData.category}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formBrand">
            <Form.Label>Brand</Form.Label>
            <Form.Control
              type="text"
              name="brand"
              placeholder="Enter brand"
              value={productData.brand}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              placeholder="Enter description"
              value={productData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formDiscount">
            <Form.Label>Discount</Form.Label>
            <Form.Control
              type="number"
              name="discount"
              placeholder="Enter discount"
              value={productData.discount}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Submit Product
          </Button>
        </Form>
      </section>
      <section className="table-section">
        <h2 className="mt-5">Existing Products</h2>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>MRP</th>
              <th>Purchase Price</th>
              <th>Retail Sell Price</th>
              <th>Wholesale Sell Price</th>
              <th>Stock Total</th>
              <th>Image</th>
              <th>Rank</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.uqid}>
                <td>{product["product-name"]}</td>
                <td>{product.mrp}</td>
                <td>{product["purchase-price"]}</td>
                <td>{product["retail-sell-price"]}</td>
                <td>{product["wholesale-sell-price"]}</td>
                <td>{product["stock-total"]}</td>
                <td>
                  <img
                    src={product["product-img"]}
                    alt={product["product-name"]}
                    style={{ width: "50px", height: "50px" }}
                  />
                </td>
                <td>{product.rank}</td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <FaEdit /> Edit
                  </Button>{" "}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(product.uqid)}
                  >
                    <FaTrash /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}

export default Billing;

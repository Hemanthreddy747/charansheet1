import React, { useState, useEffect } from "react";
import { ref, get, set, remove, update } from "firebase/database";
import { realdb } from "../firebase";
import { Form, Button, Table } from "react-bootstrap";
import Resizer from "react-image-file-resizer";
import "../../styles/Page2.css";

function AddProduct() {
  const [productData, setProductData] = useState({
    productName: "",
    mrp: "",
    purchasePrice: "",
    retailSellPrice: "",
    wholesaleSellPrice: "",
    stockTotal: "",
    rank: "",
    uqid: "", // Will be set with Date.now()
    category: "",
    archive: false,
    brand: "",
    description: "",
    totalSale: "",
    discount: 0,
  });

  const [fileInput, setFileInput] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editUqid, setEditUqid] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const resizedImage = await resizeFile(file);
      setFileInput(resizedImage);
    }
  };

  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300,
        400,
        "JPEG",
        80,
        0,
        (uri) => {
          resolve(uri);
        },
        "base64"
      );
    });

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const productSnapshot = await get(ref(realdb, "products"));
      const imageSnapshot = await get(ref(realdb, "images"));

      const productData = productSnapshot.exists() ? productSnapshot.val() : {};
      const imageData = imageSnapshot.exists() ? imageSnapshot.val() : {};

      const mergedData = Object.keys(productData).map((uqid) => ({
        ...productData[uqid],
        image: imageData[uqid]?.image || null,
      }));

      setProducts(mergedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uqid = editMode ? editUqid : Date.now().toString(); // Generate unique ID based on timestamp

    const newProductPayload = {
      ...productData,
      uqid, // Attach generated uqid
    };

    try {
      // Save product details to Realtime Database
      await set(ref(realdb, `products/${uqid}`), newProductPayload);

      if (fileInput) {
        // Save image to Realtime Database under a separate path
        await set(ref(realdb, `images/${uqid}`), { image: fileInput });
      }

      alert("Product and image submitted successfully!");

      // Clear form after submission
      setProductData({
        productName: "",
        mrp: "",
        purchasePrice: "",
        retailSellPrice: "",
        wholesaleSellPrice: "",
        stockTotal: "",
        rank: "",
        uqid: "",
        category: "",
        archive: false,
        brand: "",
        description: "",
        totalSale: "",
        discount: 0,
      });
      setFileInput(null);
      setEditMode(false);
      setEditUqid(null);
      fetchProducts(); // Reload the table
    } catch (error) {
      console.error("Error submitting product and image:", error);
      alert("Failed to submit product and image.");
    }
  };

  const handleEdit = (product) => {
    setProductData(product);
    setEditMode(true);
    setEditUqid(product.uqid);
  };

  const handleArchive = async (uqid, archiveStatus) => {
    const confirmArchive = window.confirm(
      `Are you sure you want to ${
        archiveStatus ? "unarchive" : "archive"
      } this product?`
    );
    if (confirmArchive) {
      try {
        await update(ref(realdb, `products/${uqid}`), {
          archive: !archiveStatus,
        });
        fetchProducts(); // Reload the table
      } catch (error) {
        console.error("Error updating archive status:", error);
        alert("Failed to update archive status.");
      }
    }
  };

  const handleDelete = async (uqid) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (confirmDelete) {
      try {
        await remove(ref(realdb, `products/${uqid}`));
        await remove(ref(realdb, `images/${uqid}`));
        fetchProducts(); // Reload the table
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      }
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredProducts = products
    .filter(
      (product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.archive - b.archive);

  return (
    <div className="add-product-container">
      {" "}
      hi
      <h2>{editMode ? "Edit Product" : "Add New Product"}</h2>
      <Form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <Form.Group controlId="formProductName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              name="productName"
              placeholder="Enter product name"
              value={productData.productName}
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
              name="purchasePrice"
              placeholder="Enter purchase price"
              value={productData.purchasePrice}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formRetailSellPrice">
            <Form.Label>Retail Sell Price</Form.Label>
            <Form.Control
              type="number"
              name="retailSellPrice"
              placeholder="Enter retail sell price"
              value={productData.retailSellPrice}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formWholesaleSellPrice">
            <Form.Label>Wholesale Sell Price</Form.Label>
            <Form.Control
              type="number"
              name="wholesaleSellPrice"
              placeholder="Enter wholesale sell price"
              value={productData.wholesaleSellPrice}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="formStockTotal">
            <Form.Label>Stock Total</Form.Label>
            <Form.Control
              type="number"
              name="stockTotal"
              placeholder="Enter total stock"
              value={productData.stockTotal}
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

          <Form.Group controlId="formImageUpload">
            <Form.Label>Product Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required={!editMode}
            />
            {fileInput && (
              <img
                src={fileInput}
                alt="Product Preview"
                className="image-preview"
              />
            )}
          </Form.Group>
        </div>

        <Button variant="primary" type="submit" className="submit-btn">
          {editMode ? "Update Product" : "Submit Product"}
        </Button>
      </Form>
      <h2>Product List</h2>
      <input
        type="text"
        placeholder="Search by product name or description"
        value={searchQuery}
        onChange={handleSearch}
      />
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>UQID</th>
              <th>Product Name</th>
              <th>MRP</th>
              <th>Purchase Price</th>
              <th>Stock Total</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Discount</th>
              <th>Description</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.uqid}>
                <td>{product.uqid}</td>
                <td>{product.productName}</td>
                <td>{product.mrp}</td>
                <td>{product.purchasePrice}</td>
                <td>{product.stockTotal}</td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>{product.discount}</td>
                <td>{product.description}</td>
                <td>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.productName}
                      style={{ width: "50px", height: "50px" }}
                    />
                  ) : (
                    "No Image"
                  )}
                </td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => handleEdit(product)}
                    className="action-btn"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleArchive(product.uqid, product.archive)}
                    className="action-btn"
                  >
                    {product.archive ? "Unarchive" : "Archive"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(product.uqid)}
                    className="action-btn"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default AddProduct;

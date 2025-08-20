import { useEffect, useState } from "react";
import "./Edit.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const Edit = ({ item, setEdit, onSave }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [image, setImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
  });

  useEffect(() => {
    if (item) {
      setData({
        name: item.name || "",
        description: item.description || "",
        category: item.category || "",
        price: item.price || "",
      });
    }
  }, [item]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/category/list`);
        if (response.data.success && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to fetch categories");
        console.error(error);
      }
    };
    fetchCategories();
  }, [apiUrl]);

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!item || !item._id) {
      toast.error("Item not found");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("price", Number(data.price));
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.put(
        `${apiUrl}/api/product/${item._id}`,
        formData
      );
      if (response.data.success) {
        toast.success(response.data.message || "Product updated successfully!");
        setEdit(false);
        if (onSave) onSave(); // Refresh the list
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (error) {
      toast.error("An error occurred during the update.");
      console.error(error);
    }
  };

  return (
    <>
      <div className="login-popup">
        <form className="login-popup-container" onSubmit={onSubmitHandler}>
          <div className="add-img-upload flex-col">
            <p>Upload Image</p>
            <label htmlFor="image">
              <img
                src={image ? URL.createObjectURL(image) : assets.upload_area}
              />
            </label>
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              hidden
            />
          </div>
          <div className="add-product-name flex-col">
            <p>Product Name</p>
            <input
              onChange={onChangeHandler}
              value={data.name}
              type="text"
              name="name"
              placeholder="Type here"
              required
            />
          </div>
          <div className="add-product-description flex-col">
            <p>Product Description</p>
            <textarea
              onChange={onChangeHandler}
              value={data.description}
              type="text"
              name="description"
              rows="6"
              placeholder="Type here"
              required
            />
          </div>
          <div className="add-category-price">
            <div className="add-category flex-col">
              <p>Product Category</p>
              <select
                onChange={onChangeHandler}
                value={data.category}
                name="category"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="">Loading categories...</option>
                )}
              </select>
            </div>
            <div className="add-price flex-col">
              <p>Product Price</p>
              <input
                onChange={onChangeHandler}
                value={data.price}
                type="number"
                name="price"
                placeholder="$20"
              />
            </div>
          </div>
          <div className="btn">
            <button type="submit" className="add-btn">
              Change
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setEdit(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

Edit.propTypes = {
  item: PropTypes.object.isRequired,
  setEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default Edit;

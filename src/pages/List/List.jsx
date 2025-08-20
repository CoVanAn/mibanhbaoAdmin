import { useEffect, useState, useCallback } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import Edit from "../Edit/Edit";
import PropTypes from "prop-types";

const List = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [list, setList] = useState([]);
  const [edit, setEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const fetchList = useCallback(async () => {
    if (!apiUrl) {
      toast.error("API URL is not configured.");
      return;
    }
    try {
      const response = await axios.get(`${apiUrl}/api/product/list`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setList(response.data.data);
      } else {
        setList([]);
        toast.error(
          response.data.message || "Failed to fetch list or list is empty."
        );
      }
    } catch (error) {
      toast.error("An error occurred while fetching the list.");
      console.error(error);
      setList([]);
    }
  }, [apiUrl]);

  const deleteItem = async (productId) => {
    try {
      const response = await axios.delete(`${apiUrl}/api/product/${productId}`);
      if (response.data.success) {
        toast.success("Item Deleted Successfully");
        await fetchList();
      } else {
        toast.error(response.data.message || "Failed to delete item.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the item.");
    }
  };

  const editItem = (foodId) => {
    const item = list.find((item) => item._id === foodId);
    setCurrentItem(item);
    setEdit(true);
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <>
      {edit ? (
        <Edit item={currentItem} setEdit={setEdit} onSave={fetchList} />
      ) : null}
      <div className="list add flex-col">
        <p>All Products List</p>
        <div className="list-table">
          <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Action</b>
          </div>
          {list.map((item, index) => (
            <div key={index} className="list-table-format">
              <img src={`${apiUrl}/images/${item.image}`} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
              <div className="Action">
                <p onClick={() => deleteItem(item._id)} className="cusor">
                  X
                </p>
                <p onClick={() => editItem(item._id)} className="cusor">
                  <FontAwesomeIcon icon={faEdit} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

List.propTypes = {
  onEdit: PropTypes.func,
};

export default List;

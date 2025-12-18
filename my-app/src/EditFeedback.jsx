import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./EditFeedback.css"; // Make sure to create this CSS file

const EditFeedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:5001/feedback/${id}`, { withCredentials: true })
      .then((res) => {
        setTitle(res.data.title || "");
        setCategory(res.data.category || "");
        setDescription(res.data.description || "");
      })
      .catch(() => setError("Failed to load feedback"));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .put(
        `http://localhost:5001/feedback/${id}`,
        { title, category, description },
        { withCredentials: true }
      )
      .then(() => navigate("/"))
      .catch(() => setError("Update failed"));
  };

  return (
    <div className="edit-container">
      <div className="edit-card">
        <h2>Edit Feedback</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="edit-form">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter feedback title"
          />

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            <option value="Feature">Feature</option>
            <option value="Bug">Bug</option>
            <option value="Improvement">Improvement</option>
            <option value="Other">Other</option>
          </select>

          <label>Description</label>
          <textarea
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your feedback"
          />

          <div className="btn-group">
            <button type="submit" className="update-btn">
              Update Feedback
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFeedback;

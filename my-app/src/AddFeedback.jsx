import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./AddFeedback.css";

const AddFeedback = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState("Normal")
  const navigate = useNavigate();
 
  const predictPriority = (text) => {
    const t = text.toLowerCase();
    if (
    t.includes("urgent") ||
    t.includes("crash") ||
    t.includes("error") ||
    t.includes("not working") ||
    t.includes("fail"))
    {
      return "High";
    }
    return "Normal";
  }



  // ✅ FETCH FEEDBACK IF EDIT MODE
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axios
        .get(`http://localhost:5001/feedback/${id}`, {
          withCredentials: true,
        })
        .then((res) => {
          setTitle(res.data.title);
          setCategory(res.data.category);
          setDescription(res.data.description);
        })
        .catch(() => setError("Failed to load feedback"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  useEffect(() => {
  if (description.trim() !== "") {
    const predicted = predictPriority(description);
    setPriority(predicted);
  } else {
    setPriority("Normal");
  }
}, [description]);


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !category || !description) {
      setError("All fields are required");
      return;
    }

    const apiCall = isEdit
      ? axios.put(
          `http://localhost:5001/feedback/${id}`,
          { title, category, description },
          { withCredentials: true }
        )
      : axios.post(
          "http://localhost:5001/feedback",
          { title, category, description },
          { withCredentials: true }
        );

    apiCall
      .then((res) => {
        if (res.data.Status === "Success") {
          navigate("/");
        } else {
          setError(res.data.Error);
        }
      })
      .catch(() => setError("Something went wrong"));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="add-container">
      <div className="add-card">
        <h2>{isEdit ? "Edit Feedback" : "Add Feedback"}</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
            />
          </div>

          <div className="form-group">
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
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your feedback"
            />
          </div>

          <div className={`priority-box ${priority.toLowerCase()}`}>
  Predicted Priority: <strong>{priority}</strong>
</div>

          <div className="btn-group">
            <button className="submit-btn" type="submit">
              {isEdit ? "Update" : "Submit"}
            </button>
            <button
              className="cancel-btn"
              type="button"
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

export default AddFeedback;

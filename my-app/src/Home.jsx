import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LineChart,
  Line,
  
} from "recharts";


const Home = () => {
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [feedbackList, setFeedbackList] = useState([]); //fetching in array format (map function returns in array format)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const categoryData = feedbackList.reduce((acc, curr) => {
  const category = curr.category;

  const found = acc.find(item => item.name === category);
  if (found) {
    found.count += 1;
  } else {
    acc.push({ name: category, count: 1 });
  }

  return acc;
}, []);
   
const timelineData = (() => {
  const now = new Date();

  // Initialize last 24 hours
  const hours = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(now.getHours() - i);

    hours.push({
      hour: hour.getHours(), // 0–23
      label: `${hour.getHours()}:00`,
      count: 0,
    });
  }

  feedbackList.forEach((fb) => {
    const createdAt = new Date(fb.created_at);
    const diffHours = (now - createdAt) / (1000 * 60 * 60);

    if (diffHours <= 24) {
      const hour = createdAt.getHours();
      const found = hours.find((h) => h.hour === hour);
      if (found) found.count += 1;
    }
  });

  return hours;
})();


  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("http://localhost:5001/auth")
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setName(res.data.name);

          //fetch user feed back

          axios
            .get("http://localhost:5001/feedback", { withCredentials: true })
            .then((res) =>{ setFeedbackList(res.data);
              setLoading(false);
            })
            .catch((err) => {
              console.log(err);
              setLoading(false);
            });
        } else {
          setAuth(false);
          setMessage(res.data.Error);
          setLoading(false);
        }


      })
      .catch((err) => {console.log(err);
        setLoading(false)
      });
  }, []);

  const handleDelete = () => {
    axios
      .get("http://localhost:5001/logout", { withCredentials: true })
      .then((res) => {
        navigate("/login");
      })
      .catch((err) => console.log(err));
  };
  const handleDeleteFeedback = (id) => {
    axios
      .delete(`http://localhost:5001/feedback/${id}`, { withCredentials: true })
      .then((res) => {
        setFeedbackList(feedbackList.filter((fb) => fb.id !== id));
      })
      .catch((err) => console.log(err));
  };
  if (loading) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );
}

  return (
    <div className="home-container">
      {auth ? (
        <div>
          <header className="home-header">
            <h3>Welcome {name}!!</h3>
            <button className="logout-btn" onClick={handleDelete}>Logout</button>
          </header>

          <div className="hero-section">
  <div className="hero-content">
    <h1>
      Turn user feedback into <span>product insights</span> with AI
    </h1>

    <p>
      Collect, categorize, and analyze customer feedback in one place.
      Visualize trends, priorities, and patterns that help teams build better products.
    </p>
  </div>

  <div className="hero-visual">
    <div className="insight-card">
      <p className="card-title">AI Insights</p>
      <p className="card-text">Bug reports are increasing this week</p>
    </div>
  </div>
</div>

          <section className="add-section">
            <button className="add-btn" onClick={() => navigate("/addFeedback")}>
              Add Feedback
            </button>
          </section>

         <div className="graphs">

          <section className="insights-section">
  <h2>AI Insights – Feedback Categories</h2>

  {categoryData.length === 0 ? (
    <p>No data to analyze yet</p>
  ) : (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={categoryData}>
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )}
</section>


<section className="insights-section">
  <h2>AI Insights – Last 24 Hours Activity</h2>

  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={timelineData}>
      <XAxis dataKey="label" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="count"
        strokeWidth={3}
        dot={{ r: 4 }}
      />
    </LineChart>
  </ResponsiveContainer>
</section>
</div>

          <section className="feedback-section">
            <h2>Previous Feedbacks</h2>
            {feedbackList.length === 0 ? (
  <div className="empty-state">
    <img
      src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
      alt="No feedback"
    />
    <h3>No feedback yet</h3>
    <p>Your submitted feedback will appear here.</p>
    <button onClick={() => navigate("/addFeedback")}>
      Add your first feedback
    </button>
  </div>
) : (

              <div className="feedback-cards">
                {feedbackList.map((fb) => (
                  <div className="feedback-card" key={fb.id}>
                     <div className="card-header">
  <h4 className="feedback-title">{fb.title}</h4>

  <span className={`priority-badge ${fb.priority?.toLowerCase()}`}>
    {fb.priority || "Normal"}
  </span>
</div>


                    <span
  className={`feedback-category ${fb.category
    .toLowerCase()
    .replace(/\s+/g, "")}`}
>
                    {fb.category}</span>  
                    <p className="feedback-desc">{fb.description}</p>
                    <br />
                    <div className="card-actions">
  <button
    className="edit-btn"
    onClick={() => navigate(`/editFeedback/${fb.id}`)}
  >
    Edit
  </button>

  <button
    className="delete-btn"
    onClick={() => handleDeleteFeedback(fb.id)}
  >
    Delete
  </button>
</div>

                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="auth-box">
          <h2>{message}</h2>
          <h3>Login now!!!</h3>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5001/login", values)
      .then((res) => {
        if (res.data.Status === "Success") {
          navigate("/");
        } else {
          alert(res.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="login-content">
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
        <label>Enter Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter email"
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          className=""
        />
        <label>Enter Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          onChange={(e) => setValues({ ...values, password: e.target.value })}
          className=""
        />
        <button type="submit">Login</button>
        <p>Don't have account </p>
        <Link to="/register">
          <button>Register</button>
        </Link>
      </form>
    </div>
  );
}

export default Login;

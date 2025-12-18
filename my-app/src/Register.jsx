import React,{useState} from 'react';
import './Register.css';
import axios from 'axios';
import {Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [values, setValues] = useState({
        name:'',
        email:'',
        password:''
    })// here we are passing values to backend in the form of object
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post("http://localhost:5001/register", values)
        .then(res => {
          if(res.data.Status === "Success"){
            navigate ('/login')
          }else{
            alert(res.data.Error)
          }
        })
        .catch(err => console.log(err))
    }
  return (
  <div className="auth-container">
    <div className="auth-card">
      <h1>Create your account</h1>
      <p className="subtitle">
        Start collecting and analyzing product feedback
      </p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) =>
              setValues({ ...values, name: e.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) =>
              setValues({ ...values, email: e.target.value })
            }
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            onChange={(e) =>
              setValues({ ...values, password: e.target.value })
            }
          />
        </div>

        <button type="submit" className="primary-btn">
          Create account
        </button>

        <p className="footer-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  </div>
);

}

export default Register

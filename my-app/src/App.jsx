import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './Login'
import Home from './Home';
import Register from './Register';
import AddFeedback from './AddFeedback';
import EditFeedback from './EditFeedback';

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/addfeedback" element={<AddFeedback/>} />
      <Route path="/editFeedback/:id" element={<EditFeedback />} />

    </Routes>
    </BrowserRouter>
  )
}

export default App;
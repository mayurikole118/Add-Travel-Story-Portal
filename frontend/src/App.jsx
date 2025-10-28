
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


import Signup from "./pages/Auth/SignUp";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/login";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Root />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
      </Routes>
    </Router>
  );
};

// Define the Root components to handle the initial redirect
const Root = ()=>{
  // Check if token exists in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  //Redirect to dashboard if authenticated, otherwise to login
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to ="/login" />
  );
};


export default App;

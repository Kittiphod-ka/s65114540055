import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";

import Dashboard_Admin from "./pages/Dashboard_admin/Dashboard_admin";
import Users from "./pages/Users/Users";
import Drivers from "./pages/Drivers/Drivers";
import SlideCar from "./pages/SlideCar/SlideCar";
import AddSlideCar from "./pages/SlideCar/AddSlideCar";
import EditSlideCar from "./pages/SlideCar/EditSlideCar";
import Booking from "./pages/Booking/Booking";
import BookingDetail from "./pages/Booking/BookingDetail";
import AddDriver from "./pages/Drivers/AddDriver";
import EditDriver from "./pages/Drivers/EditDriver";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "admin") {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        {/* <Route path="/dashboard_admin" element={isAuthenticated ? <Dashboard_Admin /> : <Navigate to="/login" />} /> */}
        <Route path="/users" element={isAuthenticated ? <Users /> : <Navigate to="/login" />} />

        <Route path="/drivers" element={isAuthenticated ? <Drivers /> : <Navigate to="/login" /> } />
        <Route path="/drivers/add" element={isAuthenticated ? <AddDriver /> : <Navigate to="/login" /> } />
        <Route path="/drivers/edit/:id" element={isAuthenticated ? <EditDriver /> : <Navigate to="/login" /> } />

        <Route path="/slidecar" element={<SlideCar />} />
        <Route path="/slidecars/add" element={<AddSlideCar />} />
        <Route path="/slidecars/edit/:id" element={<EditSlideCar />} />

        <Route path="/booking" element={<Booking />} />
        <Route path="/booking/:id" element={<BookingDetail />} />

        <Route path="*" element={<Navigate to={isAuthenticated ? "/login" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;

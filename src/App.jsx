


import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from "./Component/Navbar";

// Lazy load components
const Signup = lazy(() => import("./Component/SingupPages"));
const Login = lazy(() => import("./Component/Login"));
const Dashboard = lazy(() => import("./Dashboard/Dashboard"));
const Postjob = lazy(() => import("./Component/PostJob"));
const Profile = lazy(() => import("./Dashboard/Profile"));
const Homepage = lazy(() => import('./pages/Homepage'));
const Joblist = lazy(() => import('./pages/Job'));
const JobDetails = lazy(() => import("./pages/JobDeatils"));
const ProtectedRoute = lazy(() => import("./Component/ProtectedRoute"));
const MangeJob = lazy(()=>import("./pages/MangeJobs"))
function App() {
  return (
    <Router>
      <Navbar />
      {/* Suspense Fallback Loader */}
      <Suspense fallback={
  <div className="flex items-center justify-center h-screen">
    <div className="text-lg font-semibold">Loading...</div>
  </div>
}>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/postjob" element={<Postjob />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/jobs" element={<Joblist />} />
          <Route path='/manage-jobs' element={<MangeJob/>} />
          <Route path="/job/:id" element={<JobDetails />} />
          {/* Protected Route Example */}
          <Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

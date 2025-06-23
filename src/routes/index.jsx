import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Navbar from "../components/Navbar";
import KanbanBoard from "../pages/KanbanDashboard";
import AssignTickets from "../pages/AssignTickets";
import ReportGeneration from "../pages/ReportGeneration";
import RiskAnalysis from "../pages/RiskAnalysis";

function AppRouter() {
  const [authToken, setAuthToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const [assignments, setAssignments] = useState([]);

  const [tickets, setTickets] = useState({
    "TO DO": [],
    "IN PROGRESS": [],
    "DONE": []
  });
  const [projectKey, setProjectKey] = useState("");

  const [reportState, setReportState] = useState({
    issueKey: '',
    report: null,
    error: ''
  });

  const handleLogin = (token) => {
    setAuthToken(token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsLoggedIn(false);
    setAssignments([]);
    setTickets({
      "TO DO": [],
      "IN PROGRESS": [],
      "DONE": []
    });
    setProjectKey("");
    setReportState({
      issueKey: '',
      report: null,
      error: ''
    });
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route
          path="/"
          element={<Home authToken={authToken} isLoggedIn={isLoggedIn} />}
        />
        <Route
          path="/login"
          element={<Login isLoggedIn={isLoggedIn} onLogin={handleLogin} />}
        />
        <Route
          path="/signup"
          element={<Signup isLoggedIn={isLoggedIn} onSignup={handleLogin} />}
        />
        <Route
          path="/kanban"
          element={
            <KanbanBoard
              authToken={authToken}
              isLoggedIn={isLoggedIn}
              tickets={tickets}
              setTickets={setTickets}
              projectKey={projectKey}
              setProjectKey={setProjectKey}
            />
          }
        />
        <Route
          path="/assign-tickets"
          element={
            <AssignTickets
              authToken={authToken}
              isLoggedIn={isLoggedIn}
              assignments={assignments}
              setAssignments={setAssignments}
            />
          }
        />
        <Route
          path="/report-generation"
          element={
            <ReportGeneration
              authToken={authToken}
              isLoggedIn={isLoggedIn}
              reportState={reportState}
              setReportState={setReportState}
            />
          }
        />
        <Route
          path="/risk-analysis"
          element={<RiskAnalysis authToken={authToken} isLoggedIn={isLoggedIn} />}
        />
      </Routes>
    </Router>
  );
}

export default AppRouter;
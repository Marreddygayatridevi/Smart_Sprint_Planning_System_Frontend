import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

import {  HiClipboardCheck, HiStar, HiClock, HiUsers, HiExclamation,HiFolder,HiTrendingUp,HiInformationCircle,HiRefresh}
from "react-icons/hi";

const AssignTickets = ({ authToken, isLoggedIn, assignments, setAssignments }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [fetchingAssignments, setFetchingAssignments] = useState(false);
  const [formData, setFormData] = useState({
    project_key: "",
    sprint_name: "",
    team_name: ""
  });

  useEffect(() => {
    if (!isLoggedIn || !authToken) {
      navigate("/login");
    } else {
      fetchTeams();
      // Don't fetch from database - assignments come from parent component
    }
  }, [navigate, isLoggedIn, authToken]);

  const getAuthHeaders = () => {
    if (!authToken) {
      navigate("/login");
      return null;
    }
    return { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' };
  };

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await api.get("/team/", { headers });
      setTeams(response.data || []);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Error fetching teams:", err.message);
      }
    } finally {
      setLoadingTeams(false);
    }
  };

  // REMOVED: No longer fetch from database
  // Assignments are managed by parent component for navigation persistence

  const handleAssignTickets = async () => {
    if (!formData.project_key.trim() || !formData.sprint_name.trim() || !formData.team_name.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await api.post("/sprint/create-assignments", formData, { headers });
      setAssignments(response.data);
      
      // Clear form after successful assignment
      setFormData({
        project_key: "",
        sprint_name: "",
        team_name: ""
      });
    } catch (err) {
      console.error("Failed to assign tickets:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(`Failed to assign tickets: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear assignments manually (for new projects/teams)
  const handleClearAssignments = () => {
    setAssignments([]);
    console.log(" Cleared assignments display");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const sprintName = assignment.sprint_name;
    if (!acc[sprintName]) {
      acc[sprintName] = [];
    }
    acc[sprintName].push(assignment);
    return acc;
  }, {});

  const getPriorityColor = (storyPoints) => {
    if (storyPoints <= 5) return "text-green-700 bg-green-50 border-green-200";
    if (storyPoints <= 13) return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  const getPriorityIcon = (storyPoints) => {
    if (storyPoints <= 5) return <HiTrendingUp className="w-4 h-4" />;
    if (storyPoints <= 13) return <HiInformationCircle className="w-4 h-4" />;
    return <HiExclamation className="w-4 h-4" />;
  };

  const getAssigneeInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAssigneeColor = (name) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", 
      "bg-indigo-500", "bg-gray-500", "bg-red-500", "bg-teal-500"
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getTotalStats = () => {
    const totalTickets = assignments.length;
    const totalStoryPoints = assignments.reduce((sum, assignment) => sum + assignment.story_points, 0);
    const totalDays = assignments.reduce((sum, assignment) => sum + assignment.estimated_days, 0);
    const uniqueAssignees = [...new Set(assignments.map(a => a.assignee_name))].length;
    
    return { totalTickets, totalStoryPoints, totalDays, uniqueAssignees };
  };

  const stats = getTotalStats();

  // Show loading if not authenticated
  if (!isLoggedIn || !authToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header with Clear Button */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Sprint Assignment</h1>
            {assignments.length > 0 && (
              <button
                onClick={handleClearAssignments}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                title="Clear current assignments display"
              >
                <HiRefresh className="w-4 h-4" />
                Clear Results
              </button>
            )}
          </div>
          <p className="text-gray-600">Assign tickets to team members</p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Assignment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="project_key"
                  value={formData.project_key}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Project Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sprint Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sprint_name"
                  value={formData.sprint_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sprint Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="team_name"
                  value={formData.team_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loadingTeams}
                >
                  <option value="">
                    {loadingTeams ? "Loading teams..." : "Select a team"}
                  </option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {loadingTeams && (
                  <p className="text-sm text-gray-500 mt-1">Loading available teams...</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex items-center">
                    <HiExclamation className="w-4 h-4 text-red-500 mr-2" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleAssignTickets}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <HiRefresh className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
                    Assigning...
                  </div>
                ) : (
                  "Assign Tickets"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {assignments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
                <HiClipboardCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
              <p className="text-sm text-gray-600">Total Tickets</p>
            </div>
            
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2">
                <HiStar className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStoryPoints}</p>
              <p className="text-sm text-gray-600">Story Points</p>
            </div>
            
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
                <HiClock className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
              <p className="text-sm text-gray-600">Total Days</p>
            </div>
            
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mx-auto mb-2">
                <HiUsers className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueAssignees}</p>
              <p className="text-sm text-gray-600">Team Members</p>
            </div>
          </div>
        )}

        {/* Results */}
        {assignments.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Results</h2>
              <p className="text-gray-600">
                {assignments.length} tickets assigned across {Object.keys(groupedAssignments).length} sprint{Object.keys(groupedAssignments).length !== 1 ? 's' : ''}
              </p>
            </div>

            {Object.entries(groupedAssignments).map(([sprintName, sprintAssignments]) => (
              <div key={sprintName} className="bg-white rounded-lg shadow border">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <HiFolder className="w-5 h-5 text-gray-600 mr-2" />
                      {sprintName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{sprintAssignments.length} tickets</span>
                      <span>{sprintAssignments.reduce((sum, a) => sum + a.story_points, 0)} points</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {sprintAssignments.map((assignment) => (
                      <div
                        key={assignment.issue_key}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-md">
                                {assignment.issue_key}
                              </span>
                              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border ${getPriorityColor(assignment.story_points)}`}>
                                {getPriorityIcon(assignment.story_points)}
                                <span className="ml-1">{assignment.story_points} points</span>
                              </span>
                              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                                <HiClock className="w-3 h-3 mr-1" />
                                {assignment.estimated_days} days
                              </span>
                            </div>
                            
                            <h4 className="text-base font-medium text-gray-900 mb-2">
                              {assignment.title}
                            </h4>
                          </div>

                          <div className="flex items-center ml-4">
                            <div className="text-right mr-3">
                              <p className="text-xs text-gray-500">Assigned to</p>
                              <p className="text-sm font-medium text-gray-900">{assignment.assignee_name}</p>
                            </div>
                            <div className={`w-10 h-10 ${getAssigneeColor(assignment.assignee_name)} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                              {getAssigneeInitials(assignment.assignee_name)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {assignments.length === 0 && !loading && (
          <div className="text-center py-12">
            <HiClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-500">Fill in the form above to create sprint assignments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignTickets;
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MdAssignment } from 'react-icons/md';
import { HiRefresh } from "react-icons/hi";
import { api } from "../api/axios";
import TicketModal from "../components/TicketModal";
import KanbanColumn from "../components/KanbanColumn";

const STATUSES = ["TO DO", "IN PROGRESS", "DONE"];
const STATUS_MAP = {
  "TO DO": "To Do",
  "IN PROGRESS": "In Progress", 
  "DONE": "Done"
};
const REVERSE_STATUS_MAP = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [v, k])
);

const INITIAL_TICKET = {
  title: "",
  description: "",
  priority: "Medium",
  assignee: "",
  status: "",
  due_date: "",
};

const KanbanDashboard = ({ 
  authToken, 
  isLoggedIn, 
  tickets, 
  setTickets, 
  projectKey, 
  setProjectKey 
}) => {
  const navigate = useNavigate();

  const [state, setState] = useState({
    loading: false,
    selectedTicket: null,
    editingTicket: null,
    showModal: false,
    isEditMode: false,
    showCreateModal: false,
    newTicket: INITIAL_TICKET
  });

  const hasTickets = useMemo(() => 
    Object.values(tickets).some(statusTickets => statusTickets.length > 0),
    [tickets]
  );

  const authHeaders = useMemo(() => {
    if (!authToken) return null;
    return { 
      Authorization: `Bearer ${authToken}`, 
      'Content-Type': 'application/json' 
    };
  }, [authToken]);

  useEffect(() => {
    if (!isLoggedIn || !authToken) {
      navigate("/login");
    }
  }, [navigate, isLoggedIn, authToken]);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleApiError = useCallback((error, defaultMessage) => {
    const status = error.response?.status;
    
    if (status === 401) {
      navigate("/login");
    } else if (status === 404) {
      alert("Resource not found.");
    } else if (status === 422) {
      alert("Invalid data format. Please check your inputs.");
    } else {
      alert(`${defaultMessage}: ${error.response?.data?.detail || error.message}`);
    }
  }, [navigate]);

  const transformTicketData = useCallback((issue) => ({
    id: issue.id,
    key: issue.key,
    summary: issue.title || issue.summary || "",
    description: issue.description || "",
    dueDate: issue.due_date || issue.dueDate || "",
    assignee: issue.assignee || "",
    priority: issue.priority || "Medium",
    status: REVERSE_STATUS_MAP[issue.status] || issue.status?.toUpperCase() || "TO DO",
  }), []);

  const fetchJiraIssues = useCallback(async (key) => {
    if (!key.trim() || !authHeaders) return;
    
    updateState({ loading: true });
    
    try {
      // Always try database first for faster loading
      let res = await api.get(`/jira/issues?project_key=${key}&sync=false`, { headers: authHeaders });
      
      // If no issues found in database, try syncing with Jira
      if (!res.data || res.data.length === 0) {
        try {
          console.log(`No local data found. Attempting to sync with Jira for project ${key}...`);
          res = await api.get(`/jira/issues?project_key=${key}&sync=true`, { headers: authHeaders });
          console.log(`Successfully synced with Jira for project ${key}`);
        } catch (syncError) {
          console.log(`Jira sync failed for project ${key} (this is normal for custom projects):`, syncError.message);
          // If sync fails, just use empty array - this allows custom projects to work
          res = { data: [] };
        }
      }
      
      const grouped = STATUSES.reduce((acc, status) => ({ ...acc, [status]: [] }), {});
      const issueMap = new Map();
      
      (res.data || []).forEach((issue) => {
        const ticketData = transformTicketData(issue);
        
        if (grouped[ticketData.status] && !issueMap.has(issue.key)) {
          grouped[ticketData.status].push(ticketData);
          issueMap.set(issue.key, ticketData);
        }
      });
      
      setTickets(grouped);
    } catch (err) {
      // Gracefully handle all errors
      console.log(`Error fetching issues for project ${key}:`, err.message);
      // Set empty tickets to allow working with new projects
      setTickets(STATUSES.reduce((acc, status) => ({ ...acc, [status]: [] }), {}));
    } finally {
      updateState({ loading: false });
    }
  }, [authHeaders, transformTicketData, setTickets, updateState]);

  const createTicket = useCallback(async () => {
    const { newTicket } = state;
    const missingFields = [];
    
    if (!projectKey.trim()) missingFields.push("Project Key");
    if (!newTicket.title.trim()) missingFields.push("Title");
    if (!newTicket.description.trim()) missingFields.push("Description");
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(", ")}`);
      return;
    }
    
    if (!authHeaders) return;
    
    try {
      const payload = {
        project_key: projectKey,
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority,
        story_points: 0,
        assignee: newTicket.assignee,
        status: STATUS_MAP[newTicket.status] || "To Do",
        due_date: newTicket.due_date || null,
      };

      const res = await api.post("/jira/new_issues", payload, { headers: authHeaders });
      const created = res.data;
      const targetStatus = REVERSE_STATUS_MAP[created.status] || newTicket.status;
      
      setTickets(prev => ({
        ...prev,
        [targetStatus]: [...prev[targetStatus], transformTicketData(created)],
      }));
      
      updateState({ 
        showCreateModal: false, 
        newTicket: INITIAL_TICKET 
      });
    } catch (error) {
      handleApiError(error, "Failed to create ticket");
    }
  }, [state.newTicket, projectKey, authHeaders, setTickets, transformTicketData, handleApiError, updateState]);

  const updateTicket = useCallback(async (updatedTicket) => {
    if (!authHeaders) return;
    
    try {
      const updatePayload = {
        title: updatedTicket.summary,
        description: updatedTicket.description,
        priority: updatedTicket.priority,
        assignee: updatedTicket.assignee || null,
        status: STATUS_MAP[updatedTicket.status] || updatedTicket.status,
        story_points: null,
        due_date: updatedTicket.dueDate || null,
      };

      const res = await api.put(`/jira/update_issue/${updatedTicket.key}`, updatePayload, { headers: authHeaders });
      const updated = res.data;
      const targetStatus = REVERSE_STATUS_MAP[updated.status] || updatedTicket.status;

      setTickets(prev => {
        const newTickets = { ...prev };
        
        STATUSES.forEach(status => {
          newTickets[status] = newTickets[status].filter(t => t.key !== updatedTicket.key);
        });
        
        newTickets[targetStatus] = [...newTickets[targetStatus], transformTicketData(updated)];
        return newTickets;
      });

      updateState({ 
        selectedTicket: transformTicketData(updated), 
        isEditMode: false 
      });
    } catch (error) {
      handleApiError(error, "Failed to update ticket");
    }
  }, [authHeaders, setTickets, transformTicketData, handleApiError, updateState]);

  const deleteTicket = useCallback(async (ticket) => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticket.key}?`)) {
      return;
    }

    if (!authHeaders) return;

    try {
      await api.delete(`/jira/delete_issue/${ticket.key}`, { headers: authHeaders });

      setTickets(prev => {
        const newTickets = { ...prev };
        STATUSES.forEach(status => {
          newTickets[status] = newTickets[status].filter(t => t.key !== ticket.key);
        });
        return newTickets;
      });

      closeModal();
    } catch (error) {
      handleApiError(error, "Failed to delete ticket");
    }
  }, [authHeaders, setTickets, handleApiError]);

  const handleDrop = useCallback(async (e, targetStatus) => {
    e.preventDefault();
    const ticketId = parseInt(e.dataTransfer.getData("ticketId"));
    const sourceStatus = STATUSES.find(status =>
      tickets[status].some(t => t.id === ticketId)
    );
    
    if (!sourceStatus || sourceStatus === targetStatus || !authHeaders) return;
    
    const movedTicket = tickets[sourceStatus].find(t => t.id === ticketId);
    
    // Optimistic update
    setTickets(prev => ({
      ...prev,
      [sourceStatus]: prev[sourceStatus].filter(t => t.id !== ticketId),
      [targetStatus]: [...prev[targetStatus], { ...movedTicket, status: targetStatus }],
    }));

    try {
      const updatePayload = {
        title: movedTicket.summary,
        description: movedTicket.description,
        priority: movedTicket.priority,
        assignee: movedTicket.assignee || null,
        status: STATUS_MAP[targetStatus],
        due_date: movedTicket.dueDate || null,
      };

      await api.put(`/jira/update_issue/${movedTicket.key}`, updatePayload, { headers: authHeaders });
    } catch (error) {
      setTickets(prev => ({
        ...prev,
        [targetStatus]: prev[targetStatus].filter(t => t.id !== ticketId),
        [sourceStatus]: [...prev[sourceStatus], movedTicket],
      }));
      handleApiError(error, "Failed to update ticket status");
    }
  }, [tickets, authHeaders, setTickets, handleApiError]);

  const handleClearTickets = useCallback(() => {
    setTickets(STATUSES.reduce((acc, status) => ({ ...acc, [status]: [] }), {}));
    setProjectKey("");
  }, [setTickets, setProjectKey]);

  const handleProjectKeyChange = useCallback((e) => {
    setProjectKey(e.target.value.toUpperCase());
  }, [setProjectKey]);

  const handleProjectKeyKeyDown = useCallback((e) => {
    if (e.key === "Enter" && projectKey.trim()) {
      fetchJiraIssues(projectKey.trim());
    }
  }, [projectKey, fetchJiraIssues]);

  const handleCreate = useCallback((status) => {
    updateState({
      newTicket: { ...INITIAL_TICKET, status },
      showCreateModal: true
    });
  }, [updateState]);

  const handleTicketClick = useCallback((ticket) => {
    updateState({
      selectedTicket: ticket,
      editingTicket: { ...ticket },
      isEditMode: false,
      showModal: true
    });
  }, [updateState]);

  const closeModal = useCallback(() => {
    updateState({
      showModal: false,
      selectedTicket: null,
      editingTicket: null,
      isEditMode: false
    });
  }, [updateState]);

  const handleNewTicketChange = useCallback((field, value) => {
    updateState({
      newTicket: { ...state.newTicket, [field]: value }
    });
  }, [state.newTicket, updateState]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
            {hasTickets && (
              <button
                onClick={handleClearTickets}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                title="Clear kanban board and start fresh"
              >
                <HiRefresh className="w-4 h-4" />
                Clear Board
              </button>
            )}
          </div>
          
          {/* Project Key Input */}
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Key
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={projectKey}
              onChange={handleProjectKeyChange}
              onKeyDown={handleProjectKeyKeyDown}
              placeholder="Enter any project key"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={state.loading}
            />
            <button
              onClick={() => fetchJiraIssues(projectKey.trim())}
              disabled={state.loading || !projectKey.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {state.loading ? "Loading..." : "Load"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {state.loading && (
          <div className="text-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        )}

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tickets={tickets[status] || []}
              onCreate={() => handleCreate(status)}
              onTicketClick={handleTicketClick}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Assign Tickets Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/assign-tickets")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center gap-3"
          >
            <MdAssignment className="w-6 h-6" />
            Assign Tickets to Sprint
          </button>
        </div>

        {/* Create Ticket Modal */}
        {state.showCreateModal && (
          <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] rounded-lg shadow-xl border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Create Ticket</h2>
                <div className="space-y-4">
                  {[
                    { key: 'title', label: 'Title*', type: 'input', placeholder: 'Enter ticket title' },
                    { key: 'description', label: 'Description*', type: 'textarea', placeholder: 'Enter ticket description' },
                    { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
                    { key: 'assignee', label: 'Assignee (optional)', type: 'input', placeholder: 'Enter assignee name' },
                    { key: 'due_date', label: 'Due Date (optional)', type: 'date' }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={state.newTicket[field.key]}
                          onChange={(e) => handleNewTicketChange(field.key, e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          rows={3}
                          placeholder={field.placeholder}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          value={state.newTicket[field.key]}
                          onChange={(e) => handleNewTicketChange(field.key, e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          {field.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={state.newTicket[field.key]}
                          onChange={(e) => handleNewTicketChange(field.key, e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <input
                      type="text"
                      value={STATUS_MAP[state.newTicket.status] || ""}
                      readOnly
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <button
                  onClick={() => updateState({ showCreateModal: false })}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createTicket}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Details Modal */}
        {state.showModal && state.selectedTicket && state.editingTicket && (
          <TicketModal
            ticket={state.selectedTicket}
            editingTicket={state.editingTicket}
            setEditingTicket={(ticket) => updateState({ editingTicket: ticket })}
            isEditMode={state.isEditMode}
            onClose={closeModal}
            onEdit={() => updateState({ isEditMode: true })}
            onUpdate={updateTicket}
            onDelete={deleteTicket}
          />
        )}
      </div>
    </div>
  );
};

export default KanbanDashboard;
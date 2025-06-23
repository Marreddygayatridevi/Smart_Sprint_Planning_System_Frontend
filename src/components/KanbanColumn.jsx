import React from "react";
import { MdCalendarToday, MdAdd } from 'react-icons/md';

const KanbanColumn = ({ status, tickets, onCreate, onTicketClick, onDragOver, onDrop }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "TO DO":
        return "bg-red-50 border-red-200";
      case "IN PROGRESS":
        return "border-yellow-200";
      case "DONE":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0) return `${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date < now;
  };

  // NEW: Get assignee initials for avatar
  const getAssigneeInitials = (name) => {
    if (!name) return "";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // NEW: Get avatar color - purple for sprint assignments, blue for others
  const getAvatarColor = (isSprintAssigned) => {
    return isSprintAssigned ? 'bg-purple-500' : 'bg-blue-500';
  };

  const handleDragStart = (e, ticketId) => {
    e.dataTransfer.setData("ticketId", ticketId);
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${getStatusColor(status)} min-h-[500px] bg-white shadow-sm`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{status}</h2>
        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
          {tickets.length}
        </span>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${
              ticket.isSprintAssigned 
                ? 'border-purple-200 ring-1 ring-purple-100' 
                : 'border-gray-200'
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, ticket.id)}
            onClick={() => onTicketClick(ticket)}
          >
            {/* Header with Key and Priority */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {ticket.key}
                </span>
                {/* NEW: Sprint assignment indicator */}
                {ticket.isSprintAssigned && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    Sprint
                  </span>
                )}
              </div>
              <div
                className={`w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`}
                title={`Priority: ${ticket.priority}`}
              />
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-800 mb-3 line-clamp-2">
              {ticket.summary || "Click to add title"}
            </h3>

            {/* Bottom section with Due Date and Assignee */}
            <div className="flex justify-between items-end">
              <div className="flex flex-col space-y-1">
                {ticket.dueDate && (
                  <div className="flex items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        isOverdue(ticket.dueDate)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <MdCalendarToday className="w-3 h-3" />
                      {formatDate(ticket.dueDate)}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 capitalize">
                    {ticket.priority}
                  </span>
                </div>
              </div>

              {/* NEW: Enhanced Assignee Display */}
              <div className="flex flex-col items-end">
                {ticket.assignee ? (
                  <div className="flex items-center gap-2">
                    {/* Assignee Avatar - purple for sprint assignments */}
                    <div className={`w-7 h-7 ${getAvatarColor(ticket.isSprintAssigned)} rounded-full flex items-center justify-center text-xs font-medium text-white shadow-sm`}>
                      {getAssigneeInitials(ticket.assignee)}
                    </div>
                    
                    {/* Assignee Name */}
                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-medium max-w-[90px] truncate ${
                        ticket.isSprintAssigned ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {ticket.assignee}
                      </span>
                      {/* Assignment source indicator */}
                      <span className={`text-[10px] ${
                        ticket.isSprintAssigned ? 'text-purple-500' : 'text-gray-400'
                      }`}>
                        {ticket.isSprintAssigned ? 'Sprint' : 'Manual'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Unassigned indicator */
                  <div className="flex items-center text-xs text-gray-400">
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                      ?
                    </div>
                    <span className="ml-2">Unassigned</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Ticket Button */}
      <button
        onClick={onCreate}
        className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <MdAdd className="w-4 h-4" />
        Add New Ticket
      </button>
    </div>
  );
};

export default KanbanColumn;

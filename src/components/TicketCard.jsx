import React from "react";
import { Calendar, MoreHorizontal } from "lucide-react";

const TicketCard = ({ ticket, onClick }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("ticketId", ticket.id.toString());
  };

  const getAssigneeInitials = (name) => {
    return name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 pr-2">
          {ticket.summary || "Click to add title"}
        </h3>
        <MoreHorizontal size={16} className="text-gray-400 flex-shrink-0" />
      </div>

      {ticket.dueDate && (
        <div className="flex items-center gap-1 mb-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-xs text-gray-600">
            {new Date(ticket.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">✓ {ticket.key}</span>
        {ticket.assignee && (
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">
            {getAssigneeInitials(ticket.assignee)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;



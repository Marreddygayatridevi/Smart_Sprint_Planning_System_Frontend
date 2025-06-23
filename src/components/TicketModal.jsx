import React from "react";

const TicketModal = ({
  ticket,
  editingTicket,
  setEditingTicket,
  isEditMode,
  onClose,
  onEdit,
  onUpdate,
  onDelete,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSave = () => {
    onUpdate(editingTicket);
    onClose();
  };

  const handleCancel = () => {
    setEditingTicket({ ...ticket });
    onClose();
  };

  const handleDelete = () => {
    onDelete(ticket);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-h-[90vh] overflow-y-auto rounded-lg shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-white">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              {ticket.key}
            </h2>
            <div className="flex items-center gap-6">
              {/* Due Date */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Due Date</span>
                <span className="text-sm font-medium text-gray-700">
                  {ticket.dueDate ? formatDate(ticket.dueDate) : "Not set"}
                </span>
              </div>
              {/* Priority */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Priority</span>
                <span className={`text-sm px-3 py-1 rounded-full border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              {/* Assignee */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Assignee</span>
                <span className="text-sm font-medium text-gray-700">
                  {ticket.assignee || "Unassigned"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={editingTicket.summary}
                onChange={(e) =>
                  setEditingTicket({ ...editingTicket, summary: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            ) : (
              <p className="text-gray-800 font-medium bg-gray-50 p-3 rounded-md">
                {ticket.summary}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditMode ? (
              <textarea
                value={editingTicket.description}
                onChange={(e) =>
                  setEditingTicket({ ...editingTicket, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                rows={4}
              />
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md min-h-[100px]">
                {ticket.description || "No description"}
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditMode ? (
                <select
                  value={editingTicket.status}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="TO DO">TO DO</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              ) : (
                <span className="inline-block px-3 py-2 rounded-md text-sm bg-blue-100 text-blue-800 border border-blue-200">
                  {ticket.status}
                </span>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              {isEditMode ? (
                <select
                  value={editingTicket.priority}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, priority: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              ) : (
                <span className={`inline-block px-3 py-2 rounded-md text-sm border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  value={editingTicket.assignee || ""}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, assignee: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Enter assignee name"
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 p-2 rounded-md">
                  {ticket.assignee || "Unassigned"}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              {isEditMode ? (
                <input
                  type="date"
                  value={editingTicket.dueDate || ""}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, dueDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              ) : (
                <p className="text-gray-700 bg-gray-50 p-2 rounded-md">
                  {ticket.dueDate ? formatDate(ticket.dueDate) : "Not set"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div>
            {!isEditMode && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 px-4 py-2 rounded-md border border-red-300 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            {isEditMode ? (
              <>
                <button
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={onEdit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
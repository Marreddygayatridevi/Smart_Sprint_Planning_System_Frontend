// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   HiPlus,
//   HiTrash,
//   HiUsers,
//   HiUserGroup,
//   HiExclamation,
//   HiCheckCircle,
//   HiRefresh,
//   HiEye
// } from 'react-icons/hi';
// import { api } from '../api/axios';

// const AdminTeamManagement = ({ authToken, isLoggedIn }) => {
//   const navigate = useNavigate();
//   const [teams, setTeams] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [newTeamName, setNewTeamName] = useState('');
//   const [creating, setCreating] = useState(false);
//   const [deletingTeam, setDeletingTeam] = useState(null);
//   const [selectedTeam, setSelectedTeam] = useState(null);
//   const [teamDetails, setTeamDetails] = useState(null);

//   useEffect(() => {
//     if (!isLoggedIn || !authToken) {
//       navigate("/login");
//     } else {
//       fetchTeams();
//     }
//   }, [navigate, isLoggedIn, authToken]);

//   const getAuthHeaders = () => {
//     if (!authToken) {
//       navigate("/login");
//       return null;
//     }
//     return { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' };
//   };

//   const fetchTeams = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const headers = getAuthHeaders();
//       if (!headers) return;

//       const response = await api.get('/team/', { headers });
//       setTeams(response.data || []);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         navigate("/login");
//       } else {
//         setError('Failed to fetch teams: ' + (err.response?.data?.detail || err.message));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createTeam = async (e) => {
//     e.preventDefault();
//     if (!newTeamName.trim()) {
//       setError('Please enter a team name');
//       return;
//     }

//     setCreating(true);
//     setError('');
//     setSuccess('');

//     try {
//       const headers = getAuthHeaders();
//       if (!headers) return;

//       const response = await api.post('/team/', { 
//         name: newTeamName.trim() 
//       }, { headers });

//       setTeams([...teams, response.data]);
//       setNewTeamName('');
//       setSuccess(`Team '${response.data.name}' created successfully!`);
      
//       // Clear success message after 3 seconds
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         navigate("/login");
//       } else {
//         setError('Failed to create team: ' + (err.response?.data?.detail || err.message));
//       }
//     } finally {
//       setCreating(false);
//     }
//   };

//   const deleteTeam = async (teamName) => {
//     if (!window.confirm(`Are you sure you want to delete team '${teamName}'? This action cannot be undone.`)) {
//       return;
//     }

//     setDeletingTeam(teamName);
//     setError('');
//     setSuccess('');

//     try {
//       const headers = getAuthHeaders();
//       if (!headers) return;

//       await api.delete(`/team/${teamName}`, { headers });
//       setTeams(teams.filter(team => team.name !== teamName));
//       setSuccess(`Team '${teamName}' deleted successfully!`);
      
//       // Clear success message after 3 seconds
//       setTimeout(() => setSuccess(''), 3000);
      
//       // Close team details if deleted team was selected
//       if (selectedTeam === teamName) {
//         setSelectedTeam(null);
//         setTeamDetails(null);
//       }
//     } catch (err) {
//       if (err.response?.status === 401) {
//         navigate("/login");
//       } else {
//         setError('Failed to delete team: ' + (err.response?.data?.detail || err.message));
//       }
//     } finally {
//       setDeletingTeam(null);
//     }
//   };

//   const viewTeamDetails = async (teamName) => {
//     setSelectedTeam(teamName);
//     setError('');

//     try {
//       const headers = getAuthHeaders();
//       if (!headers) return;

//       const response = await api.get(`/team/${teamName}`, { headers });
//       setTeamDetails(response.data);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         navigate("/login");
//       } else {
//         setError('Failed to fetch team details: ' + (err.response?.data?.detail || err.message));
//         setSelectedTeam(null);
//       }
//     }
//   };

//   const closeTeamDetails = () => {
//     setSelectedTeam(null);
//     setTeamDetails(null);
//   };

//   if (!isLoggedIn || !authToken) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-6xl mx-auto px-6 py-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
//           <p className="text-gray-600">Create, view, and manage teams in your organization</p>
//         </div>

//         {/* Create Team Form */}
//         <div className="max-w-2xl mx-auto mb-8">
//           <div className="bg-white rounded-lg shadow border p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
//               <HiPlus className="w-5 h-5 mr-2 text-blue-600" />
//               Create New Team
//             </h2>
            
//             <form onSubmit={createTeam} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Team Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={newTeamName}
//                   onChange={(e) => setNewTeamName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Enter team name (e.g., developers, designers, qa)"
//                   disabled={creating}
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={creating || !newTeamName.trim()}
//                 className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 {creating ? (
//                   <div className="flex items-center justify-center">
//                     <HiRefresh className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" />
//                     Creating Team...
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center">
//                     <HiPlus className="w-4 h-4 mr-2" />
//                     Create Team
//                   </div>
//                 )}
//               </button>
//             </form>
//           </div>
//         </div>

//         {/* Status Messages */}
//         {error && (
//           <div className="max-w-2xl mx-auto mb-6">
//             <div className="bg-red-50 border border-red-200 rounded-md p-3">
//               <div className="flex items-center">
//                 <HiExclamation className="w-4 h-4 text-red-500 mr-2" />
//                 <p className="text-red-700 text-sm">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {success && (
//           <div className="max-w-2xl mx-auto mb-6">
//             <div className="bg-green-50 border border-green-200 rounded-md p-3">
//               <div className="flex items-center">
//                 <HiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
//                 <p className="text-green-700 text-sm">{success}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Teams List */}
//         <div className="bg-white rounded-lg shadow border">
//           <div className="bg-gray-50 px-6 py-4 border-b">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <HiUserGroup className="w-5 h-5 text-gray-600 mr-2" />
//                 All Teams ({teams.length})
//               </h3>
//               <button
//                 onClick={fetchTeams}
//                 disabled={loading}
//                 className="flex items-center gap-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
//               >
//                 <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                 Refresh
//               </button>
//             </div>
//           </div>

//           <div className="p-6">
//             {loading ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <span className="ml-3 text-gray-600">Loading teams...</span>
//               </div>
//             ) : teams.length === 0 ? (
//               <div className="text-center py-8">
//                 <HiUserGroup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
//                 <p className="text-gray-500">Create your first team using the form above</p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {teams.map((team) => (
//                   <div
//                     key={team.id}
//                     className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//                   >
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex-1">
//                         <h4 className="text-lg font-medium text-gray-900 mb-1">
//                           {team.name}
//                         </h4>
//                         <p className="text-sm text-gray-500">
//                           Created: {new Date(team.created_at).toLocaleDateString()}
//                         </p>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={() => viewTeamDetails(team.name)}
//                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
//                           title="View team details"
//                         >
//                           <HiEye className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => deleteTeam(team.name)}
//                           disabled={deletingTeam === team.name}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
//                           title="Delete team"
//                         >
//                           {deletingTeam === team.name ? (
//                             <HiRefresh className="w-4 h-4 animate-spin" />
//                           ) : (
//                             <HiTrash className="w-4 h-4" />
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Team Details Modal */}
//         {selectedTeam && teamDetails && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
//               <div className="bg-blue-50 px-6 py-4 border-b">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-semibold text-blue-900 flex items-center">
//                     <HiUsers className="w-5 h-5 mr-2" />
//                     Team: {teamDetails.name}
//                   </h3>
//                   <button
//                     onClick={closeTeamDetails}
//                     className="text-gray-500 hover:text-gray-700"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               </div>
              
//               <div className="p-6">
//                 <div className="mb-4">
//                   <p className="text-sm text-gray-600">
//                     Created: {new Date(teamDetails.created_at).toLocaleDateString()}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Team Members: {teamDetails.users?.length || 0}
//                   </p>
//                 </div>

//                 {teamDetails.users && teamDetails.users.length > 0 ? (
//                   <div>
//                     <h4 className="font-medium text-gray-900 mb-3">Team Members:</h4>
//                     <div className="space-y-2">
//                       {teamDetails.users.map((user, index) => (
//                         <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
//                           <div>
//                             <p className="font-medium text-gray-900">{user.full_name}</p>
//                             <p className="text-sm text-gray-600">{user.email}</p>
//                           </div>
//                           <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
//                             {user.role}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-4">
//                     <HiUsers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
//                     <p className="text-gray-500">No team members found</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminTeamManagement;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiPlus, HiTrash, HiUsers, HiUserGroup, HiExclamation,
  HiCheckCircle, HiRefresh, HiEye
} from 'react-icons/hi';
import { api } from '../api/axios';

const AdminTeamManagement = ({ authToken, isLoggedIn }) => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !authToken) navigate("/login");
    else fetchTeams();
  }, [isLoggedIn, authToken]);

  const getHeaders = () => authToken ? ({ Authorization: `Bearer ${authToken}` }) : null;

  const fetchTeams = async () => {
    setLoading(true); setError('');
    try {
      const headers = getHeaders();
      if (!headers) return;
      const { data } = await api.get('/team/', { headers });
      setTeams(data || []);
    } catch (err) {
      handleApiError(err, 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return setError('Please enter a team name');

    setCreating(true); setError(''); setSuccess('');
    try {
      const headers = getHeaders();
      if (!headers) return;
      const { data } = await api.post('/team/', { name: newTeamName.trim() }, { headers });
      setTeams(prev => [...prev, data]);
      setNewTeamName('');
      showSuccess(`Team '${data.name}' created successfully!`);
    } catch (err) {
      handleApiError(err, 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  const deleteTeam = async (teamName) => {
    if (!window.confirm(`Delete team '${teamName}'?`)) return;
    setDeletingTeam(teamName); setError(''); setSuccess('');
    try {
      const headers = getHeaders();
      if (!headers) return;
      await api.delete(`/team/${teamName}`, { headers });
      setTeams(prev => prev.filter(t => t.name !== teamName));
      showSuccess(`Team '${teamName}' deleted successfully!`);
      if (selectedTeam === teamName) clearTeamDetails();
    } catch (err) {
      handleApiError(err, 'Failed to delete team');
    } finally {
      setDeletingTeam(null);
    }
  };

  const viewTeamDetails = async (teamName) => {
    setSelectedTeam(teamName); setError('');
    try {
      const headers = getHeaders();
      if (!headers) return;
      const { data } = await api.get(`/team/${teamName}`, { headers });
      setTeamDetails(data);
    } catch (err) {
      handleApiError(err, 'Failed to fetch team details');
      clearTeamDetails();
    }
  };

  const clearTeamDetails = () => {
    setSelectedTeam(null);
    setTeamDetails(null);
  };

  const handleApiError = (err, fallback) => {
    if (err.response?.status === 401) navigate("/login");
    else setError(`${fallback}: ${err.response?.data?.detail || err.message}`);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (!isLoggedIn || !authToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4 rounded-full"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-600">Create, view, and manage teams</p>
        </div>

        <form onSubmit={createTeam} className="max-w-2xl mx-auto mb-8 bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., developers, designers, qa"
              disabled={creating}
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newTeamName.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? <HiRefresh className="animate-spin h-4 w-4 inline mr-2" /> : <HiPlus className="w-4 h-4 inline mr-2" />}
            {creating ? 'Creating Team...' : 'Create Team'}
          </button>
        </form>

        {error && <Alert type="error" icon={<HiExclamation />} message={error} />}
        {success && <Alert type="success" icon={<HiCheckCircle />} message={success} />}

        <div className="bg-white rounded-lg shadow border">
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold flex items-center"><HiUserGroup className="w-5 h-5 mr-2" /> All Teams ({teams.length})</h3>
            <button
              onClick={fetchTeams}
              disabled={loading}
              className="flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
            >
              <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
                <span className="ml-3 text-gray-600">Loading teams...</span>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8">
                <HiUserGroup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
                <p className="text-gray-500">Create your first team using the form above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(team => (
                  <div key={team.id} className="border p-4 rounded-lg hover:shadow-md">
                    <div className="flex justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-medium">{team.name}</h4>
                        <p className="text-sm text-gray-500"></p>
                      </div>
                      <div className="flex space-x-2">
                        <IconButton onClick={() => viewTeamDetails(team.name)} icon={<HiEye />} color="blue" />
                        <IconButton onClick={() => deleteTeam(team.name)} icon={<HiTrash />} color="red" loading={deletingTeam === team.name} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedTeam && teamDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="bg-blue-50 px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                  <HiUsers className="w-5 h-5 mr-2" /> Team: {teamDetails.name}
                </h3>
                <button onClick={clearTeamDetails} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-2"></p>
                <p className="text-sm text-gray-600 mb-4">Team Members: {teamDetails.users?.length || 0}</p>
                {teamDetails.users?.length > 0 ? (
                  <div className="space-y-2">
                    {teamDetails.users.map((user, idx) => (
                      <div key={idx} className="flex justify-between bg-gray-50 p-3 rounded">
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">{user.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <HiUsers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No team members found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Alert = ({ type, icon, message }) => (
  <div className={`max-w-2xl mx-auto mb-6 bg-${type === 'error' ? 'red' : 'green'}-50 border border-${type === 'error' ? 'red' : 'green'}-200 rounded-md p-3`}>
    <div className="flex items-center">
      {icon}
      <p className={`ml-2 text-${type === 'error' ? 'red' : 'green'}-700 text-sm`}>{message}</p>
    </div>
  </div>
);

const IconButton = ({ onClick, icon, color, loading }) => (
  <button
    onClick={onClick}
    className={`p-2 text-${color}-600 hover:bg-${color}-50 rounded-md transition-colors disabled:opacity-50`}
    disabled={loading}
    title={color === 'red' ? 'Delete team' : 'View team details'}
  >
    {loading ? <HiRefresh className="w-4 h-4 animate-spin" /> : icon}
  </button>
);

export default AdminTeamManagement;

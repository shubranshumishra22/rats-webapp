// client/src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BadgeNotification from '@/components/BadgeNotification';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface User { _id: string; username: string; }
interface Task {
  _id: string; content: string; visibility: 'private' | 'public'; isCompleted: boolean;
  owner: User; 
  collaborators: User[]; 
  pendingInvitations: User[];
}
interface DashboardData {
    ownedTasks: Task[];
    collaboratingTasks: Task[];
    invitations: Task[];
    publicTasks: Task[];
}
interface Badge { name: string; description: string; icon: string; }


// --- Reusable Task Card Component ---
const TaskCard = ({ task, myId, handlers }: { task: Task; myId: string | null; handlers: any }) => {
    const isOwner = task.owner && task.owner._id === myId;
    const isCollaborator = task.collaborators && task.collaborators.some(c => c && c._id === myId);
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div className="flex items-start">
                    <input 
                        type="checkbox" 
                        checked={task.isCompleted} 
                        onChange={() => handlers.handleUpdateTask(task._id, !task.isCompleted)}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="ml-3">
                        <p className={`text-gray-800 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                            {task.content}
                        </p>
                        {!isOwner && task.owner && task.owner.username && (
                            <p className="text-xs text-gray-500">
                                from <span className="font-medium">{task.owner.username}</span>
                            </p>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                            {task.visibility === 'public' ? (
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Public</span>
                            ) : (
                                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Private</span>
                            )}
                        </div>
                    </div>
                </div>
                {isOwner && (
                    <button 
                        onClick={() => handlers.handleDeleteTask(task._id)} 
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                        Delete
                    </button>
                )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                        {task.owner && task.owner.username && (
                            <div 
                                title={`Owner: ${task.owner.username}`} 
                                className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
                            >
                                {task.owner.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {task.collaborators && task.collaborators.map(c => 
                            c && c.username && (
                                <div 
                                    key={c._id} 
                                    title={c.username} 
                                    className="h-7 w-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
                                >
                                    {c.username.charAt(0).toUpperCase()}
                                </div>
                            )
                        )}
                    </div>
                    {isOwner && (
                        <button 
                            onClick={() => handlers.toggleInviteForm(task._id)} 
                            className="text-xs bg-gray-200 px-2 py-1 rounded-md hover:bg-gray-300"
                        >
                            Invite
                        </button>
                    )}
                </div>
                
                {handlers.inviteTaskId === task._id && (
                    <form onSubmit={(e) => handlers.handleInvite(e, task._id)} className="mt-2 flex gap-2">
                        <input 
                            type="text" 
                            value={handlers.inviteUsername} 
                            onChange={e => handlers.setInviteUsername(e.target.value)} 
                            placeholder="Username" 
                            className="flex-grow px-2 py-1 text-xs border rounded-md"
                        />
                        <button type="submit" className="text-xs bg-green-500 text-white px-2 py-1 rounded-md">
                            Send
                        </button>
                    </form>
                )}
                
                {/* Only show pending invitations for public tasks, not for private tasks where the owner invited someone */}
                {task.pendingInvitations && task.pendingInvitations.length > 0 && isOwner && task.visibility === 'public' && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500">Pending Join Requests:</p>
                        {task.pendingInvitations.map(user => 
                            user && user.username && (
                                <div key={user._id} className="flex justify-between items-center text-sm py-1">
                                    <span className="font-medium">{user.username}</span>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handlers.handleAcceptCollabRequest(task._id, user._id)} 
                                            className="text-xs bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition-colors"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [isNewTaskPublic, setIsNewTaskPublic] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteTaskId, setInviteTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('rats_token')}` } }), []);

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching dashboard data...');
      const response = await axios.get('http://localhost:5001/api/tasks/dashboard', getAuthHeaders());
      console.log('Dashboard data received:', response.data);
      
      // Update state with the new data
      setDashboardData(response.data);
    } catch (error) { 
      console.error('Failed to fetch dashboard data:', error); 
    } 
    finally { 
      setIsLoading(false); 
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) { 
      router.push('/login'); 
      return; 
    }
    
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      const expiry = decodedToken.exp * 1000; // Convert to milliseconds
      if (Date.now() >= expiry) {
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('rats_token');
        router.push('/login');
        return;
      }
      
      setMyId(decodedToken.id);
      fetchData();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [fetchData, router]);

  const handleAction = async (actionPromise: Promise<any>) => {
    try {
      console.log('Performing action...');
      const response = await actionPromise;
      console.log('Action response:', response.data);
      
      // Check for new badges
      if (response.data.newBadges && response.data.newBadges.length > 0) {
        console.log('New badge earned:', response.data.newBadges[0]);
        setNewlyEarnedBadge(response.data.newBadges[0]);
      }
      
      // Refresh data
      console.log('Refreshing dashboard data...');
      await fetchData();
      console.log('Dashboard data refreshed');
    } catch (error: any) {
      console.error('Action error:', error);
      alert(`Error: ${error.response?.data?.message || "An unexpected error occurred."}`);
    }
  };

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    const taskData = { content: newTaskContent, visibility: isNewTaskPublic ? 'public' : 'private' };
    handleAction(axios.post('http://localhost:5001/api/tasks', taskData, getAuthHeaders()));
    setNewTaskContent(''); setIsNewTaskPublic(false);
  };
  
  const handleInvite = (e: React.FormEvent<HTMLFormElement>, taskId: string) => {
    e.preventDefault();
    if (!inviteUsername.trim()) {
      alert('Please enter a username to invite');
      return;
    }
    
    console.log(`Inviting user ${inviteUsername} to task ${taskId}`);
    
    handleAction(
      axios.post(
        `http://localhost:5001/api/tasks/${taskId}/invite`, 
        { usernameToInvite: inviteUsername }, 
        getAuthHeaders()
      )
    ).then(() => {
      // Clear the form after successful invitation
      setInviteUsername('');
      setInviteTaskId(null);
      
      // Show success message
      alert(`Invitation sent to ${inviteUsername}`);
    });
  };

  const toggleInviteForm = (taskId: string) => {
    setInviteTaskId(prevId => (prevId === taskId ? null : taskId));
    setInviteUsername('');
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    
    console.log(`Deleting task ${taskId}`);
    return handleAction(
      axios.delete(`http://localhost:5001/api/tasks/${taskId}`, getAuthHeaders())
    ).then(() => {
      // Show success message
      alert('Goal deleted successfully');
    });
  };
  const handleUpdateTask = (taskId: string, isCompleted: boolean) => {
    console.log(`Updating task ${taskId} to isCompleted=${isCompleted}`);
    return handleAction(axios.put(`http://localhost:5001/api/tasks/${taskId}`, { isCompleted }, getAuthHeaders()));
  };
  const handleAcceptInvite = (taskId: string) => {
    console.log(`Accepting invitation for task ${taskId}`);
    return handleAction(
      axios.post(`http://localhost:5001/api/tasks/${taskId}/accept`, {}, getAuthHeaders())
    ).then(() => {
      // Show success message
      alert('Invitation accepted');
    });
  };
  const handleRejectInvite = (taskId: string) => {
    console.log(`Rejecting invitation for task ${taskId}`);
    return handleAction(
      axios.post(`http://localhost:5001/api/tasks/${taskId}/reject`, {}, getAuthHeaders())
    ).then(() => {
      // Show success message
      alert('Invitation rejected');
    });
  };
  const handleJoinPublicTask = (taskId: string) => {
    console.log(`Joining public task ${taskId}`);
    return handleAction(
      axios.post(`http://localhost:5001/api/tasks/${taskId}/request-join`, {}, getAuthHeaders())
    ).then(() => {
      // Show success message
      alert('You have joined this goal successfully');
    });
  };
  const handleAcceptCollabRequest = (taskId: string, userIdToAccept: string) => {
    console.log(`Accepting collaboration request from user ${userIdToAccept} for task ${taskId}`);
    return handleAction(
      axios.post(`http://localhost:5001/api/tasks/${taskId}/accept-collab`, { userIdToAccept }, getAuthHeaders())
    ).then(() => {
      // Show success message
      alert('Collaboration request accepted');
    });
  };

  if (!isMounted || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading My Sphere...</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50">
        {newlyEarnedBadge && (
          <BadgeNotification badge={newlyEarnedBadge} onClose={() => setNewlyEarnedBadge(null)} />
        )}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">My Sphere</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <form onSubmit={handleCreateTask}>
                <h2 className="text-xl font-semibold mb-3 text-gray-800">Create a New Goal</h2>
                <textarea value={newTaskContent} onChange={e => setNewTaskContent(e.target.value)} placeholder="What do you want to achieve?"
                          className="w-full p-3 border border-gray-200 rounded-lg" rows={2}/>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center"><input type="checkbox" id="isPublic" checked={isNewTaskPublic} onChange={e => setIsNewTaskPublic(e.target.checked)} className="h-4 w-4 rounded"/><label htmlFor="isPublic" className="ml-2 text-sm text-gray-600">Make this a public goal</label></div>
                    <button type="submit" className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg">Add Goal</button>
                </div>
              </form>
            </div>
            
            {dashboardData?.invitations && dashboardData.invitations.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Invitations</h2>
                    <div className="space-y-3">
                        {dashboardData.invitations.map(task => (
                            <div key={task._id} className="bg-yellow-100 p-3 rounded-lg flex justify-between items-center text-sm">
                                <div>
                                    <span>Invitation from <b>{task.owner && task.owner.username}</b> for:</span>
                                    <p className="font-medium mt-1">"{task.content}"</p>
                                </div>
                                <div className="flex-shrink-0 flex space-x-2">
                                    <button 
                                        onClick={() => handleAcceptInvite(task._id)} 
                                        className="bg-green-500 text-white text-xs px-2 py-1 rounded-md hover:bg-green-600 transition-colors"
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleRejectInvite(task._id)} 
                                        className="bg-red-500 text-white text-xs px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">My Goals & Collaborations</h2>
              <div className="space-y-3">
                {dashboardData?.ownedTasks.map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    myId={myId} 
                    handlers={{ 
                      handleUpdateTask, 
                      handleDeleteTask, 
                      toggleInviteForm, 
                      handleInvite, 
                      inviteTaskId, 
                      inviteUsername, 
                      setInviteUsername, 
                      handleAcceptCollabRequest 
                    }} 
                  />
                ))}
                {dashboardData?.collaboratingTasks.map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    myId={myId} 
                    handlers={{ 
                      handleUpdateTask,
                      handleDeleteTask: () => {}, // Empty function since collaborators can't delete
                      toggleInviteForm: () => {}, // Empty function since collaborators can't invite
                      handleInvite: () => {}, // Empty function since collaborators can't invite
                      inviteTaskId: null,
                      inviteUsername: '',
                      setInviteUsername: () => {}, // Empty function since collaborators can't invite
                      handleAcceptCollabRequest: () => {} // Empty function since collaborators can't accept requests
                    }} 
                  />
                ))}
                {(!dashboardData?.ownedTasks || dashboardData.ownedTasks.length === 0) && (!dashboardData?.collaboratingTasks || dashboardData.collaboratingTasks.length === 0) && (<p className="text-gray-500 text-center py-4">Your goal list is empty.</p>)}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-4 sticky top-24">
            <h2 className="text-2xl font-bold text-gray-900">Community Goals</h2>
            {dashboardData?.publicTasks && dashboardData.publicTasks.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.publicTasks.map(task => {
                  // Check if the user is already a collaborator on this task
                  const isCollaborator = task.collaborators && 
                    task.collaborators.some(c => c && c._id === myId);
                  // For public tasks, we only need to check if the user is a collaborator
                  // since we're adding them directly without approval
                  const isAlreadyInvolved = isCollaborator;
                  
                  return (
                    <div key={task._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-800 font-medium">{task.content}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            from <Link href={`/profile/${task.owner && task.owner.username}`} className="font-medium hover:underline">
                              {task.owner && task.owner.username}
                            </Link>
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Public</span>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {task.owner && task.owner.username && (
                            <div 
                              title={`Owner: ${task.owner.username}`} 
                              className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
                            >
                              {task.owner.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {task.collaborators && task.collaborators.map(c => 
                            c && c.username && (
                              <div 
                                key={c._id} 
                                title={c.username} 
                                className="h-7 w-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
                              >
                                {c.username.charAt(0).toUpperCase()}
                              </div>
                            )
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleJoinPublicTask(task._id)} 
                          disabled={isAlreadyInvolved} 
                          className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-md text-sm hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                          {isCollaborator ? 'Already Joined' : 'Join Goal'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 bg-white rounded-xl shadow-sm">No public goals right now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </ClientOnly>
  );
}

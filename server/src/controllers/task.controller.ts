// server/src/controllers/task.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Task from '../models/task.model';
import User from '../models/user.model';
import { checkAndAwardBadges } from '../services/badge.service';

/**
 * @desc    Get all data needed for the main task dashboard
 * @route   GET /api/tasks/dashboard
 * @access  Private
 */
export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id;
    console.log(`Getting dashboard data for user ${userId}`);

    const [ownedTasks, collaboratingTasks, invitations, publicTasks] = await Promise.all([
        // Tasks the user owns, with collaborators and pending requests populated
        Task.find({ owner: userId })
            .populate('owner', 'username')
            .populate('collaborators', 'username')
            .populate('pendingInvitations', 'username')
            .sort({ createdAt: -1 }),
        
        // Tasks the user is a collaborator on
        Task.find({ collaborators: userId })
            .populate('owner', 'username')
            .populate('collaborators', 'username')
            .sort({ createdAt: -1 }),
        
        // Tasks the user has been invited to (and is not the owner)
        Task.find({ 
            pendingInvitations: userId, 
            owner: { $ne: userId } // Make sure the user is not the owner
        })
            .populate('owner', 'username')
            .sort({ createdAt: -1 }),
        
        // Public tasks from other users that the user is NOT involved with yet
        Task.find({ 
            visibility: 'public', 
            owner: { $ne: userId },
            collaborators: { $nin: [userId] },
            pendingInvitations: { $nin: [userId] }
        })
            .populate('owner', 'username')
            .populate('pendingInvitations', 'username')
            .populate('collaborators', 'username')
            .limit(10)
            .sort({ createdAt: -1 })
            .lean(), // Use lean() for better performance
    ]);

    console.log(`Found ${ownedTasks.length} owned tasks`);
    console.log(`Found ${collaboratingTasks.length} collaborating tasks`);
    console.log(`Found ${invitations.length} invitations`);
    console.log(`Found ${publicTasks.length} public tasks`);

    // Process owned tasks to filter out pending invitations for private tasks
    // For private tasks, the owner has sent invitations, so we don't want to show them as pending requests
    // For public tasks, users have requested to join, so we want to show them as pending requests
    const processedOwnedTasks = ownedTasks.map(task => {
        // If it's a private task, clear the pendingInvitations array
        // This prevents showing invitations the owner has sent as pending requests
        if (task.visibility === 'private') {
            // Create a new object with the same properties but empty pendingInvitations
            const taskObj = task.toObject();
            taskObj.pendingInvitations = [];
            return taskObj;
        }
        // For public tasks, keep the pendingInvitations as they are join requests
        return task;
    });

    res.status(200).json({
        ownedTasks: processedOwnedTasks,
        collaboratingTasks,
        invitations,
        publicTasks
    });
});

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { content, visibility } = req.body;
  if (!content) { res.status(400); throw new Error('Content field is required'); }
  const task = await Task.create({ owner: req.user?._id, content, visibility: visibility || 'private', collaborators: [], pendingInvitations: [] });
  res.status(201).json(task);
});

/**
 * @desc    Update a task (and award XP & Badges if completed)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }

  const isOwner = task.owner.toString() === req.user?._id.toString();
  const isCollaborator = task.collaborators.some(id => id.toString() === req.user?._id.toString());
  
  if (!isOwner && !isCollaborator) { res.status(401); throw new Error('User not authorized to update this task'); }
  
  const wasCompleted = task.isCompleted;
  if (isOwner) { task.content = req.body.content || task.content; }
  if (req.body.isCompleted !== undefined) { task.isCompleted = req.body.isCompleted; }

  let newBadges: any[] = [];
  if (!wasCompleted && task.isCompleted) {
    const owner = await User.findById(task.owner);
    if(owner) {
        owner.xp = (owner.xp || 0) + 10;
        newBadges = await checkAndAwardBadges(owner);
        if (newBadges.length === 0) { // Save only if badge service didn't
            await owner.save();
        }
    }
    
    if (task.collaborators && task.collaborators.length > 0) {
      await User.updateMany({ _id: { $in: task.collaborators } }, { $inc: { xp: 5 } });
    }
  }

  const updatedTask = await task.save();
  res.status(200).json({ updatedTask, newBadges });
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }
  if (task.owner.toString() !== req.user?._id.toString()) { res.status(401); throw new Error('User not authorized'); }
  await task.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Task removed' });
});

/**
 * @desc    Invite a user to collaborate on a task
 * @route   POST /api/tasks/:id/invite
 * @access  Private
 */
export const inviteCollaborator = asyncHandler(async (req: Request, res: Response) => {
    const { usernameToInvite } = req.body;
    console.log(`Inviting user ${usernameToInvite} to collaborate`);
    
    // Find the task
    const task = await Task.findById(req.params.id);
    if (!task) { 
        console.log('Task not found');
        throw new Error('Task not found'); 
    }
    
    // Verify the current user is the owner
    if (task.owner.toString() !== req.user!._id.toString()) { 
        console.log('Only the owner can invite');
        throw new Error('Only the owner can invite.'); 
    }
    
    // Find the user to invite (case insensitive)
    const userToInvite = await User.findOne({ 
        username: { $regex: new RegExp(`^${usernameToInvite}$`, 'i') } 
    });
    
    if (!userToInvite) { 
        console.log(`User '${usernameToInvite}' not found`);
        throw new Error(`User '${usernameToInvite}' not found.`); 
    }
    
    // Check if user is already involved
    if (
        task.collaborators.some(id => id.toString() === userToInvite._id.toString()) || 
        task.owner.toString() === userToInvite._id.toString() || 
        task.pendingInvitations.some(id => id.toString() === userToInvite._id.toString())
    ) {
        console.log('User is already involved with this task');
        throw new Error('User is already involved with this task.');
    }
    
    // Create a new invitation model to track invitations separately
    // For now, we'll continue using the pendingInvitations array in the Task model
    // But we'll make sure to only show invitations to the invitee
    
    // Add the user to pending invitations
    task.pendingInvitations.push(userToInvite._id);
    await task.save();
    
    console.log(`User ${userToInvite.username} added to pending invitations`);
    
    // Return the populated task
    const populatedTask = await Task.findById(task._id)
        .populate('owner', 'username')
        .populate('collaborators', 'username')
        .populate('pendingInvitations', 'username');
    
    if (!populatedTask) {
        throw new Error('Failed to retrieve updated task');
    }
    
    res.status(200).json({
        ...populatedTask.toObject(),
        message: `Invitation sent to ${userToInvite.username}`
    });
});

/**
 * @desc    Accept a collaboration invite
 * @route   POST /api/tasks/:id/accept
 * @access  Private
 */
export const acceptInvite = asyncHandler(async (req: Request, res: Response) => {
    console.log(`User ${req.user!._id} accepting invitation for task ${req.params.id}`);
    
    // Find the task
    const task = await Task.findById(req.params.id);
    if (!task) { 
        console.log('Task not found');
        throw new Error('Task not found'); 
    }
    
    // Find the invitation
    const inviteIndex = task.pendingInvitations.findIndex(id => id.toString() === req.user!._id.toString());
    if (inviteIndex === -1) { 
        console.log('No pending invitation found');
        throw new Error('No pending invitation found.'); 
    }
    
    console.log('Invitation found, accepting...');
    
    // Remove from pending invitations and add to collaborators
    task.pendingInvitations.splice(inviteIndex, 1);
    task.collaborators.push(req.user!._id);
    await task.save();
    
    console.log('User added as collaborator');
    
    // Return the populated task
    const populatedTask = await Task.findById(task._id)
        .populate('owner', 'username')
        .populate('collaborators', 'username')
        .populate('pendingInvitations', 'username');
    
    res.status(200).json(populatedTask);
});

/**
 * @desc    Reject a collaboration invite
 * @route   POST /api/tasks/:id/reject
 * @access  Private
 */
export const rejectInvite = asyncHandler(async (req: Request, res: Response) => {
    console.log(`User ${req.user!._id} rejecting invitation for task ${req.params.id}`);
    
    // Find the task
    const task = await Task.findById(req.params.id);
    if (!task) { 
        console.log('Task not found');
        throw new Error('Task not found'); 
    }
    
    // Check if the user has a pending invitation
    const initialLength = task.pendingInvitations.length;
    task.pendingInvitations = task.pendingInvitations.filter(id => id.toString() !== req.user!._id.toString());
    
    if (task.pendingInvitations.length === initialLength) { 
        console.log('No pending invitation found');
        throw new Error("No pending invitation found."); 
    }
    
    console.log('Invitation found, rejecting...');
    await task.save();
    
    console.log('Invitation rejected');
    
    res.status(200).json({ 
        message: 'Invitation rejected.',
        success: true
    });
});

/**
 * @desc    Request to join a public task
 * @route   POST /api/tasks/:id/request-join
 * @access  Private
 */
export const requestJoinPublicTask = asyncHandler(async (req: Request, res: Response) => {
    const requesterId = req.user!._id;
    console.log(`User ${requesterId} joining public task ${req.params.id}`);
    
    // Find the task
    const task = await Task.findById(req.params.id);
    if (!task) { 
        console.log('Task not found');
        throw new Error('Task not found'); 
    }
    
    // Verify the task is public
    if (task.visibility !== 'public') { 
        console.log('Can only join public tasks');
        throw new Error('Can only join public tasks.'); 
    }
    
    // Check if user is already involved
    if (
        task.owner.toString() === requesterId.toString() || 
        task.collaborators.some(id => id.toString() === requesterId.toString())
    ) {
        console.log('User is already involved with this task');
        throw new Error('You are already involved with this task.');
    }
    
    console.log('Adding user directly as collaborator (no approval needed for public tasks)');
    
    // For public tasks, add the user directly as a collaborator (no approval needed)
    task.collaborators.push(requesterId);
    await task.save();
    
    console.log('Joined public task successfully');
    
    // Return the updated task
    const populatedTask = await Task.findById(task._id)
        .populate('owner', 'username')
        .populate('collaborators', 'username')
        .populate('pendingInvitations', 'username');
    
    res.status(200).json({ 
        message: 'You have joined this goal successfully.',
        task: populatedTask
    });
});

/**
 * @desc    Accept a collaboration request from a public task
 * @route   POST /api/tasks/:id/accept-collab
 * @access  Private
 */
export const acceptCollaborationRequest = asyncHandler(async (req: Request, res: Response) => {
    const { userIdToAccept } = req.body;
    console.log(`Owner ${req.user!._id} accepting collaboration request from user ${userIdToAccept} for task ${req.params.id}`);
    
    // Find the task
    const task = await Task.findById(req.params.id);
    const ownerId = req.user!._id;

    if (!task) { 
        console.log('Task not found');
        throw new Error('Task not found'); 
    }
    
    // Verify the current user is the owner
    if (task.owner.toString() !== ownerId.toString()) { 
        console.log('Not authorized to perform this action');
        throw new Error('Not authorized to perform this action.'); 
    }

    // Find the request
    const requestIndex = task.pendingInvitations.findIndex(reqId => reqId.toString() === userIdToAccept);
    if (requestIndex === -1) { 
        console.log('No pending request from this user');
        throw new Error('No pending request from this user.'); 
    }

    console.log('Request found, accepting...');
    
    // Remove from pending invitations and add to collaborators
    const userToMove = task.pendingInvitations.splice(requestIndex, 1)[0];
    task.collaborators.push(userToMove);

    await task.save();
    
    console.log('User added as collaborator');
    
    // Return the populated task
    const populatedTask = await Task.findById(task._id)
        .populate('owner', 'username')
        .populate('collaborators', 'username')
        .populate('pendingInvitations', 'username');
    
    res.status(200).json(populatedTask);
});

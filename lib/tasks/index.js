'use server'

import { prisma } from '../db'

/**
 * Get all tasks for a specific user or all tasks if no userId provided
 * Used by: Dashboard Page
 */
export async function getTaskUser(userId) {
  try {
    if (userId) {
      return await prisma.task.findMany({
        where: { userId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      })
    }
    // Return all tasks if no userId provided
    return await prisma.task.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching user tasks:', error)
    throw error
  }
}

/**
 * Get task summary/statistics
 * Used by: Tasks Overview Page
 */
export async function getTaskSummary() {
  try {
    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'pending' } }),
      prisma.task.count({ where: { status: 'in-progress' } }),
      prisma.task.count({ where: { status: 'completed' } }),
    ])

    return {
      total,
      pending,
      inProgress,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  } catch (error) {
    console.error('Error fetching task summary:', error)
    throw error
  }
}

/**
 * Get all tasks with optional filtering
 */
export async function getTasks(filters = {}) {
  try {
    const { status, priority, userId } = filters
    const where = {}

    if (status) where.status = status
    if (priority) where.priority = priority
    if (userId) where.userId = userId

    return await prisma.task.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id) {
  try {
    return await prisma.task.findUnique({
      where: { id },
      include: { user: true },
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    throw error
  }
}

/**
 * Create a new task
 */
export async function createTask(data) {
  try {
    const { title, description, userId, status = 'pending', priority = 'medium' } = data
    
    return await prisma.task.create({
      data: {
        title,
        description,
        userId,
        status,
        priority,
      },
      include: { user: true },
    })
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

/**
 * Update an existing task
 */
export async function updateTask(id, data) {
  try {
    return await prisma.task.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: { user: true },
    })
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

/**
 * Update task status only
 */
export async function updateTaskStatus(id, status) {
  try {
    return await prisma.task.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: { user: true },
    })
  } catch (error) {
    console.error('Error updating task status:', error)
    throw error
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id) {
  try {
    return await prisma.task.delete({
      where: { id },
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

/**
 * Get tasks grouped by status
 */
export async function getTasksByStatus(userId) {
  try {
    const where = userId ? { userId } : {}

    const [pending, inProgress, completed] = await Promise.all([
      prisma.task.findMany({
        where: { ...where, status: 'pending' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.findMany({
        where: { ...where, status: 'in-progress' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.findMany({
        where: { ...where, status: 'completed' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return {
      pending,
      inProgress,
      completed,
    }
  } catch (error) {
    console.error('Error fetching tasks by status:', error)
    throw error
  }
}

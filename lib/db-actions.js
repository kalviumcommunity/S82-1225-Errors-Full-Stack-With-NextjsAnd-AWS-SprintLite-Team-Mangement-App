'use server'

import { prisma } from './db'

export async function getUsers() {
  try {
    return await prisma.user.findMany({ include: { posts: true } })
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export async function createUser(email, name) {
  try {
    return await prisma.user.create({ data: { email, name } })
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function getPosts(published) {
  try {
    return await prisma.post.findMany({
      where: published !== undefined ? { published } : undefined,
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    throw error
  }
}

export async function createPost(title, content, authorId) {
  try {
    return await prisma.post.create({
      data: { title, content, authorId },
    })
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

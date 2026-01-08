// Load environment variables first
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

// Initialize Prisma with adapter like in lib/db.js
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned existing data\n');

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const mohit = await prisma.user.create({
    data: {
      email: 'mohit@sprintlite.com',
      name: 'Mohit Kumar Samal',
      password: hashedPassword,
      role: 'Owner',
      avatar: '#3B82F6', // Blue
    },
  });

  const sam = await prisma.user.create({
    data: {
      email: 'sam@sprintlite.com',
      name: 'Sam',
      password: hashedPassword,
      role: 'Admin',
      avatar: '#10B981', // Green
    },
  });

  const vijay = await prisma.user.create({
    data: {
      email: 'vijay@sprintlite.com',
      name: 'Vijay',
      password: hashedPassword,
      role: 'Member',
      avatar: '#F59E0B', // Orange
    },
  });

  console.log(`✅ Created 3 users\n`);

  // Create Tasks
  console.log('📋 Creating tasks...');
  
  const task1 = await prisma.task.create({
    data: {
      title: 'Setup Docker containers for development',
      description: 'Configure Docker Compose with Next.js, PostgreSQL, and Redis containers for local development environment.',
      status: 'Done',
      priority: 'High',
      dueDate: new Date('2026-01-08'),
      creatorId: mohit.id,
      assigneeId: sam.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement JWT authentication',
      description: 'Add JWT-based authentication with bcrypt password hashing and secure session management.',
      status: 'InProgress',
      priority: 'High',
      dueDate: new Date('2026-01-10'),
      creatorId: mohit.id,
      assigneeId: mohit.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Create API documentation',
      description: 'Document all REST API endpoints with request/response examples and error codes.',
      status: 'Todo',
      priority: 'Medium',
      dueDate: new Date('2026-01-12'),
      creatorId: sam.id,
      assigneeId: vijay.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Fix task filtering bug on dashboard',
      description: 'Tasks are not filtering correctly by status. Users report seeing all tasks regardless of selected filter.',
      status: 'InProgress',
      priority: 'High',
      dueDate: new Date('2026-01-09'),
      creatorId: vijay.id,
      assigneeId: sam.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Add Redis caching for session data',
      description: 'Implement Redis caching layer to improve session lookup performance and reduce database queries.',
      status: 'Todo',
      priority: 'Medium',
      dueDate: new Date('2026-01-15'),
      creatorId: mohit.id,
      assigneeId: sam.id,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'Update Prisma schema documentation',
      description: 'Add detailed comments and examples to Prisma schema file for better team understanding.',
      status: 'Done',
      priority: 'Low',
      dueDate: new Date('2026-01-07'),
      creatorId: vijay.id,
      assigneeId: vijay.id,
    },
  });

  console.log(`✅ Created 6 tasks\n`);

  // Create Comments
  console.log('💬 Creating comments...');
  
  await prisma.comment.create({
    data: {
      content: 'Docker containers are up and running successfully! All health checks passing.',
      taskId: task1.id,
      userId: sam.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Great work! Can you also add the docker-compose logs to the README?',
      taskId: task1.id,
      userId: mohit.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Working on JWT implementation. Using jsonwebtoken library with RS256 algorithm.',
      taskId: task2.id,
      userId: mohit.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Found the issue! The filter state wasn\'t being passed to the API query. Fixing now.',
      taskId: task4.id,
      userId: sam.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Documentation is looking good! Added schema diagrams and examples.',
      taskId: task6.id,
      userId: vijay.id,
    },
  });

  console.log(`✅ Created 5 comments\n`);

  // Create Sessions
  console.log('🔐 Creating sessions...');
  
  await prisma.session.create({
    data: {
      token: 'session_token_mohit_' + Date.now(),
      userId: mohit.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  await prisma.session.create({
    data: {
      token: 'session_token_sam_' + Date.now(),
      userId: sam.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  console.log(`✅ Created 2 sessions\n`);

  // Print summary
  console.log('\n📊 Seed Summary:');
  console.log('================');
  const userCount = await prisma.user.count();
  const taskCount = await prisma.task.count();
  const commentCount = await prisma.comment.count();
  const sessionCount = await prisma.session.count();
  
  console.log(`👥 Users: ${userCount}`);
  console.log(`📋 Tasks: ${taskCount}`);
  console.log(`💬 Comments: ${commentCount}`);
  console.log(`🔐 Sessions: ${sessionCount}`);
  
  console.log('\n✅ Database seeded successfully!');
  console.log('\n🔑 Test Login Credentials:');
  console.log('   Email: mohit@sprintlite.com');
  console.log('   Email: sam@sprintlite.com');
  console.log('   Email: vijay@sprintlite.com');
  console.log('   Password (all): password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

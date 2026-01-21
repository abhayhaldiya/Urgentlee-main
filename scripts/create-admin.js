#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('🔧 Creating new admin user...\n');

    const email = await question('Enter admin email: ');
    const name = await question('Enter admin name: ');
    const password = await question('Enter admin password (min 8 characters): ');
    
    // Validate inputs
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address');
    }
    
    if (!name || name.trim().length < 2) {
      throw new Error('Please provide a valid name (min 2 characters)');
    }
    
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log('\nYou can now login to the admin panel with these credentials.');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the script
createAdmin();
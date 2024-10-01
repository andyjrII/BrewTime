const readline = require('readline');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createAdmin() {
  try {
    rl.question('Enter username: ', async (username) => {
      rl.question('Enter email: ', async (email) => {
        rl.question('Enter password: ', async (password) => {
          const hashedPassword = await bcrypt.hash(password, 10);

          const newAdmin = await prisma.admin.create({
            data: {
              username,
              email,
              password: hashedPassword,
            },
          });

          console.log('Admin created:', newAdmin);
          rl.close();
          await prisma.$disconnect();
        });
      });
    });
  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();

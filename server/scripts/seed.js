import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Transaction } from "../models/Transaction.js";
import { ROLES } from "../constants/roles.js";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demo1234";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin1234";

async function ensureUser({ email, password, name, role }) {
  let user = await User.findOne({ email });
  if (!user) {
    const hashed = await bcrypt.hash(password, 12);
    user = await User.create({ name, email, password: hashed, role });
    console.log(`Created ${role}:`, email);
  } else {
    if (user.role !== role) {
      user.role = role;
      await user.save();
      console.log(`Updated role to ${role}:`, email);
    } else {
      console.log(`${role} already exists:`, email);
    }
  }
  return user;
}

async function seedTransactions(user) {
  const count = await Transaction.countDocuments({ user: user._id });
  if (count > 0) {
    console.log("Demo user already has transactions, skipping sample rows");
    return;
  }

  const now = new Date();
  const samples = [
    { amount: 5000, type: "income", category: "Salary", daysAgo: 30, description: "Monthly salary" },
    { amount: 120, type: "expense", category: "Food", daysAgo: 28, description: "Groceries" },
    { amount: 45, type: "expense", category: "Food", daysAgo: 25, description: "Lunch" },
    { amount: 200, type: "expense", category: "Travel", daysAgo: 22, description: "Fuel" },
    { amount: 89, type: "expense", category: "Shopping", daysAgo: 20, description: "Clothing" },
    { amount: 5000, type: "income", category: "Salary", daysAgo: 0, description: "Salary" },
    { amount: 60, type: "expense", category: "Food", daysAgo: 2, description: "Dinner" },
    { amount: 150, type: "expense", category: "Entertainment", daysAgo: 3, description: "Streaming" },
    { amount: 300, type: "expense", category: "Bills", daysAgo: 5, description: "Electricity" },
    { amount: 75, type: "expense", category: "Healthcare", daysAgo: 7, description: "Pharmacy" },
    { amount: 40, type: "expense", category: "Food", daysAgo: 10, description: "Coffee" },
    { amount: 500, type: "income", category: "Freelance", daysAgo: 12, description: "Side project" },
    { amount: 220, type: "expense", category: "Travel", daysAgo: 14, description: "Train tickets" },
  ];

  for (const s of samples) {
    const d = new Date(now);
    d.setDate(d.getDate() - s.daysAgo);
    await Transaction.create({
      user: user._id,
      amount: s.amount,
      type: s.type,
      category: s.category,
      date: d,
      description: s.description,
    });
  }
  console.log(`Inserted ${samples.length} sample transactions for demo user`);
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected for seed (database from MONGODB_URI)");

  const admin = await ensureUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: "Admin User",
    role: ROLES.ADMIN,
  });

  const demo = await ensureUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    name: "Demo User",
    role: ROLES.USER,
  });

  await seedTransactions(demo);

  console.log("\n--- Accounts (30-day SSO after login) ---");
  console.log("Admin:", ADMIN_EMAIL, "/", ADMIN_PASSWORD);
  console.log("User: ", DEMO_EMAIL, "/", DEMO_PASSWORD);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

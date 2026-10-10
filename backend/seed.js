// script for injecting dummy data into the database
// How to run: `node seed.js`
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Headset = require("./models/Headset");
const Loan = require("./models/Loan");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    // Xoá dữ liệu cũ
    await User.deleteMany();
    await Headset.deleteMany();
    await Loan.deleteMany();

    console.log("Cleared existing data.");

    // Tạo Users (10 Students + 2 Technicians)
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const user = await User.create({
        name: `Student ${i}`,
        email: `student${i}@qut.edu.au`,
        password: "password123",
        role: "student",
      });
      users.push(user);
    }
    await User.create({
      name: "Ha Technician",
      email: "ha.tech@qut.edu.au",
      password: "password123",
      role: "technician",
    });
    await User.create({
      name: "Duy Admin",
      email: "duy.admin@qut.edu.au",
      password: "password123",
      role: "admin",
    });

    // Tạo 10 Headsets
    const headsets = [];
    for (let i = 1; i <= 10; i++) {
      const statusOptions = [
        "Available",
        "Available",
        "Maintenance",
        "Retired",
        "Available",
      ];
      const status = statusOptions[i % statusOptions.length];
      const headset = await Headset.create({
        assetTag: `XR-00${i}`,
        model: i % 2 === 0 ? "Meta Quest 3" : "Apple Vision Pro",
        status: status,
        notes: status === "Maintenance" ? "Requires lens replacement" : "",
      });
      headsets.push(headset);
    }

    // Tạo 10 Loans
    const statuses = [
      "Pending",
      "Approved",
      "Rejected",
      "Cancelled",
      "Collected",
      "Returned",
    ];
    for (let i = 0; i < 10; i++) {
      await Loan.create({
        student: users[i]._id,
        headset: headsets[i]._id,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        status: statuses[i % statuses.length],
        purpose: `IFN636 Assignment testing ${i + 1}`,
      });
    }

    console.log(
      "✅ 10 Users, 10 Headsets, and 10 Loans have been seeded successfully!",
    );
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

connectDB();

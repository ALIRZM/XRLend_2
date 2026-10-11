const User = require("../models/User");
const UserAccountFacade = require("../utils/UserAccountFacade");

const accounts = new UserAccountFacade();
const LISTED_ROLES = ["student", "technician"];

const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    if (role && !LISTED_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be student or technician" });
    }

    const users = await User.find({ role: role || { $ne: "admin" } }) // if there is role, query role, otherwise get all except admin
      .select("name email role")
      .sort({ role: -1, name: 1 })
      .lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Admin accounts cannot be created here, and a missing or unknown role is refused
    if (!LISTED_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be student or technician" });
    }

    // check duplicate email
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    await accounts.deleteAccount(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    // The facade attaches a status to the errors it expects (404, 403, 409)
    res.status(error.status || 500).json({ message: error.message });
  }
};
module.exports = { getUsers, createUser, deleteUser };

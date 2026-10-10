const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    if (role && !["student", "technician"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be student or technician" });
    }

    const users = await User.find({ role: role || { $ne: "admin" } }) // if there is role, query role, otherwise get all except admin
      .select("name email role")
      .sort({ name: 1, email: 1 })
      .lean();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getUsers };

/**
 * OOP Principle: Encapsulation - the steps of deleting an account are private methods.
 * Callers can only use deleteAccount, so no step can be run on its own or in the wrong order.
 * Design Pattern: Facade Pattern - deleteAccount is one simple call that hides the checks
 * and the clean-up behind it.
 */
const mongoose = require("mongoose");
const User = require("../models/User");

// An error that carries the HTTP status the controller should answer with
const fail = (status, message) => Object.assign(new Error(message), { status });

class UserAccountFacade {
  // Deletes a student or technician. Admin accounts are never deleted.
  async deleteAccount(userId) {
    const user = mongoose.isValidObjectId(userId)
      ? await User.findById(userId)
      : null;
    if (!user) throw fail(404, "That user does not exist");

    await this.#assertCanDelete(user);
    await this.#deleteLoans(user);
    await user.deleteOne();
  }

  // Admin accounts are protected, and a headset that is still out must come back first
  async #assertCanDelete(user) {
    if (user.role === "admin")
      throw fail(403, "Admin accounts cannot be deleted");

    const headsetOut = await Loan.exists({
      student: user._id,
      status: "Collected",
    });
    if (headsetOut)
      throw fail(409, "This student has not returned a headset yet");
  }

  // delete any loans belonging to the deleted student account
  async #deleteLoans(user) {
    await Loan.deleteMany({ student: user._id });
  }
}

module.exports = UserAccountFacade;

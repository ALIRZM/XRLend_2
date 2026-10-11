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

    this.#assertCanDelete(user);
    await user.deleteOne();
  }

  // Admin accounts are protected
  #assertCanDelete(user) {
    if (user.role === "admin")
      throw fail(403, "Admin accounts cannot be deleted");
  }
}

module.exports = UserAccountFacade;

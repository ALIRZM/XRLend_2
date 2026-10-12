const chai = require("chai");
const sinon = require("sinon");
const User = require("../models/User");
const Loan = require("../models/Loan");
const {
  getUsers,
  createUser,
  deleteUser,
} = require("../controllers/userController");
const { expect } = chai;
const UserAccountFacade = require("../utils/UserAccountFacade");
const mongoose = require("mongoose");

// GET USER
describe("GetUsers Function Test", () => {
  let req, res, chain;

  const users = [
    {
      _id: "u1",
      name: "Ha Technician",
      email: "ha.tech@qut.edu.au",
      role: "technician",
    },
    {
      _id: "u2",
      name: "Student 1",
      email: "student1@qut.edu.au",
      role: "student",
    },
  ];

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    chain = {
      select: sinon.stub().returnsThis(),
      sort: sinon.stub().returnsThis(),
      lean: sinon.stub().resolves(users), // enforce mongodb to return mock data
    };
    sinon.stub(User, "find").returns(chain);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return all users except admins", async () => {
    await getUsers(req, res);

    expect(User.find.calledOnceWith({ role: { $ne: "admin" } })).to.be.true;
    expect(res.json.calledWith(users)).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it("should only select name, email and role. No password is sent", async () => {
    await getUsers(req, res);

    expect(chain.select.calledOnceWith("name email role")).to.be.true;
  });

  it("should return an empty list when there are no users", async () => {
    chain.lean.resolves([]); // enforce mongodb to return empty list

    await getUsers(req, res);

    expect(res.json.calledWith([])).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it("should sort users by role (technician first, student later), then by name", async () => {
    await getUsers(req, res);

    expect(chain.sort.calledOnceWith({ role: -1, name: 1 })).to.be.true;
  });

  it("should only return students when the query role is student", async () => {
    req.query.role = "student";

    await getUsers(req, res);

    expect(User.find.calledOnceWith({ role: "student" })).to.be.true;
  });

  it("should only return technicians when the query role is technician", async () => {
    req.query.role = "technician";

    await getUsers(req, res);

    expect(User.find.calledOnceWith({ role: "technician" })).to.be.true;
  });

  it("should return 400 when the query role is admin", async () => {
    req.query.role = "admin";

    await getUsers(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(
      res.json.calledWith({ message: "Role must be student or technician" }),
    ).to.be.true;
    expect(User.find.called).to.be.false;
  });

  it("should return 500 if an error occurs (e.g. DB errors)", async () => {
    chain.lean.rejects(new Error("DB Error"));

    await getUsers(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "DB Error" })).to.be.true;
  });
});

// CREATE USER
describe("CreateUser Function Test", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "New Student",
        email: "new.student@qut.edu.au",
        password: "password123",
        role: "student",
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create a student and return the details without a password or token", async () => {
    sinon.stub(User, "findOne").resolves(null);
    const createStub = sinon.stub(User, "create").resolves({
      id: "u1",
      name: "New Student",
      email: "new.student@qut.edu.au",
      role: "student",
      password: "hashed",
    });

    await createUser(req, res);

    expect(
      createStub.calledOnceWith({
        name: "New Student",
        email: "new.student@qut.edu.au",
        password: "password123",
        role: "student",
      }),
    ).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(
      res.json.calledWith({
        id: "u1",
        name: "New Student",
        email: "new.student@qut.edu.au",
        role: "student",
      }),
    ).to.be.true;
  });

  it("should return 400 and create nothing when the role is admin", async () => {
    req.body.role = "admin";
    const findStub = sinon.stub(User, "findOne");
    const createStub = sinon.stub(User, "create");

    await createUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(
      res.json.calledWith({ message: "Role must be student or technician" }),
    ).to.be.true;
    expect(findStub.called).to.be.false;
    expect(createStub.called).to.be.false;
  });

  it("should return 400 when the email is already used", async () => {
    sinon.stub(User, "findOne").resolves({ _id: "u9" });
    const createStub = sinon.stub(User, "create");

    await createUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ message: "User already exists" })).to.be.true;
    expect(createStub.called).to.be.false;
  });

  it("should return 500 if an error occurs (e.g. DB Error)", async () => {
    sinon.stub(User, "findOne").resolves(null);
    sinon.stub(User, "create").rejects(new Error("DB Error"));

    await createUser(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "DB Error" })).to.be.true;
  });
});

// DELETE USER
describe("DeleteUser Function Test", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should delete the account and return a message", async () => {
    const deleteStub = sinon
      .stub(UserAccountFacade.prototype, "deleteAccount")
      .resolves();

    await deleteUser(req, res);

    expect(deleteStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.json.calledWith({ message: "User deleted" })).to.be.true;
    expect(res.status.called).to.be.false;
  });

  it("should answer with the status of the error the facade throws", async () => {
    const notFound = Object.assign(new Error("That user does not exist"), {
      status: 404,
    });
    sinon.stub(UserAccountFacade.prototype, "deleteAccount").rejects(notFound);

    await deleteUser(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: "That user does not exist" })).to.be
      .true;
  });

  it("should return 500 if an unexpected error occurs", async () => {
    sinon
      .stub(UserAccountFacade.prototype, "deleteAccount")
      .rejects(new Error("DB Error"));

    await deleteUser(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "DB Error" })).to.be.true;
  });
});

describe("UserAccountFacade deleteAccount Test", () => {
  const facade = new UserAccountFacade();
  const id = new mongoose.Types.ObjectId().toString();
  let user, existsStub, deleteLoansStub;

  // Runs deleteAccount and hands back the error it threw, or undefined if it worked
  const attempt = async (userId = id) => {
    try {
      await facade.deleteAccount(userId);
    } catch (error) {
      return error;
    }
  };

  beforeEach(() => {
    user = {
      _id: new mongoose.Types.ObjectId(),
      role: "student",
      deleteOne: sinon.stub().resolves(),
    };
    sinon.stub(User, "findById").resolves(user);
    existsStub = sinon.stub(Loan, "exists").resolves(null);
    deleteLoansStub = sinon.stub(Loan, "deleteMany").resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should delete a student and their loans", async () => {
    const error = await attempt();

    expect(error).to.be.undefined;
    expect(deleteLoansStub.calledOnceWith({ student: user._id })).to.be.true;
    expect(user.deleteOne.calledOnce).to.be.true;
  });

  it("should delete a technician", async () => {
    user.role = "technician";

    const error = await attempt();

    expect(error).to.be.undefined;
    expect(user.deleteOne.calledOnce).to.be.true;
  });

  it("should return 404 when the user does not exist", async () => {
    User.findById.resolves(null);

    const error = await attempt();

    expect(error.status).to.equal(404);
    expect(user.deleteOne.called).to.be.false;
  });

  it("should refuse to delete an admin with 403", async () => {
    user.role = "admin";

    const error = await attempt();

    expect(error.status).to.equal(403);
    expect(deleteLoansStub.called).to.be.false;
    expect(user.deleteOne.called).to.be.false;
  });

  it("should refuse with 409 while the student still has a headset out", async () => {
    existsStub.resolves({ _id: new mongoose.Types.ObjectId() });

    const error = await attempt();

    expect(error.status).to.equal(409);
    expect(
      existsStub.calledOnceWith({ student: user._id, status: "Collected" }),
    ).to.be.true;
    expect(deleteLoansStub.called).to.be.false;
    expect(user.deleteOne.called).to.be.false;
  });
});

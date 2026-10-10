const chai = require("chai");
const sinon = require("sinon");
const User = require("../models/User");
const { getUsers, createUser } = require("../controllers/userController");
const { expect } = chai;

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

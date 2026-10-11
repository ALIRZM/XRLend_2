const chai = require('chai');
const sinon = require('sinon');

const Headset = require('../models/Headset');
const Loan = require('../models/Loan');
const { updateHeadset } = require('../controllers/headsetController');

const { expect } = chai;

// User Story 13 / XRH-86
describe('XRH-82 Edit a Headset - updateHeadset', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should update a headset successfully', async () => {
    const mockHeadset = {
      _id: 'headset123',
      model: 'Quest 2',
      status: 'Available',
      notes: 'Old notes',
      save: sinon.stub().resolves()
    };

    sinon.stub(Headset, 'findById').resolves(mockHeadset);
    sinon.stub(Loan, 'findOne').resolves(null);

    const req = {
      params: { id: 'headset123' },
      body: {
        model: 'Quest 3',
        status: 'Maintenance',
        notes: 'Updated notes'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateHeadset(req, res);

    expect(mockHeadset.model).to.equal('Quest 3');
    expect(mockHeadset.notes).to.equal('Updated notes');
    expect(mockHeadset.save.calledOnce).to.be.true;
    expect(res.json.calledOnceWith(mockHeadset)).to.be.true;
  });

  it('should return 400 if model or status is missing', async () => {
    const req = {
      params: { id: 'headset123' },
      body: {
        model: '',
        status: '',
        notes: 'test'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateHeadset(req, res);

    expect(res.status.calledOnceWith(400)).to.be.true;
    expect(
      res.json.calledOnceWith({
        message: 'Model and status are required'
      })
    ).to.be.true;
  });

  it('should return 400 for an invalid status', async () => {
    const req = {
      params: { id: 'headset123' },
      body: {
        model: 'Quest 3',
        status: 'Broken',
        notes: 'test'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateHeadset(req, res);

    expect(res.status.calledOnceWith(400)).to.be.true;
    expect(
      res.json.calledOnceWith({ message: 'Invalid headset status' })
    ).to.be.true;
  });

  it('should return 404 if headset does not exist', async () => {
    sinon.stub(Headset, 'findById').resolves(null);

    const req = {
      params: { id: 'headset123' },
      body: {
        model: 'Quest 3',
        status: 'Available',
        notes: 'test'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateHeadset(req, res);

    expect(res.status.calledOnceWith(404)).to.be.true;
    expect(
      res.json.calledOnceWith({ message: 'Headset not found' })
    ).to.be.true;
  });
});
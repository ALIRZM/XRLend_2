const chai = require('chai');
const sinon = require('sinon');

const Headset = require('../models/Headset');
const { deleteHeadset } = require('../controllers/headsetController');

const { expect } = chai;

// User Story 12 / XRH-74
describe('XRH-70 Delete a Headset - deleteHeadset', () => {

  it('should delete a headset successfully', async () => {
    const mockHeadset = {
      _id: 'headset123',
      deleteOne: sinon.stub().resolves()
    };

    const findByIdStub = sinon
      .stub(Headset, 'findById')
      .resolves(mockHeadset);

    const req = {
      params: { id: 'headset123' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteHeadset(req, res);

    expect(findByIdStub.calledOnceWith('headset123')).to.be.true;
    expect(mockHeadset.deleteOne.calledOnce).to.be.true;
    expect(
      res.json.calledOnceWith({ message: 'Headset deleted successfully' })
    ).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if headset does not exist', async () => {
    const findByIdStub = sinon
      .stub(Headset, 'findById')
      .resolves(null);

    const req = {
      params: { id: 'headset123' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteHeadset(req, res);

    expect(findByIdStub.calledOnceWith('headset123')).to.be.true;
    expect(res.status.calledOnceWith(404)).to.be.true;
    expect(
      res.json.calledOnceWith({ message: 'Headset not found' })
    ).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 if a database error occurs', async () => {
    const findByIdStub = sinon
      .stub(Headset, 'findById')
      .rejects(new Error('DB Error'));

    const req = {
      params: { id: 'headset123' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteHeadset(req, res);

    expect(res.status.calledOnceWith(500)).to.be.true;
    expect(
      res.json.calledWithMatch({ message: 'DB Error' })
    ).to.be.true;

    findByIdStub.restore();
  });
});
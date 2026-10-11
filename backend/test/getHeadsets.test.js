const chai = require('chai');
const sinon = require('sinon');

const Headset = require('../models/Headset');
const Loan = require('../models/Loan');
const { getHeadsets } = require('../controllers/headsetController');

const { expect } = chai;

// User Story 11 / XRH-69
describe('XRH-65 View All Headsets - getHeadsets', () => {
  it('should retrieve headsets successfully', async () => {
    const mockHeadsets = [
      {
        _id: '1',
        assetTag: 'H001',
        model: 'Quest 2',
        status: 'Available'
      },
      {
        _id: '2',
        assetTag: 'H002',
        model: 'Quest 3',
        status: 'Maintenance'
      }
    ];

    const mockLoans = [
      {
        headset: '1',
        status: 'Approved'
      }
    ];

    const leanHeadsets = sinon.stub().resolves(mockHeadsets);
    const sortStub = sinon.stub().returns({ lean: leanHeadsets });

    const headsetFindStub = sinon
      .stub(Headset, 'find')
      .returns({ sort: sortStub });

    const loanFindStub = sinon
      .stub(Loan, 'find')
      .returns({
        lean: sinon.stub().resolves(mockLoans)
      });

    const req = {
      query: {}
    };

    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    await getHeadsets(req, res);

    expect(headsetFindStub.calledOnce).to.be.true;
    expect(loanFindStub.calledOnce).to.be.true;
    expect(res.json.calledOnce).to.be.true;

    const result = res.json.firstCall.args[0];

    expect(result).to.have.lengthOf(2);
    expect(result[0].hasActiveLoan).to.equal(true);
    expect(result[1].hasActiveLoan).to.equal(false);

    headsetFindStub.restore();
    loanFindStub.restore();
  });
  
  it('should return 500 if retrieving headsets fails', async () => {
    const headsetFindStub = sinon
      .stub(Headset, 'find')
      .throws(new Error('DB Error'));

    const req = {
      query: {}
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await getHeadsets(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(
      res.json.calledWithMatch({ message: 'DB Error' })
    ).to.be.true;

    headsetFindStub.restore();
  });
});
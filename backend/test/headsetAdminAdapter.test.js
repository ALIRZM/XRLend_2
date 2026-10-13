const { expect } = require('chai');
const HeadsetAdminAdapter = require('../utils/HeadsetAdminAdapter');

describe('XRH-95 HeadsetAdminAdapter', () => {
  it('should mark a headset with an active loan', () => {
    const headsets = [
      {
        _id: 'headset1',
        assetTag: 'H001',
        model: 'Quest 2',
        status: 'Available',
      },
    ];

    const activeLoans = [
      {
        headset: 'headset1',
        status: 'Approved',
      },
    ];

    const result = HeadsetAdminAdapter.adaptMany(headsets, activeLoans);

    expect(result[0].hasActiveLoan).to.equal(true);
  });

  it('should mark a headset without an active loan as false', () => {
    const headsets = [
      {
        _id: 'headset2',
        assetTag: 'H002',
        model: 'Quest 3',
        status: 'Maintenance',
      },
    ];

    const result = HeadsetAdminAdapter.adaptMany(headsets, []);

    expect(result[0].hasActiveLoan).to.equal(false);
  });

  it('should adapt multiple headsets correctly', () => {
    const headsets = [
      { _id: 'headset1', assetTag: 'H001' },
      { _id: 'headset2', assetTag: 'H002' },
    ];

    const activeLoans = [{ headset: 'headset1' }];

    const result = HeadsetAdminAdapter.adaptMany(headsets, activeLoans);

    expect(result[0].hasActiveLoan).to.equal(true);
    expect(result[1].hasActiveLoan).to.equal(false);
  });

  it('should not modify the original headset objects', () => {
    const headsets = [{ _id: 'headset1', assetTag: 'H001' }];

    HeadsetAdminAdapter.adaptMany(headsets, []);

    expect(headsets[0]).not.to.have.property('hasActiveLoan');
  });
});
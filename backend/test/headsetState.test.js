const { expect } = require('chai');
const { HeadsetContext } = require('../utils/HeadsetState');

describe('HeadsetState Pattern Logic (OOP Encapsulation)', () => {
    it('should transition from Available to Maintenance when there is no active loan', () => {
        const headset = { status: 'Available' };
        const activeLoan = null;

        const context = new HeadsetContext(headset, activeLoan);
        context.requestStatusChange('Maintenance');

        expect(headset.status).to.equal('Maintenance');
    });

    it('should throw an error when transitioning from Available to Maintenance with an active loan', () => {
        const headset = { status: 'Available' };
        const activeLoan = { _id: 'loan123', status: 'Approved' };

        const context = new HeadsetContext(headset, activeLoan);
        
        expect(() => context.requestStatusChange('Maintenance'))
            .to.throw("Cannot set to Maintenance while the headset is actively on loan.");
        expect(headset.status).to.equal('Available'); // Status must remain unchanged
    });

    it('should transition from Maintenance to Available', () => {
        const headset = { status: 'Maintenance' };
        const activeLoan = null;

        const context = new HeadsetContext(headset, activeLoan);
        context.requestStatusChange('Available');

        expect(headset.status).to.equal('Available');
    });

    it('should transition to Retired from Available or Maintenance', () => {
        const headset1 = { status: 'Available' };
        const context1 = new HeadsetContext(headset1, null);
        context1.requestStatusChange('Retired');
        expect(headset1.status).to.equal('Retired');

        const headset2 = { status: 'Maintenance' };
        const context2 = new HeadsetContext(headset2, null);
        context2.requestStatusChange('Retired');
        expect(headset2.status).to.equal('Retired');
    });

    it('should not allow transition from Retired to any other state', () => {
        const headset = { status: 'Retired' };
        const context = new HeadsetContext(headset, null);
        
        expect(() => context.requestStatusChange('Available'))
            .to.throw("Retired headset status cannot be changed.");
    });
});

const { expect } = require('chai');
const sinon = require('sinon');
const Headset = require('../models/Headset');
const { updateNotes } = require('../controllers/headsetController');

describe('Headset Controller - updateNotes (Mocking Database)', () => {
    let req, res, findByIdStub;

    beforeEach(() => {
        // Setup mock req and res objects for Express
        req = {
            params: { id: 'headset123' },
            body: { notes: 'Screen has a minor scratch' }
        };
        res = {
            status: sinon.stub().returnsThis(), // allows chaining like res.status().json()
            json: sinon.stub()
        };
    });

    afterEach(() => {
        // Restore Sinon stubs after each test to ensure a clean state
        sinon.restore();
    });

    it('should update and save notes successfully when headset is found', async () => {
        // Mock the headset object that Mongoose would return
        const mockHeadset = {
            _id: 'headset123',
            notes: 'Old notes',
            save: sinon.stub().resolves() // Mock the save() method as an async function
        };

        // Stub Headset.findById to intercept DB call and return our mock object
        findByIdStub = sinon.stub(Headset, 'findById').resolves(mockHeadset);

        // Call the controller function directly
        await updateNotes(req, res);

        // Assertions to ensure logic was executed correctly
        expect(findByIdStub.calledOnceWith('headset123')).to.be.true;
        expect(mockHeadset.notes).to.equal('Screen has a minor scratch'); // Verifies notes were assigned
        expect(mockHeadset.save.calledOnce).to.be.true;                   // Verifies save was called
        expect(res.json.calledOnceWith(mockHeadset)).to.be.true;          // Verifies response
    });

    it('should return 404 if headset does not exist in the database', async () => {
        // Intercept DB call to simulate Headset not found (returns null)
        findByIdStub = sinon.stub(Headset, 'findById').resolves(null);

        await updateNotes(req, res);

        expect(findByIdStub.calledOnceWith('headset123')).to.be.true;
        expect(res.status.calledOnceWith(404)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Headset not found' })).to.be.true;
    });

    it('should return 500 if a database error occurs', async () => {
        // Intercept DB call to simulate an unexpected error (e.g., lost connection)
        const error = new Error('Database connection lost');
        findByIdStub = sinon.stub(Headset, 'findById').rejects(error);

        await updateNotes(req, res);

        expect(res.status.calledOnceWith(500)).to.be.true;
        expect(res.json.calledOnceWith({ message: error.message })).to.be.true;
    });
});

const { expect } = require('chai');
const sinon = require('sinon');
const Headset = require('../models/Headset');
const { updateNotes } = require('../controllers/headsetController');

describe('Headset Controller - updateNotes (Mocking Database)', () => {
    let req, res, findByIdStub;

    beforeEach(() => {
       
        req = {
            params: { id: 'headset123' },
            body: { notes: 'Screen has a minor scratch' }
        };
        res = {
            status: sinon.stub().returnsThis(), 
            json: sinon.stub()
        };
    });

    afterEach(() => {
        
        sinon.restore();
    });

    it('should update and save notes successfully when headset is found', async () => {
       
        const mockHeadset = {
            _id: 'headset123',
            notes: 'Old notes',
            save: sinon.stub().resolves() 
        };

        
        findByIdStub = sinon.stub(Headset, 'findById').resolves(mockHeadset);

      
        await updateNotes(req, res);

 
        expect(findByIdStub.calledOnceWith('headset123')).to.be.true;
        expect(mockHeadset.notes).to.equal('Screen has a minor scratch'); 
        expect(mockHeadset.save.calledOnce).to.be.true;                   
        expect(res.json.calledOnceWith(mockHeadset)).to.be.true;          
    });

    it('should return 404 if headset does not exist in the database', async () => {

        findByIdStub = sinon.stub(Headset, 'findById').resolves(null);

        await updateNotes(req, res);

        expect(findByIdStub.calledOnceWith('headset123')).to.be.true;
        expect(res.status.calledOnceWith(404)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Headset not found' })).to.be.true;
    });

    it('should return 500 if a database error occurs', async () => {

        const error = new Error('Database connection lost');
        findByIdStub = sinon.stub(Headset, 'findById').rejects(error);

        await updateNotes(req, res);

        expect(res.status.calledOnceWith(500)).to.be.true;
        expect(res.json.calledOnceWith({ message: error.message })).to.be.true;
    });
});

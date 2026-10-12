const { expect } = require('chai');
const sinon = require('sinon');
const User = require('../models/User');
const { updateUserProfile } = require('../controllers/authController');

// XRH-49 user story 8: edit My Profile Details
describe('XRH-49 Edit my profile - updateUserProfile', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = {
            user: { id: 'user123' },
            body: { name: 'Ali Updated', email: 'ali.updated@qut.edu.au' },
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
      
        mockUser = {
            _id: 'user123',
            id: 'user123',
            name: 'Ali',
            email: 'ali@qut.edu.au',
            role: 'student',
        };
        mockUser.save = sinon.stub().resolves(mockUser);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should save the new name and email and return 200', async () => {
        sinon.stub(User, 'findById').resolves(mockUser);
        sinon.stub(User, 'findOne').resolves(null);

        await updateUserProfile(req, res);

        expect(mockUser.name).to.equal('Ali Updated');
        expect(mockUser.email).to.equal('ali.updated@qut.edu.au');
        expect(mockUser.save.calledOnce).to.be.true;
        expect(res.status.calledOnceWith(200)).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            id: 'user123',
            name: 'Ali Updated',
            email: 'ali.updated@qut.edu.au',
            role: 'student',
        });
    });

    it('should return 400 when the name is empty', async () => {
        const findStub = sinon.stub(User, 'findById');
        req.body.name = '   ';

        await updateUserProfile(req, res);

        expect(res.status.calledOnceWith(400)).to.be.true;
        expect(res.json.firstCall.args[0].errors).to.have.property('name');
        expect(findStub.called).to.be.false; 
    });

    it('should return 400 when the email format is wrong', async () => {
        const findStub = sinon.stub(User, 'findById');
        req.body.email = 'not-an-email';

        await updateUserProfile(req, res);

        expect(res.status.calledOnceWith(400)).to.be.true;
        expect(res.json.firstCall.args[0].errors).to.have.property('email');
        expect(findStub.called).to.be.false;
    });

    it('should return 409 when another user already has that email', async () => {
        sinon.stub(User, 'findById').resolves(mockUser);
        const findOneStub = sinon.stub(User, 'findOne').resolves({ _id: 'someoneElse' });

        await updateUserProfile(req, res);

   
        expect(findOneStub.calledOnceWith({ email: 'ali.updated@qut.edu.au', _id: { $ne: 'user123' } })).to.be.true;
        expect(res.status.calledOnceWith(409)).to.be.true;
        expect(res.json.firstCall.args[0].message).to.equal('That email is already used by another account');
        expect(mockUser.email).to.equal('ali@qut.edu.au');
        expect(mockUser.save.called).to.be.false;
    });

    it('should not change the role, even when role is sent in the body', async () => {
        sinon.stub(User, 'findById').resolves(mockUser);
        sinon.stub(User, 'findOne').resolves(null);
        req.body.role = 'technician';

        await updateUserProfile(req, res);

        expect(mockUser.role).to.equal('student');
        expect(res.json.firstCall.args[0].role).to.equal('student');
    });

    it('should return 404 when the user is not in the database', async () => {
        sinon.stub(User, 'findById').resolves(null);

        await updateUserProfile(req, res);

        expect(res.status.calledOnceWith(404)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'User not found' })).to.be.true;
    });

    it('should return 500 when the database fails', async () => {
        sinon.stub(User, 'findById').rejects(new Error('Database connection lost'));

        await updateUserProfile(req, res);

        expect(res.status.calledOnceWith(500)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Database connection lost' })).to.be.true;
    });
});
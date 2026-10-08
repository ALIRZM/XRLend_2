const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { changePassword } = require('../controllers/authController');

// XRH-50 User Story 9: Change My Password
describe('XRH-50 Change my password - changePassword', () => {
    let req, res, mockUser;

    beforeEach(() => {
        req = {
            user: { id: 'user123' },
            body: {
                currentPassword: 'password123',
                newPassword: 'newpassword456',
                confirmPassword: 'newpassword456',
            },
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        // The user document Mongoose would return
        mockUser = {
            _id: 'user123',
            password: 'old-hashed-password',
            save: sinon.stub().resolves(),
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should change the password and return 200 when everything is right', async () => {
        sinon.stub(User, 'findById').resolves(mockUser);
        const compareStub = sinon.stub(bcrypt, 'compare').resolves(true);

        await changePassword(req, res);

        expect(compareStub.calledOnceWith('password123', 'old-hashed-password')).to.be.true;
        expect(mockUser.password).to.equal('newpassword456'); // hashed by the model on save
        expect(mockUser.save.calledOnce).to.be.true;
        expect(res.status.calledOnceWith(200)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Password changed' })).to.be.true;
    });

    it('should return 401 and change nothing when the old password is wrong', async () => {
        sinon.stub(User, 'findById').resolves(mockUser);
        sinon.stub(bcrypt, 'compare').resolves(false);

        await changePassword(req, res);

        expect(res.status.calledOnceWith(401)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Your old password is not right' })).to.be.true;
        expect(mockUser.password).to.equal('old-hashed-password');
        expect(mockUser.save.called).to.be.false;
    });

    it('should return 400 when the new password is shorter than 8 characters', async () => {
        const findStub = sinon.stub(User, 'findById');
        req.body.newPassword = 'short';
        req.body.confirmPassword = 'short';

        await changePassword(req, res);

        expect(res.status.calledOnceWith(400)).to.be.true;
        expect(res.json.firstCall.args[0].errors).to.have.property('newPassword');
        expect(findStub.called).to.be.false; // stopped before touching the database
    });

    it('should return 400 when the new password and repeat password are different', async () => {
        const findStub = sinon.stub(User, 'findById');
        req.body.confirmPassword = 'somethingelse789';

        await changePassword(req, res);

        expect(res.status.calledOnceWith(400)).to.be.true;
        expect(res.json.firstCall.args[0].errors).to.have.property('confirmPassword');
        expect(findStub.called).to.be.false;
    });

    it('should return 400 when the old password is missing', async () => {
        sinon.stub(User, 'findById');
        delete req.body.currentPassword;

        await changePassword(req, res);

        expect(res.status.calledOnceWith(400)).to.be.true;
        expect(res.json.firstCall.args[0].errors).to.have.property('currentPassword');
    });

    it('should return 404 when the user is not in the database', async () => {
        sinon.stub(User, 'findById').resolves(null);

        await changePassword(req, res);

        expect(res.status.calledOnceWith(404)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'User not found' })).to.be.true;
    });

    it('should return 500 when the database fails', async () => {
        sinon.stub(User, 'findById').rejects(new Error('Database connection lost'));

        await changePassword(req, res);

        expect(res.status.calledOnceWith(500)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Database connection lost' })).to.be.true;
    });
});
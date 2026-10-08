const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// gets a 401
describe('XRH-48 Auth middleware - protect', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    
    const stubUserLookup = (user) =>
        sinon.stub(User, 'findById').returns({ select: sinon.stub().resolves(user) });

    it('should return 401 when there is no token', async () => {
        await protect(req, res, next);

        expect(res.status.calledOnceWith(401)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Not authorized, no token' })).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should return 401 when the token is not valid', async () => {
        req.headers.authorization = 'Bearer not-a-real-token';
        sinon.stub(jwt, 'verify').throws(new Error('jwt malformed'));

        await protect(req, res, next);

        expect(res.status.calledOnceWith(401)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Not authorized, token failed' })).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should return 401 when the user of the token no longer exists', async () => {
        req.headers.authorization = 'Bearer good-token';
        sinon.stub(jwt, 'verify').returns({ id: 'user123' });
        stubUserLookup(null);

        await protect(req, res, next);

        expect(res.status.calledOnceWith(401)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Not authorized, user not found' })).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should put the user on the request and continue when the token is valid', async () => {
        const user = { id: 'user123', name: 'Student One', role: 'student' };
        req.headers.authorization = 'Bearer good-token';
        sinon.stub(jwt, 'verify').returns({ id: 'user123' });
        stubUserLookup(user);

        await protect(req, res, next);

        expect(req.user).to.equal(user);
        expect(next.calledOnce).to.be.true;
        expect(res.status.called).to.be.false;
    });
});
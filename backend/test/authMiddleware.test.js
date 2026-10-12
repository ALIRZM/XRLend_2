const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');
const { protect } = require('../middleware/authMiddleware');


describe('XRH-48 / XRH-51 Auth middleware - protect', () => {
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
        sinon.stub(jwt, 'verify').returns({ id: 'user123', exp: 1900000000 });
        sinon.stub(RevokedToken, 'isRevoked').resolves(false);
        stubUserLookup(null);

        await protect(req, res, next);

        expect(res.status.calledOnceWith(401)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Not authorized, user not found' })).to.be.true;
        expect(next.called).to.be.false;
    });

    it('should put the user on the request and continue when the token is valid', async () => {
        const user = { id: 'user123', name: 'Student One', role: 'student' };
        req.headers.authorization = 'Bearer good-token';
        sinon.stub(jwt, 'verify').returns({ id: 'user123', exp: 1900000000 });
        sinon.stub(RevokedToken, 'isRevoked').resolves(false);
        stubUserLookup(user);

        await protect(req, res, next);

        expect(req.user).to.equal(user);
        expect(next.calledOnce).to.be.true;
        expect(res.status.called).to.be.false;
    });

    it('should return 401 when the token has been logged out (XRH-51)', async () => {
        req.headers.authorization = 'Bearer logged-out-token';
        sinon.stub(jwt, 'verify').returns({ id: 'user123', exp: 1900000000 });
        const revokedStub = sinon.stub(RevokedToken, 'isRevoked').resolves(true);
        const findStub = stubUserLookup({ id: 'user123' });

        await protect(req, res, next);

        expect(revokedStub.calledOnceWith('logged-out-token')).to.be.true;
        expect(res.status.calledOnceWith(401)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Not authorized, this session was logged out' })).to.be.true;
        expect(findStub.called).to.be.false;
        expect(next.called).to.be.false;
    });

    it('should pass the token and its expiry time on to logout (XRH-51)', async () => {
        req.headers.authorization = 'Bearer good-token';
        sinon.stub(jwt, 'verify').returns({ id: 'user123', exp: 1900000000 });
        sinon.stub(RevokedToken, 'isRevoked').resolves(false);
        stubUserLookup({ id: 'user123' });

        await protect(req, res, next);

        expect(req.token).to.equal('good-token');
        expect(req.tokenExpiresAt.getTime()).to.equal(1900000000 * 1000);
    });
});
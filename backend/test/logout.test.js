const { expect } = require('chai');
const sinon = require('sinon');
const crypto = require('crypto');
const RevokedToken = require('../models/RevokedToken');
const { logoutUser } = require('../controllers/authController');

// XRH-51 User Story 10
describe('XRH-51 Secure logout - logoutUser', () => {
    let req, res;

    beforeEach(() => {
 
        req = {
            user: { id: 'user123' },
            token: 'the-token-of-this-session',
            tokenExpiresAt: new Date('2026-11-01T00:00:00Z'),
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should mark the token as logged out and return 200', async () => {
        const revokeStub = sinon.stub(RevokedToken, 'revoke').resolves();

        await logoutUser(req, res);

        expect(revokeStub.calledOnceWith('the-token-of-this-session', req.tokenExpiresAt)).to.be.true;
        expect(res.status.calledOnceWith(200)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Logged out' })).to.be.true;
    });

    it('should return 500 when the token cannot be saved as logged out', async () => {
        sinon.stub(RevokedToken, 'revoke').rejects(new Error('Database connection lost'));

        await logoutUser(req, res);

        expect(res.status.calledOnceWith(500)).to.be.true;
        expect(res.json.calledOnceWith({ message: 'Database connection lost' })).to.be.true;
    });
});

describe('XRH-51 Secure logout - RevokedToken model', () => {
    const token = 'the-token-of-this-session';
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    afterEach(() => {
        sinon.restore();
    });

    it('should save a hash of the token, not the token itself', async () => {
        const updateStub = sinon.stub(RevokedToken, 'updateOne').resolves();
        const expiresAt = new Date('2026-11-01T00:00:00Z');

        await RevokedToken.revoke(token, expiresAt);

        expect(updateStub.calledOnce).to.be.true;
        const [filter, doc, options] = updateStub.firstCall.args;
        expect(filter).to.deep.equal({ tokenHash });
        expect(doc).to.deep.equal({ tokenHash, expiresAt });
        expect(options).to.deep.equal({ upsert: true });
        expect(JSON.stringify(doc)).to.not.include(token);
    });

    it('should say a token is logged out when its hash is in the database', async () => {
        const existsStub = sinon.stub(RevokedToken, 'exists').resolves({ _id: 'abc' });

        const result = await RevokedToken.isRevoked(token);

        expect(existsStub.calledOnceWith({ tokenHash })).to.be.true;
        expect(result).to.be.true;
    });

    it('should say a token is still fine when its hash is not in the database', async () => {
        sinon.stub(RevokedToken, 'exists').resolves(null);

        const result = await RevokedToken.isRevoked(token);

        expect(result).to.be.false;
    });
});
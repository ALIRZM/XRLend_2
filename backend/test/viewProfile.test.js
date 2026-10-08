const { expect } = require('chai');
const sinon = require('sinon');
const { getProfile } = require('../controllers/authController');


describe('XRH-48 View my profile - getProfile', () => {
    let req, res;

    beforeEach(() => {
        
        req = {
            user: {
                id: 'user123',
                name: 'Student One',
                email: 'student1@qut.edu.au',
                role: 'student',
                password: 'hashed-password-that-must-stay-private',
            },
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return 200 with the name, email and role of the logged-in user', async () => {
        await getProfile(req, res);

        expect(res.status.calledOnceWith(200)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({
            id: 'user123',
            name: 'Student One',
            email: 'student1@qut.edu.au',
            role: 'student',
        });
    });

    it('should never send the password back', async () => {
        await getProfile(req, res);

        expect(res.json.firstCall.args[0]).to.not.have.property('password');
    });

    it('should return the role of a technician as well', async () => {
        req.user.role = 'technician';

        await getProfile(req, res);

        expect(res.json.firstCall.args[0].role).to.equal('technician');
    });
});
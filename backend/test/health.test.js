const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

const { expect } = chai;
chai.use(chaiHttp);

// XRH-88:load balancer and the load tests
describe('XRH-88 Health check - GET /api/health', () => {
    afterEach(() => {
        delete process.env.SERVER_NAME;
    });

    it('should return 200 and status ok without a token', async () => {
        const res = await chai.request(app).get('/api/health');

        expect(res).to.have.status(200);
        expect(res.body.status).to.equal('ok');
    });

    it('should say which server answered in the body and the X-Server header', async () => {
        process.env.SERVER_NAME = 'Server 1';

        const res = await chai.request(app).get('/api/health');

        expect(res.body.server).to.equal('Server 1');
        expect(res).to.have.header('x-server', 'Server 1');
    });
});
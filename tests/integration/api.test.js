const request = require('supertest');
const app = require('../../src/app');

describe('API Health Check', () => {
  it('should return 200 and a success message', async () => {
    const res = await request(app).get('/health');
    if (res.statusCode !== 200) console.log(res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Mercado API is running 🚀');
  });
});

import request from 'supertest';
import server from '../app';

const baseURI = '/api/v1';
let app; 

beforeEach(() => {
    app = server
});

afterEach(() => { app.close() });

describe("Index.js", () => {
    it('should return 200 if connection is valid', async () => {
        const res = await request(server).get(`${baseURI}`);
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/Environment/);
        
    });
});
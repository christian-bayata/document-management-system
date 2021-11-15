import request from 'supertest';
import server from '../../../app';
import User from '../../../models/users';
import mongoose from 'mongoose';

const baseURI = '/api/v1';
let app; 

describe("Users Controller", () => {
    
    beforeAll(async () => {
        app = server
    });
    
    afterAll(async () => { 
        app.close();
        await User.deleteMany();
        mongoose.disconnect(); 
    });
    
    describe('Register user', () => {

        const exec = async () => {
            return await request(app).post(`${baseURI}/register`).send(userDetails);
        };

        it('should return 400 if userName is missing', async () => {
            let userDetails = {
                firstName: "user_firstName",
                lastName: "user_lastName",   
                email: "user@gmail.com",
                password: "abc123",
                roleId: 2             
            };
            const res = await request(app).post(`${baseURI}/register`).send(userDetails);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/userName/);
        });

        it('should return 400 if firstName is missing', async () => {
            let userDetails = {
                userName: "user_userName",
                lastName: "user_lastName",   
                email: "user@gmail.com",
                password: "abc123",
                roleId: 2             
            };
            const res = await request(app).post(`${baseURI}/register`).send(userDetails);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/firstName/);
        });

        it('should return 400 if lastName is missing', async () => {
            let userDetails = {
                userName: "user_userName",
                firstName: "user_firstName",   
                email: "user@gmail.com",
                password: "abc123",
                roleId: 2             
            };
            const res = await request(app).post(`${baseURI}/register`).send(userDetails);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/lastName/);
        });

        it('should return 400 if email is missing', async () => {
            let userDetails = {
                userName: "user_userName",
                firstName: "user_firstName",
                lastName: "user_lastName",   
                password: "abc123",
                roleId: 2             
            };
            const res = await request(app).post(`${baseURI}/register`).send(userDetails);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/email/);
        });

        it('should return 400 if password is missing', async () => {
            let userDetails = {
                userName: "user_userName",
                firstName: "user_firstName",
                lastName: "user_lastName",   
                email: "user@gmail.com",
                roleId: 2             
            };
            const res = await request(app).post(`${baseURI}/register`).send(userDetails);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/password/);
        });

        it('should return 400 if roleId is missing', async () => {
            let userDetails = {
                userName: "user_userName",
                firstName: "user_firstName",
                lastName: "user_lastName",   
                email: "user@gmail.com",
                password: "abc123"             
            };
            const res = await request(app).post(`${baseURI}/register`).send(userDetails);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/roleId/);
        });

        it('should return 400 if user already exists', async () => {
            await User.insertMany({
                userName: "user_userName",
                firstName: "user_firstName",
                lastName: "user_lastName",   
                email: "user@gmail.com",
                password: "abc123",
                roleId: 2      
            })

            const existingUserPayload = { 
                userName: "user_userName",
                firstName: "user_firstName",
                lastName: "user_lastName",   
                email: "user@gmail.com",
                password: "abc123",
                roleId: 2
             };
            const res = await request(app).post(`${baseURI}/register`).send(existingUserPayload);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/exists/);
        });

        it('should return 200 if all user details exists', async () => {

            const userDetails = { 
                userName: "Frankie1",
                firstName: "Frank",
                lastName: "Osagie",
                email: "franksagie1@gmail.com",
                password: "frank123",
                roleId: 2
             };

             const res = await request(app).post(`${baseURI}/register`).send(userDetails);
            expect(res.status).toBe(201);
            expect(res.body.message).toMatch(/Registered/i);
        });
    });
});
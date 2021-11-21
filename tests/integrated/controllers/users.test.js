import request from 'supertest';
import server from '../../../app';
import User from '../../../models/users';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { secretKey } from '../../../settings';

const baseURI = '/api/v1';
let app; 

describe("Users Controller", () => {
    
    beforeAll(async () => {
        app = server
    });
    
    afterAll(async () => { 
        app.close();
        await User.deleteMany({});
        mongoose.disconnect(); 
    });
    
    describe('Register user', () => {
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
            expect(res.body.message).toMatch(/created/i);
        });
    });

    describe('Login user', () => {
        it('should return 400 if user payload does not contain email', async () => {
            const userPayload = {
                password: "frank123"
            }; 
            const res = await request(app)
            .post(`${baseURI}/login`)
            .send(userPayload);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/email/i);
        });

        it('should return 400 if user payload does not contain password', async () => {
            const userPayload = {
                email: "user@gmail.com"
            }; 
            const res = await request(app)
            .post(`${baseURI}/login`)
            .send(userPayload);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/password/i);
        });

        it('should return 400 if user password is incorrect', async () => {
            const userPayload = {
                email: "franksagie1@gmail.com",
                password: "abc123"
            }; 
            const res = await request(app)
            .post(`${baseURI}/login`)
            .send(userPayload);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/password/i);
        });

        it('should return 404 if user email cannot be found in the database', async () => {
            const userPayload = {
                email: "user@gmail.com",
                password: "frank123"
            }; 
            const res = await request(app)
            .post(`${baseURI}/login`)
            .send(userPayload);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/password/i);
        });

        it('should generate token for logged in users', async () => {
            const userPayload = {
                email: "franksagie1@gmail.com",
                password: "frank123"
            };
            const id = mongoose.Types.ObjectId().toHexString();
            const token = jwt.sign({_id: id, roleId: 2 }, secretKey);
            
            const res = await request(app)
            .post(`${baseURI}/login`)
            .send(userPayload);
            expect(res.body.token).not.toBeNull();
            expect(res.header).toBeDefined();
        });

        it('should return 200 if user payload has correct details', async () => {            
            const userPayload = {
                email: "franksagie1@gmail.com",
                password: "frank123"
            }
            const res = await request(app)
            .post(`${baseURI}/login`)
            .send(userPayload);
            expect(res.status).toEqual(200);
            expect(res.header).toBeDefined();
        });
    });

    describe('Get user details', () => {
        it('should return 200 if the  user details are found', async () => {
            const id = mongoose.Types.ObjectId().toHexString();
            const token = jwt.sign({_id: user._id, roleId: user.roleId }, secretKey)
            const decoded = jwt.verify(token, secretKey);
            const res = await request(app)
            .get(`${baseURI}/me`)
            .set('x-auth-token', token)
            expect(res.status).toEqual(200);
            expect(decoded._id).toBeTruthy();        
        })
    })
});
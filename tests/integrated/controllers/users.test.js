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
            const token = jwt.sign({_id: id, roleId: 2 }, secretKey)
            const decoded = jwt.verify(token, secretKey);
            const res = await request(app)
            .get(`${baseURI}/me`)
            .set('x-auth-token', token)
            expect(res.status).toEqual(200);
            expect(decoded._id).toBeTruthy();        
        });
    });

    describe('Update user details', () => {
        it('should return 404 if the user is not logged in', async () => {
            //No email, no password;
            const userPayload = {};

            const res = await request(app)
            .put(`${baseURI}/ghfkdji786`)
            .send(userPayload);
            expect(res.status).toEqual(404);      
        });

        it('should return 401 if the user does not provide a token', async () => {
            //No email, no password;
            const userPayload = {
                email: "franksagie1@gmail.com",
                pasword: "frank123"
            };

            const res = await request(app)
            .put(`${baseURI}/me/update`)
            .send(userPayload);
            expect(res.status).toEqual(401);      
        });

        it('should return 401 if the user roleId is 2', async () => {
            //No email, no password;
            const userPayload = {
                email: "franksagie1@gmail.com",
                pasword: "frank123"
            };

            const res = await request(app)
            .put(`${baseURI}/me/update`)
            .send(userPayload);
            expect(res.status).toEqual(401);
            expect(res.body.message).toMatch(/cannot access/)      
        });

        it('should return 404 if user is not found', async () => {
            const token = (new User()).generateAuthToken();
            const fakeUserPayload = {
                userName: "userName_test",
                firstName: "firstName_test",
                lastName: "lastName_test",
                email: "tester@gmail.com"
            };
            const res = await request(app)
            .put(`${baseURI}/${fakeUserPayload._id}`)
            .set('x-auth-token', token)
            .send(fakeUserPayload);
            expect(res.status).toEqual(404);      
        });

        it('should update user details and return 200', async () => {
            const token = (new User()).generateAuthToken();
            const userPayload = {
                userName: "userName",
                firstName: "firstName",
                lastName: "lastName",
                email: "tester@gmail.com",
            };
            const res = await request(app)
            .put(`${baseURI}/me/update`)
            .set('x-auth-token', token)
            .send(userPayload);
            expect(res.status).toEqual(200);
            expect(res.body.message).toMatch(/successfully updated/i);      
        });
    });

    describe('Log out a user', () => {
        it('should return 200 if user is logged out', async () => {
            const res = await request(app).get(`${baseURI}/logout`).set('x-auth-token', null)
            expect(res.status).toEqual(200);
            expect(res.body.message).toMatch(/logged out/i);
        });
    });

    describe('ADMIN - Get all users', () => {
        it('should return 403 if user is not eligible to get all users', async () => {
            const id = mongoose.Types.ObjectId().toHexString();
            const token = jwt.sign({_id: id, roleId: 2 }, secretKey);

            const res = await request(app).get(`${baseURI}/users`).set('x-auth-token', token);
            expect(res.status).toEqual(403);
            expect(res.body.message).toMatch(/access/i);
        });

        it('should return 200 if all users are gotten', async () => {
            
            await User.collection.insertMany([
                {
                userName: "userName1_test",
                firstName: "firstName1_test",
                lastName: "lastName1_test",
                email: "userEmail1_test@gmail.com",
                password: "user1_password",
                roleId: 2  
                },
                {
                userName: "userName2_test",
                firstName: "firstName2_test",
                lastName: "lastName2_test",
                email: "userEmail2_test@gmail.com",
                password: "user2_password",
                roleId: 2  
                },
                {
                userName: "userName3_test",
                firstName: "firstName3_test",
                lastName: "lastName3_test",
                email: "userEmail3_test@gmail.com",
                password: "user3_password",
                roleId: 2  
                }
            ]);
            const id = mongoose.Types.ObjectId().toHexString();
            const token = jwt.sign({_id: id, roleId: 1 }, secretKey)
  
            const res = await request(app).get(`${baseURI}/users`).set('x-auth-token', token);
            expect(res.status).toEqual(200);
            expect(res.body.message).toMatch(/all users/i);
        });
    });

    describe('ADMIN - Get user by id', () => {
        it('should return 400 if the user ID is not found', async () => {
             const id = mongoose.Types.ObjectId().toHexString();
            const token = jwt.sign({_id: id, roleId: 2 }, secretKey);

            const res = await request(app).get(`${baseURI}/12234fgdjy789hj`).set('x-auth-token', token);
            expect(res.status).toEqual(404);
        });

        it('should return 200 if the user ID is found, and get it', async () => {
            const user = await User.create({
                userName: "Wiwi",
                firstName: "Wisdom",
                lastName: "Alakija",
                email: "wiz_alak@gmail.com",
                password: "wiz123",
                roleId: 2
            });
            
           const id = mongoose.Types.ObjectId().toHexString();
           const token = jwt.sign({_id: id, roleId: 1 }, secretKey);

           const res = await request(app).get(`${baseURI}/user/${user._id}`).set('x-auth-token', token);
           expect(res.status).toEqual(200);
           expect(res.body.message).toMatch(/user with id/i);
       });
    });
    
    describe('ADMIN - Delete user by id', () => {
        it('should return 400 if the user ID is not found', async () => {
             const id = mongoose.Types.ObjectId().toHexString();
            const token = jwt.sign({_id: id, roleId: 1 }, secretKey);

            const res = await request(app).delete(`${baseURI}/delete/12234fgdjy789hj`).set('x-auth-token', token);
            expect(res.status).toEqual(404);
        });

        it('should return 200 if the user ID is found, and delete it', async () => {
            const user = await User.create({
                userName: "aba",
                firstName: "domi",
                lastName: "Daga",
                email: "domidaga@gmail.com",
                password: "domi123",
                roleId: 2
            });
            
           const id = mongoose.Types.ObjectId().toHexString();
           const token = jwt.sign({_id: id, roleId: 1 }, secretKey);

           const res = await request(app).delete(`${baseURI}/delete/user/${user._id}`).set('x-auth-token', token);
           expect(res.status).toEqual(200);
           expect(res.body.message).toMatch(/deleted user/i);
       });
    });
});
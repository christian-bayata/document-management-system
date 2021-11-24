import request from 'supertest';
import server from '../../../app';
import Document from '../../../models/documents';
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
        await Document.deleteMany({});
        await User.deleteMany({});
        mongoose.disconnect(); 
    });
    
    describe('Create new document', () => {
        it('should return 400 if title is missing from document payload', async () => {
            const documentPayload = {
                content: "doc_content",
                access: "private"
            };
            const token = (new User()).generateAuthToken();
            const res = await request(app)
                .post(`${baseURI}/document/create`)
                .set('x-auth-token', token)
                .send(documentPayload);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/title/i);         
        });

        it('should return 400 if content is missing from document payload', async () => {
            const documentPayload = {
                title: "doc_title",
                access: "private"
            };
            const token = (new User()).generateAuthToken();
            const res = await request(app)
                .post(`${baseURI}/document/create`)
                .set('x-auth-token', token)
                .send(documentPayload);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/content/i);         
        });

        it('should return 400 if access is missing from document payload', async () => {
            const documentPayload = {
                title: "doc_title",
                content: "doc_content"
            };
            const token = (new User()).generateAuthToken();
            const res = await request(app)
                .post(`${baseURI}/document/create`)
                .set('x-auth-token', token)
                .send(documentPayload);
            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/access/i);         
        });

        it('should return 404 if owner Id is not found', async () => {
            const token = (new User()).generateAuthToken();
            const user = await User.insertMany({
                _id: mongoose.Types.ObjectId(),
                userName: "Frankie1",
                firstName: "Frank",
                lastName: "Osagie",
                email: "franksagie1@gmail.com",
                password: "frank123",
                roleId: 2
            });

            const document = {
                title: "doc_title",
                content: "doc_content",
                access: "private",
                ownerId: user._id
            }

            const res = await request(app)
                .post(`${baseURI}/document/create`)
                .set('x-auth-token', token)
                .send(document) 
            expect(res.status).toEqual(404);
            expect(res.body.message).toMatch(/not found/i);         
        });

        it('should pass if document ownerId is equal to the user Id', async () => {
            const token = (new User()).generateAuthToken();
            const decoded = jwt.verify(token, secretKey);

            let user = await User.insertMany({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie1111@gmail.com",
                password: "frank1234",
                roleId: 2
            });

            user._id = decoded._id;

            let document = {
                title: "doc_title",
                content: "doc_content",
                access: "private"
            };
            document.ownerId = user._id;

            const res = await request(app)
                .post(`${baseURI}/document/create`)
                .set('x-auth-token', token)
                .send(document) 
            expect(document.ownerId).toEqual(decoded._id);
            expect(res.header).toBeDefined();
        });
        //TODO... test for 200 if user creates document
    });

    describe('User retrieves all documents', () => {
        it('should return 404 if user Id is not found', async () => {
            const token = (new User()).generateAuthToken();
            const user = new User({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie111@gmail.com",
                password: "frank1234",
                roleId: 2
            });
            user._id = mongoose.Types.ObjectId();
            await user.save();
            
            const res = await request(app)
                .get(`${baseURI}/documents`)
                .set('x-auth-token', token)
                .send(user);
            expect(res.status).toEqual(404);     
            expect(res.body.message).toMatch(/not found/i);    
        });
    });
});

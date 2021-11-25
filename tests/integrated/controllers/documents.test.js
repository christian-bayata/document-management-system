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
                email: "franksagie101@gmail.com",
                password: "frank1234",
                roleId: 2
            });
            user._id = mongoose.Types.ObjectId();
            await user.save();
            
            const res = await request(app)
                .get(`${baseURI}/documents`)
                .set('x-auth-token', token)
            expect(res.status).toEqual(404);     
            expect(res.body.message).toMatch(/not found/i);    
        });

        it('should return 200 if user Id is found', async () => {
            
            const token = (new User()).generateAuthToken();
            const decoded = jwt.verify(token, secretKey);

            await User.insertMany({
                _id: decoded._id,
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie1000@gmail.com",
                password: "frank1234",
                roleId: 2
            });
           
            const res = await request(app)
                .get(`${baseURI}/documents`)
                .set('x-auth-token', token)
            expect(res.status).toEqual(200);
            expect(res.body.message).toMatch(/successfully retrieved/i);
        });
    });

    describe('User updates document', () => {
        it('should return 404 if document Id is not found', async () => {
            const token = (new User()).generateAuthToken();
            
            await Document.insertMany({
                title: "doc_title",
                content: "doc_content",
                access: "private",
                ownerId: mongoose.Types.ObjectId().toHexString()    
            });

            const document = {
                title: "doc_title1",
                content: "doc_content_1"
            }

            const res = await request(app)
                .put(`${baseURI}/document/update/111111111111`)
                .set('x-auth-token', token)
                .send(document);
            expect(res.status).toEqual(404);     
            expect(res.body.message).toMatch(/does not exist/i);    
        });

        it('should return 401 if document Id is not the same as owner Id', async () => {
            const token = (new User()).generateAuthToken();
            const decoded = jwt.verify(token, secretKey);

            const user = await User.insertMany({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie001@gmail.com",
                password: "frank1234",
                roleId: 2
            });

            user._id = decoded.id;

            let document = await Document.create({
                title: "doc_title",
                content: "doc_content",
                access: "private",    
                ownerId: mongoose.Types.ObjectId()
            });
            await document.save();

            const documentPayload = {
                title: "doc_title1",
                content: "doc_content_1"
            }

            const res = await request(app)
                .put(`${baseURI}/document/update/${document._id}`)
                .set('x-auth-token', token)
                .send(documentPayload);
            expect(res.status).toEqual(401);     
            expect(res.body.message).toMatch(/not authorized/i);    
        });

        it('should return 200 if document has been updated', async () => {
            const token = (new User()).generateAuthToken();
            const decoded = jwt.verify(token, secretKey);

            let user = await User.insertMany({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie002@gmail.com",
                password: "frank1234",
                roleId: 2
            });
            user._id = decoded._id
            
            let document = await Document.create({
                title: "doc_title",
                content: "doc_content",
                access: "private",    
                ownerId: mongoose.Types.ObjectId(user._id)
            })

            const documentPayload = {
                title: "doc_title_1",
                content: "doc_content_1"
            };
            
            const res = await request(app)
                .put(`${baseURI}/document/update/${document._id}`)
                .set('x-auth-token', token)
                .send(documentPayload);
            expect(res.status).toEqual(200);     
            expect(res.body.message).toMatch(/successfully updated/i);    
        });
    });

    describe('User deletes document', () => {
        it('should return 404 if document Id is not found', async () => {
            const token = (new User()).generateAuthToken();
            let document = await Document.insertMany({ 
                title: "doc_title",
                content: "doc_content",
                access: "private",    
                ownerId: mongoose.Types.ObjectId().toHexString()
            })

            document._id = mongoose.Types.ObjectId().toHexString();
            
            const res = await request(app)
                .delete(`${baseURI}/document/delete/${document._id}`)
                .set('x-auth-token', token)
            expect(res.status).toEqual(404);     
            expect(res.body.message).toMatch(/not found/);     
        });

        it('should return 401 if document Id is not the same as owner Id', async () => {
            const token = (new User()).generateAuthToken();
            const decoded = jwt.verify(token, secretKey);

            const user = await User.insertMany({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie00001@gmail.com",
                password: "frank1234",
                roleId: 2
            });

            user._id = decoded.id;

            let document = await Document.create({
                title: "doc_title",
                content: "doc_content",
                access: "private",    
                ownerId: mongoose.Types.ObjectId()
            });
            await document.save();

            const res = await request(app)
                .delete(`${baseURI}/document/delete/${document._id}`)
                .set('x-auth-token', token)
            expect(res.status).toEqual(401);     
            expect(res.body.message).toMatch(/not authorized/i);    
        });

        it('should return 200 if document has been deleted', async () => {
            const token = (new User()).generateAuthToken();
            const decoded = jwt.verify(token, secretKey);

            let user = await User.insertMany({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie0002@gmail.com",
                password: "frank1234",
                roleId: 2
            });
            user._id = decoded._id;
            
            let document = await Document.create({
                title: "doc_title",
                content: "doc_content",
                access: "private",    
                ownerId: mongoose.Types.ObjectId(user._id)
            });
            await document.save();

            const res = await request(app)
                .delete(`${baseURI}/document/delete/${document._id}`)
                .set('x-auth-token', token)
            expect(res.status).toEqual(200);     
            expect(res.body.message).toMatch(/successfully deleted/i);    
        });
    });
});

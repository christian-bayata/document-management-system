import request from 'supertest';
import server from '../../../app';
import Document from '../../../models/documents';
import User from '../../../models/users';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { secretKey } from '../../../settings';

const baseURI = '/api/v1';
let app; 

let token;
let decoded;
let user;
let document;

describe("Document Controller", () => {
    
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

        const exec = async () => {
            return await request(app)
                .post(`${baseURI}/document/create`)
                .set('x-auth-token', token)
                .send(document)
        };

        beforeEach(async () => {
            token = (new User()).generateAuthToken();
            decoded = jwt.verify(token, secretKey);

            user = new User({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie1111@gmail.com",
                password: "frank1234",
                roleId: 2
            });

            document = {
                title: "doc_title",
                content: "doc_content",
                access: "private"
            };
        })
        
        it('should return 400 if title is missing from document payload', async () => {
            const documentPayload = {
                content: "doc_content",
                access: "private"
            };
            const token = (new User()).generateAuthToken();
            const res = await exec();

            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/title/i);         
        });

        it('should return 400 if content is missing from document payload', async () => {
            document.content = "";

            const res = await exec();

            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/content/i);         
        });

        it('should return 400 if access is missing from document payload', async () => {
            document.access = "";

            const res = await exec();

            expect(res.status).toEqual(400);
            expect(res.body.message).toMatch(/access/i);         
        });

        it('should return 404 if owner Id is not found', async () => {
            
            user.email = "franksagie1110@gmail.com"
            user.save();

            const res = await exec();

            expect(res.status).toEqual(404);
            expect(res.body.message).toMatch(/not found/i);         
        });

        it('should pass if document ownerId is equal to the user Id', async () => {
            user._id = decoded._id;
            user.email = "franksagie1111@gmail.com";
            user.save();

            document.ownerId = user._id;

            const res = await exec();

            expect(document.ownerId).toEqual(user._id);
            expect(res.header).toBeDefined();
        });
    });

    describe('User retrieves all documents', () => {

        beforeEach(() => {
            token = (new User()).generateAuthToken();
            decoded = jwt.verify(token, secretKey);

            user = new User({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie1000@gmail.com",
                password: "frank1234",
                roleId: 2
            });
        });

        const exec = async () => {
            return await request(app)
                .get(`${baseURI}/documents`)
                .set('x-auth-token', token)
        };

        it('should return 404 if user Id is not found', async () => {
            user._id = mongoose.Types.ObjectId();
            await user.save();
            
            const res = await exec();

            expect(res.status).toEqual(404);     
            expect(res.body.message).toMatch(/not found/i);    
        });

        it('should return 200 if user Id is found', async () => {
            user._id = decoded._id;
            user.email = "franksagie10001@gmail.com";
            await user.save();
           
            const res = await exec();

            expect(res.status).toEqual(200);
            expect(res.body.message).toMatch(/successfully retrieved/i);
        });
    });

    describe('User updates document', () => {


        const documentPayload = {
            title: "doc_title_1",
            content: "doc_content_1"
        };

        const exec = async () => {
            return await request(app)
            .put(`${baseURI}/document/update/${document._id}`)
            .set('x-auth-token', token)
            .send(documentPayload);
        };

        beforeEach(async () => {
            token = (new User()).generateAuthToken();
            decoded = jwt.verify(token, secretKey);

            user = new User({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie002@gmail.com",
                password: "frank1234",
                roleId: 1
            });
            user._id = decoded._id;

            document = await Document.create({
                title: "doc_title",
                content: "doc_content",
                access: "private",    
                ownerId: mongoose.Types.ObjectId()
            });
            await document.save();
        })

        it('should return 404 if document Id is not found', async () => {
            user.email = "franksagie003@gmail.com"
            await user.save();

            document._id = mongoose.Types.ObjectId().toHexString();

            let res = await exec();
         
            expect(res.status).toEqual(404);     
            expect(res.body.message).toMatch(/does not exist/i);    
        });

        it('should return 401 if document Id is not the same as owner Id', async () => {
            await document.save();

            const res = await exec();
            
            expect(res.status).toEqual(401);     
            expect(res.body.message).toMatch(/not authorized/i);    
        });

        it('should return 200 if document has been updated', async () => {
            user._id = decoded._id;
            await user.save();
           
            document.ownerId = mongoose.Types.ObjectId(user._id);
            await document.save();
        
            const res = await exec();

            expect(res.status).toEqual(200);     
            expect(res.body.message).toMatch(/successfully updated/i);    
        });
    });

    describe('User deletes document', () => {
 
        beforeEach( async () => {
            token = (new User()).generateAuthToken();
            decoded = jwt.verify(token, secretKey);

            user = new User({
                userName: "Frankie11",
                firstName: "Frank1",
                lastName: "Osagie1",
                email: "franksagie0002@gmail.com",
                password: "frank1234",
                roleId: 2
            });
          

            document = await Document.create({
                title: "doc_title",
                content: "doc_content",
                access: "private",    
                ownerId: mongoose.Types.ObjectId()
            });
            await document.save();
        });

        const exec = async () => {
            return await request(app)
                .delete(`${baseURI}/document/delete/${document._id}`)
                .set('x-auth-token', token)
        };

        it('should return 404 if document Id is not found', async () => {
            decoded = "";

            user.email = "franksagie1002@gmail.com";
            await user.save();

            document._id = mongoose.Types.ObjectId();
        
            const res = await exec();
            
            expect(res.status).toEqual(404);     
            expect(res.body.message).toMatch(/not found/);     
        });

        it('should return 401 if document Id is not the same as owner Id', async () => {
            decoded = "";
            await user.save();

            const res = await exec();

            expect(res.status).toEqual(401);     
            expect(res.body.message).toMatch(/not authorized/i);     
        });

        it('should return 200 if document has been deleted', async () => {

            user.email = "franksagie1001@gmail.com";
            user._id = decoded._id;
            await user.save();

            document.ownerId = mongoose.Types.ObjectId(user._id);
            await document.save();

            const res = await exec();
            
            expect(res.status).toEqual(200);     
            expect(res.body.message).toMatch(/successfully deleted/i);    
        });
    });

    describe('ADMIN - Get all documents', () => {

        beforeEach( async () => {
            token = jwt.sign({
                _id: mongoose.Types.ObjectId().toHexString(),
                roleId: 1
            }, secretKey);
            decoded = jwt.verify(token, secretKey);

            await Document.collection.insertMany([
                {
                    title: "doc_title",
                    content: "doc_content",
                    access: "private",    
                    ownerId: mongoose.Types.ObjectId()
                },
                {
                    title: "doc_title",
                    content: "doc_content",
                    access: "private",    
                    ownerId: mongoose.Types.ObjectId()
                }
        ]);
        });

        const exec = async () => {
            return await request(app)
                .get(`${baseURI}/admin/documents`)
                .set('x-auth-token', token)
        };

        it('should return 200 if documents are found', async () => {
            const res = await exec();
            
            expect(res.status).toEqual(200);     
            expect(res.body.message).toMatch(/all documents/i);     
        });    
    });

    describe('ADMIN - Get a single document by its id', () => {

        beforeEach( async () => {
            token = jwt.sign({
                _id: mongoose.Types.ObjectId().toHexString(),
                roleId: 1
            }, secretKey);
            decoded = jwt.verify(token, secretKey);

            document = new Document(
                {
                    title: "doc_title",
                    content: "doc_content",
                    access: "private",
                    ownerId: mongoose.Types.ObjectId()
                }
            );
           
        });

        const exec = async () => {
            return await request(app)
                .get(`${baseURI}/admin/document/${document._id}`)
                .set('x-auth-token', token)
        };

        it('should return 404 if documents are not found', async () => {

            const res = await exec();
            
            expect(res.status).toEqual(404);     
            expect(res.body.message).toMatch(/not found/i);     
        });
        
        it('should return 200 if documents are found', async () => {
            document._id = mongoose.Types.ObjectId();
            await document.save();

            const res = await exec();
            
            expect(res.status).toEqual(200);     
            expect(res.body.message).toMatch(/successfully retrieved/i);     
        });
    });

    describe('ADMIN - search documents by their titles', () => {

        beforeEach( async () => {
            token = jwt.sign({
                _id: mongoose.Types.ObjectId().toHexString(),
                roleId: 1
            }, secretKey);
            decoded = jwt.verify(token, secretKey);

            await Document.collection.insertMany([
                {
                    title: "doc_title_1",
                    content: "doc_content_1",
                    access: "private",    
                    ownerId: mongoose.Types.ObjectId()
                },
                {
                    title: "doc_title_2",
                    content: "doc_content_2",
                    access: "private",    
                    ownerId: mongoose.Types.ObjectId()
                }
            ]);
        });

        const exec = async () => {
            return await request(app)
                .get(`${baseURI}/admin/documents/search`)
                .query({title: "doc_title_1"})
                .set('x-auth-token', token)
        };

        it('should return 200 if document(s) is found', async () => {
            const res = await exec();
            
            expect(res.status).toEqual(200);     
            expect(res.body.message).toMatch(/successfully searched/i);     
        });
        
    });
});

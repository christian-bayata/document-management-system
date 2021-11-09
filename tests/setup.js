import request from 'supertest';
import app from '../app';

export const server = request(app)
export const baseURI = '/api/v1';
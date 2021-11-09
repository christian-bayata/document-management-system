import express from 'express';
const router = express.Router();
import { testEnvironmentVariable } from '../settings';

router.use('/', (req, res, next) => {
    res.json({
        message: testEnvironmentVariable
    });
});

export default router;
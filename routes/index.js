import express from 'express';
const router = express.Router();

router.use('/', function (req, res, next) {
    res.json({
        message: "You are welcome to the DMS api"
    });
});

export default router;
const express = require('express');
const router = express.Router()

router.use('/', function (req, res, next) {
    res.json({
        message: "You are welcome to the DMS api"
    });
});

module.exports = router;
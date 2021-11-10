import mongoose from 'mongoose';

export default function testDocController (req, res, next) {
    res.status(201).json({
        success: true,
        message: "The controller is working well"
    });
};


import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true,
        minlength: 5,
        maxlength: 50
    },
    content: {
        type: String,
        required: true,
        minlength: 5
    }, 
    access: {
       type: String,
       default: 'public',
       enum: {
            values: ['private', 'public', 'role']
       } 
    },
    ownerId: {
        type: Number
    }
});

export default mongoose.model('Document', documentSchema);

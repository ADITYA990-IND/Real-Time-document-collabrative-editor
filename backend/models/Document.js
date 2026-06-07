const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
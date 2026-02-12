const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    "content": {type: String, required: true},
    "senderId": {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    "roomId": {type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true},
    "createdAt": {type: Date, default: Date.now},
    "updatedAt": {type: Date, default: Date.now},
});
const Messages = mongoose.model('Message', messageSchema);

module.exports = Messages;


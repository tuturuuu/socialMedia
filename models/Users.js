const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    "email": {type: String, required: true, unique: true},
    "password": {type: String, required: true},
    "username": {type: String, required: true, unique: true},
    "age": {type: Number, required: true},
    "gender": {type: String, required: false},
    "birthday": {type: Date, required: false},
    "bio": {type: String, required: false},
    "createdAt": {type: Date, default: Date.now},
    "updatedAt": {type: Date, default: Date.now},
    "posts": [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    "friends": [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    "rooms": [{type: mongoose.Schema.Types.ObjectId, ref: 'Room'}],
});

const Users = mongoose.model('User', userSchema);

module.exports = Users;


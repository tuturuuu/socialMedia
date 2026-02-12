const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    
    "content": {type: String, required: true},
    "userId": {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    "createdAt": {type: Date, default: Date.now},
    "updatedAt": {type: Date, default: Date.now}
    
})

const Posts = mongoose.model('Post', postSchema)

module.exports = Posts

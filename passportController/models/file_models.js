const mongoose = require('mongoose');


const fileSchema = new mongoose.Schema({
    filename: String,
    path: String,
    size: Number,
})

// Create and export the model
const File = mongoose.model('File', fileSchema);
module.exports = File;

const mongoose = require('mongoose');

// Define the schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, // Mark field as required
        trim: true       // Trim whitespace from both ends
    },
    fatherName: {
        type: String,
        required: true,
        trim: true
    },
    motherName: {
        type: String,
        required: true,
        trim: true
    },
    nidNumber: {
        type: String,
        required: true,
        unique: true,    // Ensure unique values
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    nationality: {
        type: String,
        required: true,
        trim: true
    },
    dob:{
        type: Date,
        required: true
    },
    bloodGroup:{
        type: String,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    passConId:{
        type: String,
        required: true
    },
    visaConId:{
        type: String,
        required: true
    },
    passportCount:{
        type : Number,
        required : true

    },
    revoked:{
        type : Boolean,
        required : true
    },
    visaType:{
        type : String
    }

}, {
    timestamps: true // Automatically manage createdAt and updatedAt
});

// Create and export the model
const Citizen = mongoose.model('Citizen', UserSchema);
module.exports = Citizen;

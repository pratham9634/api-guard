/**
 * @file AccessRequest.js
 * @description Mongoose schema definition for onboarding access requests.
 * Records submission details (name, email, company, useCase) for external signups before client admin provision.
 */

import mongoose from "mongoose";

/**
 * AccessRequest Mongoose Schema definition.
 */
const accessRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        // Enforces basic email validity regex patterns
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"]
    },
    companyName: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
    },
    useCase: {
        type: String,
        required: [true, "Use case description is required"],
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    notes: {
        type: String,
        default: ""
    }
}, {
    // Automatically creates 'createdAt' and 'updatedAt' database properties
    timestamps: true
});

const AccessRequest = mongoose.model("AccessRequest", accessRequestSchema);

export default AccessRequest;

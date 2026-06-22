import mongoose from "mongoose";

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
    timestamps: true
});

const AccessRequest = mongoose.model("AccessRequest", accessRequestSchema);

export default AccessRequest;

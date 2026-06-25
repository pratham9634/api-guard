/**
 * @file Client.js
 * @description Mongoose schema definition for tenant Clients.
 * Models registered organizations/companies using the system, including data retention policy configurations.
 */

import mongoose from 'mongoose';

/**
 * Client Mongoose Schema.
 */
const clientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            // Slugs must only contain lowercase alphanumeric values and dashes
            match: /^[a-z0-9-]+$/,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: 500,
            default: '',
        },
        website: {
            type: String,
            default: '',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        settings: {
            // Retention period (in days) for this client's raw API hit documents
            dataRetentionDays: {
                type: Number,
                default: 30,
                min: 7,
                max: 365,
            },
            alertsEnabled: {
                type: Boolean,
                default: true,
            },
            timezone: {
                type: String,
                default: 'UTC',
            },
        },
    },
    {
        timestamps: true,
        collection: 'clients',
    }
);

clientSchema.index({ isActive: 1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;
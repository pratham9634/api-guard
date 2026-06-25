/**
 * @file ApiKey.js
 * @description Mongoose schema definition for API keys.
 * Encapsulates authentication keys, environment tiers, granular ingest permissions, IP CIDR restrictions, and origin restrictions.
 */

import mongoose from 'mongoose';
import SecurityUtils from '../utils/SecurityUtils.js';

/**
 * MongoDB schema for API keys
 * Each API key belongs to a client and is used for authentication
 */
const apiKeySchema = new mongoose.Schema(
    {
        keyId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        keyValue: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            maxlength: 500,
            default: '',
        },
        environment: {
            type: String,
            enum: ['production', 'staging', 'development', 'testing'],
            default: 'production',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        permissions: {
            canIngest: {
                type: Boolean,
                default: true,
            },
            canReadAnalytics: {
                type: Boolean,
                default: false,
            },
            allowedServices: [{
                type: String,
                trim: true,
            }],
        },
        // usage and per-key rate limiting removed
        security: {
            allowedIPs: [{
                type: String,
                validate: {
                    // Validates IPv4 address string format or wildcard (0.0.0.0/0)
                    validator: function (v) {
                        return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(v) ||
                            v === '0.0.0.0/0';
                    },
                    message: 'Invalid IP address format'
                }
            }],
            allowedOrigins: [{
                type: String,
                validate: {
                    // Validates typical Web origin structures (http/https protocols or '*')
                    validator: function (v) {
                        return /^https?:\/\/[^\s]+$/.test(v) || v === '*';
                    },
                    message: 'Invalid origin format'
                }
            }],
            lastRotated: {
                type: Date,
                default: Date.now,
            },
            rotationWarningDays: {
                type: Number,
                default: 30,
            },
        },
        expiresAt: {
            type: Date,
            // Calculates expiry date dynamically from environment setting (defaults to 1 year / 365 days)
            default: () => {
                const days = parseInt(process.env.API_KEY_EXPIRY_DAYS || '365');
                return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            },
            index: true,
        },
        metadata: {
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            purpose: {
                type: String,
                trim: true,
                maxlength: 200,
            },
            tags: [{
                type: String,
                trim: true,
                maxlength: 50,
            }],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'api_keys',
    }
);

// Compound indexes to speed up authorization checks during ingestion lookup
apiKeySchema.index({ clientId: 1, isActive: 1 });
apiKeySchema.index({ keyValue: 1, isActive: 1 });
apiKeySchema.index({ environment: 1, clientId: 1 });

// Automatically purges key document when current Date exceeds expiresAt time
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

/**
 * Checks if the API key is expired compared to current system time.
 * @returns {boolean}
 */
apiKeySchema.methods.isExpired = function () {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
/**
 * @file authSchema.js
 * @description Validation rules for request fields in the Authentication module endpoints.
 * Processed by the validate() middleware helper.
 */

import { isValidRole } from "../../../shared/constants/roles.js";

/**
 * Validation rules for onboarding the first super_admin user.
 */
export const onboardSuperAdminSchema = {
    username: {
        required: true,
    },
    email: {
        required: true,
    },
    password: {
        required: true,
        minLength: 6
    }
}

/**
 * Validation rules for user creation / registration endpoints.
 */
export const registrationSchema = {
    username: {
        required: true,
    },
    email: {
        required: true,
    },
    password: {
        required: true,
        minLength: 6
    },
    role: {
        required: false,
        // Optional field; if supplied, checks role against ROLES constants array
        custom: (value) => {
            if (!value) return null;
            return isValidRole(value) ? null : 'Invalid role';
        }
    },
}

/**
 * Validation rules for credentials login endpoints.
 */
export const loginSchema = {
    username: { required: true },
    password: { required: true },
};
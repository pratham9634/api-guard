/**
 * @file SecurityUtils.js
 * @description Authentication security helpers.
 * Handles bcrypt-based password hashing, password complexity verification, and common password blacklist audits.
 */

import bcrypt from "bcryptjs";

class SecurityUtils {
    /**
     * Password complexity constraints configuration derived from env variables or fallback defaults.
     */
    static PASSWORD_REQUIREMENTS = {
        minLength : parseInt(process.env.PASSWORD_MIN_LENGTH || "8"),
        maxLength : parseInt(process.env.PASSWORD_MAX_LENGTH || "128"),
        requireUppercase : process.env.PASSWORD_REQUIRE_UPPERCASE === "true",
        requireLowercase : process.env.PASSWORD_REQUIRE_LOWERCASE === "true",
        requireNumber : process.env.PASSWORD_REQUIRE_NUMBER === "true",
        requireSymbol : process.env.PASSWORD_REQUIRE_SYMBOL === "true",
    }

    /**
     * Checks password string against lengths, required patterns (upper, lower, digit, symbol),
     * and a common weak password blacklist.
     * @param {string} password - Raw password candidate.
     * @returns {Object} `{ success: boolean, errors: string[] }` Validation status and warning list.
     */
    static validatePassword(password){
        const errors = [];
        const {minLength, maxLength, requireUppercase, requireLowercase, requireNumber, requireSymbol} = this.PASSWORD_REQUIREMENTS;

        if(!password ){
            return {success : false, errors : ["Password is required"]};
        }
        if(password.length < minLength){
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if(password.length > maxLength){
            errors.push(`Password must be at most ${maxLength} characters long`);
        }
        if(requireUppercase && !/[A-Z]/.test(password)){
            errors.push("Password must contain at least one uppercase letter");
        }
        if(requireLowercase && !/[a-z]/.test(password)){
            errors.push("Password must contain at least one lowercase letter");
        }
        if(requireNumber && !/[0-9]/.test(password)){
            errors.push("Password must contain at least one number");
        }
        if(requireSymbol && !/[!@#$%^&*]/.test(password)){
            errors.push("Password must contain at least one symbol");
        }

        // List of highly common dictionary passwords to block
        const weakPasswords = [
            'password', '123456', 'qwerty', 'admin', 'letmein',
            'password123', 'admin123', '12345678', 'welcome'
        ];

        if (weakPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common and easily guessable');
        }
        return {
            success : errors.length === 0,
            errors,
        };
    }

    /**
     * Computes a one-way secure hash from a plain-text password using bcrypt.
     * @param {string} password - Raw password.
     * @returns {Promise<string>} The hashed password promise.
     */
    static hashPassword(password){
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hash(password, salt);
    }

    /**
     * Compares a plain-text password candidate with a stored hash.
     * @param {string} password - Raw candidate.
     * @param {string} hash - Saved secure hash.
     * @returns {Promise<boolean>} Match outcome.
     */
    static comparePassword(password, hash){
        return bcrypt.compare(password, hash);
    }
}
export default SecurityUtils;
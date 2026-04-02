
class SecurityUtils {
    static PASSWORD_REQUIREMENTS = {
        minLength : parseInt(process.env.PASSWORD_MIN_LENGTH || "8"),
        maxLength : parseInt(process.env.PASSWORD_MAX_LENGTH || "128"),
        requireUppercase : process.env.PASSWORD_REQUIRE_UPPERCASE === "true",
        requireLowercase : process.env.PASSWORD_REQUIRE_LOWERCASE === "true",
        requireNumber : process.env.PASSWORD_REQUIRE_NUMBER === "true",
        requireSymbol : process.env.PASSWORD_REQUIRE_SYMBOL === "true",
    }

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

    static hashPassword(password){
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hash(password, salt);
    }

    static comparePassword(password, hash){
        return bcrypt.compare(password, hash);
    }
}
export default SecurityUtils;
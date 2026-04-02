import mongoose from "mongoose";
import SecurityUtils from "../utils/SecurityUtils";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        minlength : 3,
        maxlength : 30,
        validate : {
            validator : function(v){
                return /^[a-zA-Z0-9_]+$/.test(v);
            },
            message : "Username must contain only letters, numbers, and underscores"
        }
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        validate : {
            validator : function(v){
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message : "Email must be a valid email address"
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 6,
        maxlength : 30,
        validate : {
            validator : function(v){
                if(this.isModified('password')&& v && !v.startsWith('$2b$')){
                    const validationResult = SecurityUtils.validatePassword(v);
                    return validationResult.success
                }
                return true;
            },
            message : function(props){
                if(props.value && !props.value.startsWith('$2b$')){
                    const validationResult = SecurityUtils.validatePassword(props.value);
                    return validationResult.errors.join(", ");
                }
                return "Password validation failed "
            }
        },
    },
    role : {
        type: String,
        enum: ['super_admin', 'client_admin', 'client_viewer'],
        default: 'client_viewer'
    },
    clientId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Client",
        required : function(){
            return this.role !== "super_admin"
        }
    },
    isActive : {
        type : Boolean,
        default : true,
    },
    permissions : {
        canCreateApiKeys: {
            type: Boolean,
            default: false,
        },
        canManageUsers: {
            type: Boolean,
            default: false,
        },
        canViewAnalytics: {
            type: Boolean,
            default: true,
        },
        canExportData: {
            type: Boolean,
            default: false,
        },
    },
},{
    timestamps : true,
    collection : "users",
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    try{
        this.password = await SecurityUtils.hashPassword(this.password);
        next();
    }catch(error){
        next(error);
    }
    
});

userSchema.index({clientId : 1, isActive : 1});
userSchema.index({role : 1})

const User = mongoose.model("User", userSchema);
export default User;
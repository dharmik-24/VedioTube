import mongoose, {schema} from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from "bcypt";


const userSchema = new schema({
    userName: {
        type: String,
        required: [true, "UserName is must"],
        unique: [true, "Username should be Unique"],
        lowercase: [true, "UserName should be in lowercase"],
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, "Email is must"],
        unique: [true, "Email should be Unique"],
        lowercase: [true, "Email should be in lowercase"],
        trim: true,
    },
    fullName: {
        type: String,
        required: [true, "fullName is must"],
        lowercase: [true, "fullName should be in lowercase"],
        trim: true,
        index: true
    },
    avatar: {
        type: String,       //From Cloudonary
        required: true
    },
    coverImage: {
        type: string
    },
    watchHistory: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Vedio"
        }
    ],
    password: {
        type: string,
        required: [true, "Password is required"]
    }


}, {timestamps: "true"})



userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password , 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)
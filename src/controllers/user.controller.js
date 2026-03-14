import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
    //Generalized method for generating access and refresh tokens...
    try {

        const user = await User.findOne(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        //Now add refreshtoken to the databse of that user...
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave : false }) //After doing .save() all fields are updated and we have validation on some fields like password etc.. 
        // And here we only want to update refreshtoken field so we have done this  

        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    } 
}


const registerUser = asyncHandler(async (req , res) => {
    //Steps to register a user ::
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    
    //Getting data from request
    const {email, fullName, userName, password} = req.body;
    //avatar and coverimage cant be taken directly

    // validation - not empty
    if(
        [email , userName , fullName , password].some(field => { field?.trim() === ""})
    ){
        throw new ApiError(400, "All fields are required") 
    }
    //Instead of doing this we can check by individual if conditions also...


    // check if user already exists: username, email
    //Here we are checking if either username or email already exists or not...
    const existedUser = await User.findOne({
        $or : [{userName} , {email}]
    })
    if(existedUser){
        throw new ApiError(409, "User already existed with the given uername or email")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    //Here if we will not give cover image from input(bcs it is optional) then above line gives error : cannot read properties of undefined
    //For solving this we will check by the following code ::
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
    {
        coverImageLocalPath = req.files?.coverImage[0]?.path    
    }

    if(!avatarLocalPath){       
        throw new ApiError(400 , "Avatar file is required")
    }

    // upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //Now check whether avatar is uploaded on cloudinary or not
    //BCS avatar is required field in the databse
    //Agar avatar upload nahi hua hinga to database pakka fatega !!!!
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        email,
        password,
        userName : userName.toLowerCase(),
        avatar : avatar.url,
        coverImage : coverImage.url || ""
    })

    //check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //This code finds user by id..
    //And We dont want to give password and refreshtiken to the user in response hence we remover it by deselecting it...

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //return resonse
    return res.status(201).json(
        new ApiResponse(200 , createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req , res) => {

//Steps for login the user :: 
    //req.body => data needed for login the user 
    //Find the user 
    //Check the password 
    //Access and Refresh tookens
    //send in cookies 
    //send response

    //req.body => data needed for login the user 
    const {email , password} = req.body()
    if(!email)
    {
        throw new ApiError(400, "Email is required for login")
    }
    if(!password)
    {
        throw new ApiError(400, "Password is required for login")
    }

    //Find the user
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404, "User Does not exist")
    }

    //Check Password 
    const checkPassword = await user.isPasswordCorrect(password)
    if(!checkPassword){
        throw new error(401, "Wrong User Credentials")
    }

    //generate access and refresh tokens 
    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

    //We can not send this user in response bcs it contains all fields. We want that refreshtokens and passwords are removed...
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //Add into cookies and send response...
    const options = {           //This indicate that only serverside cookies can be modified and not on the frontend side...
        httpOnly : true,
        secure : true
    }
    res.status(200)
    .cookies("accessToken", accessToken, options)
    .cookies("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user : loggedInUser , refreshToken , accessToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req , res) => {
    //To logout current user we can do User.findById(id) but from where do we get the id of current user ??
    //For logout we need user info and pata karna padega ki user authenticated hei ya nahi...For that we will make a middleware aith.middleware.js...
    
//     Logout Controller Flow:
// 1. Identify user using req.user._id (from verifyJWT middleware)
// 2. Remove refreshToken from database using $unset
// 3. Clear accessToken and refreshToken cookies
// 4. Send success response

    // Remove refreshToken from the user's document in the database
    // req.user._id comes from verifyJWT middleware
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // $unset removes the field from the document
            }
        },
        {
            new: true // return the updated document
        }
    )

    // Cookie options used while clearing cookies
    // httpOnly → prevents client-side JavaScript from accessing the cookie (security)
    // secure → cookie is sent only over HTTPS
    const options = {
        httpOnly: true,
        secure: true
    }

    // Send response after clearing accessToken and refreshToken cookies
    return res
    .status(200)
    .clearCookie("accessToken", options)   // remove access token cookie
    .clearCookie("refreshToken", options)  // remove refresh token cookie
    .json(new ApiResponse(200, {}, "User logged Out")) // success response

})
export { registerUser , loginUser , logoutUser};
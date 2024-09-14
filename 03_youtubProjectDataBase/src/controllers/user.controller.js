import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = asyncHandler(async (req, res) => {
    
})

const registerUser = asyncHandler( async (req, res) => {
    const { fullname, email, username, password } =  req.body;
    //validation
    if(
        [fullname, username, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with emial or username already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverLocalPath = req.files?.coverImage?.[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing");
    }
    console.log("Cover image path:", coverLocalPath);

    // const avatar = await uploadOnCloudinary(avatarLocalPath);

    // let coverImage = "";
    // if(coverLocalPath){
    //     coverImage = await uploadOnCloudinary(coverLocalPath);
    // }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Uploaded avatar", avatar);
        
    } catch (error) {
        console.log("Error uploading avatar", error);
        throw new ApiError(500, "Failed to upload Avatar")
    }

    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath);
        console.log("Uploaded coverImage", coverImage);
        
    } catch (error) {
        console.log("Error uploading coverImage", error);
        throw new ApiError(500, "Failed to upload CoverImage")
    }


    try {
        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );
    
        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering user");
    
        }
    
        return res
            .status(201)
            .json(new ApiResponse(200, createdUser, "User registered successfully"))
    } catch (error) {
        console.log("User Creation failed");
        if(avatar){
            await deleteFromCloudinary(avatar.public_id);
        }

        if(coverImage){
            await deleteFromCloudinary(coverImage.public_id);
        }

        throw new ApiError(500, "Something went wrong while registering user and Images were deleted");

    }
});


// const logoutUser = asyncHandler( async (req, res) => {
//     await User.findByIdAndUpdate(
//         req.user._id,
//     )
// })


const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
     
    if(!incomingRefreshToken){
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decodeToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodeToken?._id);

        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid refresh token");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed successfully"))

    } catch (error) {
        throw new ApiError(500, "Something went wrong while refreshing access token");   
    }
})

export {
    registerUser,
    refreshAccessToken
}
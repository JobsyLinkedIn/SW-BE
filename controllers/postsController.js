import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import User from "../models/user.js";
import UserDetails from "../models/user_details.js";
import Profile from "../models/profileModel.js";

import { postModel as Post, validateCreatePost, validateEditPost } from "../models/post.js";
//import { getUserIdFromToken } from "../services/profileServices.js";
import { getUserIdFromToken } from "../utils/auth.js"


/**-------------------------------------------------------
 * 
 * @desc     Create New Post
 * @route   /api/posts
 * @method   POST
 * @access   Private [Only Logged in user]
 * 
 *-------------------------------------------------------*/
const createPostCtrl = asyncHandler(async (req, res) => {
    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];


    // TODO: Handle Uploaded Media (Implementation Pending)

    // 1️⃣ Validate Post Data with Joi
    const { error, value } = validateCreatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2️⃣ Extract validated fields from Joi
    const { content, taggedUsersIds = [], links = [], sharedPostId = null } = value;
    // validate Tagged Users is Actual user In db
    if (taggedUsersIds.length !== 0) {
        const taggedUsersCount = await User.countDocuments({ _id: { $in: taggedUsersIds } });
        if (taggedUsersCount !== taggedUsersIds.length) {
            return res.status(404).json({ message: "Not Found Tagged User" });
        }
    }
    // validate SharedPost is Actual Post In db
    if (sharedPostId) {
        const sharedPost = await Post.find({ _id: sharedPostId });
        if (sharedPost.length === 0) {
            return res.status(404).json({ message: "Not Found Shared Post" });
        }
    }

    // 3️⃣ Create and Save the Post
    const post = await Post.create({
        author: getUserIdFromToken(token), // Get user ID from token
        content,
        taggedUsers: taggedUsersIds,
        links,
        sharedPost: sharedPostId,
    });

    // 4️⃣ Return Response
    res.status(201).json({ message: "Post created successfully", createdPost: post });
});


/**-------------------------------------------------------
 * 
 * @desc     Get Single Post
 * @route   /api/posts/:id
 * @method   GET
 * @access   Public
 * 
 *-------------------------------------------------------*/
const getSinglePostCtrl = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    //TODO: Add MiddleWare: for ObjectId Validation
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "Invalid Post ID" });
    }

    const post = await Post
        .findById(postId)
        .populate("author", "name profilePicture")
        .populate("taggedUsers", "name")

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
        ...post.toObject()
    });
});


/**-------------------------------------------------------
 * 
 * @desc     Get Feed Posts
 * @route   /api/posts/
 * @method   GET
 * @access   Private [Only Logged in user]
 * 
 *-------------------------------------------------------*/
const getFeedCtrl = asyncHandler(async (req, res) => {
    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = req.headers.authorization?.split(" ")[1];
    const userId = getUserIdFromToken(token)

    // Get the list of followed users 
    const userProfile = await Profile.findOne({ userId: userId }).select("followers") || [];

    // Get the list of connections 
    const userDetails = await UserDetails.findOne({ user: userId }).select("connections") || [];

    const followedUsers = userProfile.followers || [];
    const connections = userDetails.connections || [];
    const feedUsers = [...followedUsers, ...connections, userId]; // Include self-posts

    // 📌 Pagination Parameters
    const page = parseInt(req.query.page) || 1; // Default: Page 1
    const limit = parseInt(req.query.limit) || 10; // Default: 10 posts per page
    const skip = (page - 1) * limit;

    // Fetch paginated posts
    const feedPosts = await Post
        .find({ author: { $in: feedUsers } })
        .populate("author", "name profilePicture")
        .populate("taggedUsers", "name")
        .sort({ createdAt: -1 }) // Latest posts first
        .skip(skip) // Skip previous pages
        .limit(limit); // Limit posts per page

    // Get total count for pagination metadata
    const totalPosts = await Post.countDocuments({ author: { $in: feedUsers } });

    res.status(200).json({
        posts: feedPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
    });
});

/**-------------------------------------------------------
 * 
 * @desc     Edit Post
 * @route   /api/posts/:id
 * @method   PUT
 * @access   Private [Only The Owner of Post]
 * 
 *-------------------------------------------------------*/
const editPostCtrl = asyncHandler(async (req, res) => {
    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token)

    const postId = req.params.id;
    //Make sure the post exists
    const post = await Post
        .findById(postId).populate("")
        .populate("_id")
        .populate("taggedUsers", "name")
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    //Ensure Only Author Can Edit
    if (post.author.toString() !== userId) {
        return res.status(403).json({ message: "You are not authorized to edit this post" });
    }
    // ✅ Validate Input Data (Joi Schema)
    const { error, value } = validateEditPost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { content, taggedUsersIds = [], links = [] } = value;
    // Validate Tagged Users Exist
    if (taggedUsersIds.length > 0) {
        const validUsersCount = await User.countDocuments({ _id: { $in: taggedUsersIds } });
        if (validUsersCount !== taggedUsersIds.length) {
            return res.status(400).json({ message: "One or more tagged users do not exist" });
        }
    }
    // Update Post
    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
            $set: {
                content: content,
                taggedUsers: taggedUsersIds,
                links: links,
            },
        },
        { new: true } // Return updated document
    )
        .populate("author", "name profilePicture")
        .populate("taggedUsers", "name profilePicture")
        .populate("sharedPost");

    // Return Response
    res.status(200).json({ message: "Post updated successfully", updatedPost });

})



export { createPostCtrl, getSinglePostCtrl, getFeedCtrl, editPostCtrl };


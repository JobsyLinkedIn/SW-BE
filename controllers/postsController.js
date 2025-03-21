import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import User from "../models/user.js";
import UserDetails from "../models/user_details.js";
import Profile from "../models/profileModel.js";
import { validateDocumentsExistence, areValidObjectIds } from "../utils/validateDB.js"

import { postModel as Post, validateCreatePost, validateEditPost } from "../models/post.js";
import { commentModel as Comment } from "../models/comments.js";
//import { getUserIdFromToken } from "../services/profileServices.js";
import { getUserIdFromToken } from "../utils/auth.js"


import { createPostService } from "../services/postService.js";

/**-------------------------------------------------------
 * 
 * @desc     Create New Post
 * @route   /api/posts
 * @method   POST
 * @access   Private [Only Logged in user]
 * 
 *-------------------------------------------------------*/
const createPostCtrl = asyncHandler(async (req, res) => {
    try {
        const post = await createPostService(req);
        res.status(201).json({ message: "Post created successfully", createdPost: post });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
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

/**-------------------------------------------------------
 * 
 * @desc     Like/Unlike Post 
 * @route   /api/posts/like/:postId
 * @method   PUT
 * @access   Private [Only Logged in User]
 * 
 *-------------------------------------------------------*/
const likePostCtrl = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    //const userId = req.user.id; // Extracted from authenticated request
    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token)

    // ✅ Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    // ✅ Check if the user has already liked the post
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
        // 👎 Remove Like
        await Post.findByIdAndUpdate(postId, {
            $pull: { likes: userId },
            $inc: { likesCount: -1 }
        });

        return res.status(200).json({ message: "Post unliked successfully" });
    } else {
        // 👍 Add Like
        await Post.findByIdAndUpdate(postId, {
            $addToSet: { likes: userId },
            $inc: { likesCount: 1 }
        });

        return res.status(200).json({ message: "Post liked successfully" });
    }
});

/**-------------------------------------------------------
 * 
 * @desc     add comment to Post 
 * @route   /api/posts/comment/:id
 * @method   POST
 * @access   Private [Only Logged in User]
 * 
 *-------------------------------------------------------*/


const addCommentCtrl = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const { content = null, taggedUsersIds = [] } = req.body;

    // ✅ Extract user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    // ✅ Validate ObjectIds before querying the database
    if (!areValidObjectIds([postId, userId, ...taggedUsersIds])) {
        return res.status(400).json({ message: "Invalid ID(s) provided" });
    }

    // ✅ Check if post exists
    const postExists = await validateDocumentsExistence(Post, [postId]);
    if (!postExists) {
        return res.status(404).json({ message: "Post not found" });
    }

    // ✅ Ensure comment is not empty
    if ((!content || content.trim() === "") && taggedUsersIds.length === 0) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }


    // ✅ Check if all tagged users exist
    if (taggedUsersIds.length > 0) {
        const taggedUsersExist = await validateDocumentsExistence(User, taggedUsersIds);
        if (!taggedUsersExist) {
            return res.status(404).json({ message: "Tagged users not found" });
        }
    }

    // ✅ Check if the user exists
    const userExists = await validateDocumentsExistence(User, [userId]);
    if (!userExists) {
        return res.status(404).json({ message: "User not found" });
    }

    // ✅ Create the new comment
    const comment = await Comment.create({
        author: userId,
        post: postId,
        content,
        taggedUsers: taggedUsersIds
    });

    // ✅ Update the post with the new comment
    await Post.findByIdAndUpdate(postId, {
        $push: { comments: comment._id }, // Add comment to post's comments array
        $inc: { commentsCount: 1 } // Increment comment count
    });

    res.status(201).json({ message: "Comment added successfully", comment });
});

/**-------------------------------------------------------
 * 
 * @desc     Delete comment 
 * @route   /api/posts/comment/:id
 * @method   DELETE
 * @access   Private [Only Comment Writer]
 * 
 *-------------------------------------------------------*/
const deleteCommentCtrl = asyncHandler(async (req, res) => {
    const commentId = req.params.id;

    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    // ✅ Extract user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    // ✅ Validate IDs
    if (!areValidObjectIds([commentId, userId])) {
        return res.status(400).json({ message: "Invalid ID(s) provided" });
    }

    // ✅ Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // ✅ Ensure User is Author or Admin
    const user = await User.findById(userId).lean();

    if (comment.author.toString() !== userId && !isAdmin) {
        return res.status(403).json({ message: "Forbidden: You cannot delete this comment" });
    }

    // ✅ Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // ✅ Remove comment reference from post and decrement count
    await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId },
        $inc: { commentsCount: -1 }
    });

    res.status(200).json({ message: "Comment deleted successfully" });
});




/**-------------------------------------------------------
 * 
 * @desc     Edit comment 
 * @route   /api/posts/comment/:id
 * @method   PUT
 * @access   Private [Only Comment Writer]
 * 
 *-------------------------------------------------------*/

const editCommentCtrl = asyncHandler(async (req, res) => {
    const commentId = req.params.id;
    const { content = null, taggedUsersIds = [] } = req.body;

    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    // ✅ Extract user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    // ✅ Validate IDs
    if (!areValidObjectIds([commentId, userId, ...taggedUsersIds])) {
        return res.status(400).json({ message: "Invalid ID(s) provided" });
    }

    // ✅ Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // ✅ Ensure User is the Author
    if (comment.author.toString() !== userId) {
        return res.status(403).json({ message: "Forbidden: You cannot edit this comment" });
    }

    // ✅ Ensure Comment is not empty
    if (!content && taggedUsersIds.length === 0) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // ✅ Validate Tagged Users Exist
    if (taggedUsersIds.length > 0) {
        const taggedUsersExist = await validateDocumentsExistence(User, taggedUsersIds);
        if (!taggedUsersExist) {
            return res.status(404).json({ message: "Tagged users not found" });
        }
    }

    // ✅ Update the comment
    comment.content = content;
    comment.taggedUsers = taggedUsersIds;
    await comment.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
});


/**
 *
 * @desc    Get comments of a post with pagination.
 * @route   GET /api/posts/:id/comments
 * @method  GET
 * @access  Private [Only Logged In Users]
 * @query   page (default: 1), limit (default: 10)
 */
const getPostCommentsCtrl = asyncHandler(async (req, res) => {
    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    // ✅ Extract user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    const postId = req.params.id;
    let { page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // Validate post ID
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
    }

    // Check if post exists
    const postExists = await Post.findById(postId);
    if (!postExists) {
        return res.status(404).json({ message: "Post not found" });
    }

    // Get total comments count
    const totalComments = await Comment.countDocuments({ post: postId });

    // Fetch comments with pagination
    const comments = await Comment.find({ post: postId })
        .populate("author", "name profilePicture") // Populate author details
        .populate("taggedUsers", "name")
        .sort({ createdAt: -1 }) // Show latest comments first
        .skip((page - 1) * limit) // Skip previous pages
        .limit(limit); // Limit number of results per page

    res.status(200).json({
        totalComments,
        page,
        totalPages: Math.ceil(totalComments / limit),
        comments,
    });
});


/**
 * @desc Get users who liked a post
 * @route GET /api/posts/:id/likes
 * @access Public
 * * @query   page (default: 1), limit (default: 10)
 */
const getPostLikesCtrl = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const { page = 1, limit = 10 } = req.query;

    // Validate postId
    if (!areValidObjectIds([postId])) {
        return res.status(400).json({ message: "Invalid Post ID" });
    }

    // Find the post and populate likes
    const post = await Post.findById(postId).populate({
        path: "likes",
        select: "name profilePicture", // Choose fields to return
        options: {
            skip: (page - 1) * limit,
            limit: parseInt(limit),
        },
    });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
        message: "Post likes retrieved successfully",
        likes: post.likes,
    });
});

/**
 * @desc    Get users who shared a specific post
 * @route   GET /api/posts/:id/shares
 * @access  Public
 *  @query   page (default: 1), limit (default: 10)
 */
const getPostSharesCtrl = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const { page = 1, limit = 10 } = req.query;

    // Validate postId
    if (!areValidObjectIds([postId])) {
        return res.status(400).json({ message: "Invalid Post ID" });
    }

    // Find the post and populate likes
    const post = await Post.findById(postId).populate({
        path: "shares",
        select: "name profilePicture", // Choose fields to return
        options: {
            skip: (page - 1) * limit,
            limit: parseInt(limit),
        },
    });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
        message: "Post likes retrieved successfully",
        likes: post.likes,
    });
});

export { createPostCtrl, getSinglePostCtrl, getFeedCtrl, editPostCtrl, likePostCtrl, addCommentCtrl, deleteCommentCtrl, editCommentCtrl, getPostCommentsCtrl, getPostLikesCtrl, getPostSharesCtrl };





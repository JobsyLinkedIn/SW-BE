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


import {
    createPostService, getSinglePostService, editPostService,
    likePostService, addCommentService, deleteCommentService, editCommentService,
    getPostCommentsService, getPostLikesService, getPostSharesService
    , sharePostService, getFeedService
} from "../services/postService.js";

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
    // Extract and validate token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    const { content, taggedUsersIds = [], links = [] } = req.body;

    const post = await createPostService({ userId, content, taggedUsersIds, links });

    res.status(201).json({ message: "Post created successfully", post });
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
    try {
        const postId = req.params.id;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid Post ID" });
        }

        // Call service function
        const post = await getSinglePostService(postId);

        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});



/**
 * @desc     Get Feed Posts
 * @route    /api/posts/
 * @method   GET
 * @access   Private [Only Logged in user]
 */
const getFeedCtrl = asyncHandler(async (req, res) => {
    // Extract and validate token
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = req.headers.authorization.split(" ")[1];
    const userId = getUserIdFromToken(token);

    // Extract query parameters (pagination)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Call the service to get feed posts
    const feedData = await getFeedService(userId, page, limit);

    res.status(200).json(feedData);
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
    try {
        // Extract and validate token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        const token = authHeader.split(" ")[1];
        const userId = getUserIdFromToken(token);

        // Extract post ID and request body
        const postId = req.params.id;
        const postData = { ...req.body, userId };

        // Call service function
        const updatedPost = await editPostService(postId, postData);

        // Return response
        res.status(200).json({ message: "Post updated successfully", updatedPost });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


/**-------------------------------------------------------
 * 
 * @desc     Like/Unlike Post 
 * @route   /api/posts/like/:postId
 * @method   PUT
 * @access   Private [Only Logged in User]
 * 
 *-------------------------------------------------------*/
const likePostCtrl = asyncHandler(async (req, res) => {
    const postId = req.params.postId;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const error = new Error("Unauthorized: No token provided");
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    const response = await likePostService(postId, userId);

    res.status(200).json(response);
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
    const postId = req.params.postId;
    const { content = null, taggedUsersIds = [] } = req.body;

    // Extract user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    // Call Service
    const comment = await addCommentService({ postId, userId, content, taggedUsersIds });

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
    const commentId = req.params.commentId;

    // ✅ Extract user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    // ✅ Call service function
    await deleteCommentService(commentId, userId);

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
    const commentId = req.params.commentId;
    const { content = null, taggedUsersIds = [] } = req.body;

    // ✅ Extract user ID from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    // ✅ Call Service
    const updatedComment = await editCommentService(commentId, { content, taggedUsersIds, userId });

    res.status(200).json({ message: "Comment updated successfully", updatedComment });
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);

    const postId = req.params.postId;
    let { page = 1, limit = 10 } = req.query;

    // Convert to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // ✅ Call Service
    const { totalComments, totalPages, comments } = await getPostCommentsService(postId, page, limit);

    res.status(200).json({ totalComments, page, totalPages, comments });
});



/**
 * @desc Get users who liked a post
 * @route GET /api/posts/:id/likes
 * @access Public
 * * @query   page (default: 1), limit (default: 10)
 */

const getPostLikesCtrl = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    let { page = 1, limit = 10 } = req.query;

    // Convert to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // ✅ Call Service
    const likes = await getPostLikesService(postId, page, limit);

    res.status(200).json({
        message: "Post likes retrieved successfully",
        likes,
    });
});



/**
 * @desc    Get users who shared a specific post
 * @route   GET /api/posts/:id/shares
 * @access  Public
 *  @query   page (default: 1), limit (default: 10)
 */

const getPostSharesCtrl = asyncHandler(async (req, res) => {
    const postId = req.params.postId;
    let { page = 1, limit = 10 } = req.query;

    // Convert to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // ✅ Call Service
    const shares = await getPostSharesService(postId, page, limit);

    res.status(200).json({
        message: "Post shares retrieved successfully",
        shares,
    });
});

/**-------------------------------------------------------
 * 
 * @desc     Share  Post
 * @route    /api/posts/:id/shares
 * @method   POST
 * @access   Private [Only Logged in User]
 * 
 *-------------------------------------------------------*/
const sharePostCtrl = asyncHandler(async (req, res) => {

    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    // Extract and validate token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);
    const sharedPostId = req.params.postId;
    const { content = "", taggedUsersIds = [] } = req.body;

    const sharedPost = await sharePostService({ userId, sharedPostId, content, taggedUsersIds });

    res.status(201).json({ message: "Post shared successfully", sharedPost });
});




export {
    createPostCtrl, getSinglePostCtrl, getFeedCtrl,
    editPostCtrl, likePostCtrl, addCommentCtrl, deleteCommentCtrl,
    editCommentCtrl, getPostCommentsCtrl,
    getPostLikesCtrl, getPostSharesCtrl, sharePostCtrl,
};





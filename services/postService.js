// services/postService.js
import mongoose from "mongoose";
import { postModel as Post, validateCreatePost, validateEditPost } from "../models/post.js";
import { commentModel as Comment } from "../models/comments.js";
import User from "../models/user.js";
import { getUserIdFromToken } from "../utils/auth.js";
import { validateDocumentsExistence, areValidObjectIds } from "../utils/validateDB.js"


const createPostService = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized: No token provided");
    }
    const token = authHeader.split(" ")[1];

    // TODO: Handle Uploaded Media (Implementation Pending)

    // 1️⃣ Validate Post Data with Joi
    const { error, value } = validateCreatePost(req.body);
    if (error) {
        throw new Error(error.details[0].message);
    }

    // 2️⃣ Extract validated fields from Joi
    const { content, taggedUsersIds = [], links = [], sharedPostId = null } = value;

    // Validate Tagged Users are actual users in the DB
    if (taggedUsersIds.length !== 0) {
        const taggedUsersCount = await User.countDocuments({ _id: { $in: taggedUsersIds } });
        if (taggedUsersCount !== taggedUsersIds.length) {
            throw new Error("Not Found Tagged User");
        }
    }

    // Validate SharedPost exists in the DB
    if (sharedPostId) {
        const sharedPost = await Post.findById(sharedPostId);
        if (!sharedPost) {
            throw new Error("Shared post not found");
        }

        // ✅ Add the user to the shares array & increment the count
        await Post.findByIdAndUpdate(
            sharedPostId,
            {
                $addToSet: { shares: getUserIdFromToken(token) }, // Prevents duplicates
                $inc: { sharesCount: 1 } // Keeps a numeric count
            }
        );
    }

    // 3️⃣ Create and Save the Post
    const post = await Post.create({
        author: getUserIdFromToken(token),
        content,
        taggedUsers: taggedUsersIds,
        links,
        sharedPost: sharedPostId,
    });

    return post;
};


const getSinglePostService = async (postId) => {
    const post = await Post
        .findById(postId)
        .populate("author", "name profilePicture")
        .populate("taggedUsers", "name");

    if (!post) {
        throw new Error("Post not found");
    }

    return post.toObject();
};


const editPostService = async (postId, { content, taggedUsersIds = [], links = [], userId }) => {
    // Ensure post exists
    const post = await Post.findById(postId).populate("taggedUsers", "name");
    if (!post) {
        throw new Error("Post not found");
    }

    // Ensure only author can edit
    if (post.author.toString() !== userId) {
        throw new Error("You are not authorized to edit this post");
    }

    // Validate input data
    const { error } = validateEditPost({ content, taggedUsersIds, links });
    if (error) {
        throw new Error(error.details[0].message);
    }

    // Validate tagged users exist
    if (taggedUsersIds.length > 0) {
        const validUsersCount = await User.countDocuments({ _id: { $in: taggedUsersIds } });
        if (validUsersCount !== taggedUsersIds.length) {
            throw new Error("One or more tagged users do not exist");
        }
    }

    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $set: { content, taggedUsers: taggedUsersIds, links } },
        { new: true }
    )
        .populate("author", "name profilePicture")
        .populate("taggedUsers", "name profilePicture")
        .populate("sharedPost");

    return updatedPost;
};
const likePostService = async (postId, userId) => {
    // ✅ Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
    }
    // ✅ Check if the user has already liked the post
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
        await Post.findByIdAndUpdate(postId, {
            $pull: { likes: userId },
            $inc: { likesCount: -1 },
        });
        return { message: "Post unliked successfully" };
    } else {
        await Post.findByIdAndUpdate(postId, {
            $addToSet: { likes: userId },
            $inc: { likesCount: 1 },
        });
        return { message: "Post liked successfully" };
    }
};

const addCommentService = async ({ postId, userId, content = null, taggedUsersIds = [] }) => {
    // Validate ObjectIds before querying the database
    // ✅ Validate ObjectIds before querying the database (keeping your function)
    if (!areValidObjectIds([postId, userId, ...taggedUsersIds])) {
        const error = new Error("Invalid ID(s) provided");
        error.statusCode = 400;
        throw error;
    }

    // Check if post exists
    const postExists = await Post.findById(postId);
    if (!postExists) {
        const error = new Error("Post not found");
        error.statusCode = 404;
        throw error;
    }

    // Ensure comment is not empty
    if ((!content || content.trim() === "") && taggedUsersIds.length === 0) {
        const error = new Error("Comment cannot be empty");
        error.statusCode = 400;
        throw error;
    }

    // Check if all tagged users exist
    if (taggedUsersIds.length > 0) {
        const validUsersCount = await User.countDocuments({ _id: { $in: taggedUsersIds } });
        if (validUsersCount !== taggedUsersIds.length) {
            const error = new Error("Tagged users not found");
            error.statusCode = 404;
            throw error;
        }
    }

    // Check if the user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Create the new comment
    const comment = await Comment.create({
        author: userId,
        post: postId,
        content,
        taggedUsers: taggedUsersIds
    });

    // Update the post with the new comment
    await Post.findByIdAndUpdate(postId, {
        $push: { comments: comment._id },
        $inc: { commentsCount: 1 }
    });

    return comment;
};


const deleteCommentService = async (commentId, userId) => {
    // ✅ Validate ObjectIds before querying the database (keeping your function)
    if (!areValidObjectIds([commentIds, userId])) {
        const error = new Error("Invalid ID(s) provided");
        error.statusCode = 400;
        throw error;
    }

    // ✅ Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    // ✅ Ensure User is Author or Admin
    const user = await User.findById(userId).lean();
    if (comment.author.toString() !== userId && !user?.isAdmin) {
        throw new Error("Forbidden: You cannot delete this comment");
    }

    // ✅ Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // ✅ Remove comment reference from post and decrement count
    await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId },
        $inc: { commentsCount: -1 }
    });
};



const editCommentService = async (commentId, { content, taggedUsersIds = [], userId }) => {
    // ✅ Validate IDs
    if (!areValidObjectIds([commentId, userId, ...taggedUsersIds])) {
        throw { status: 400, message: "Invalid ID(s) provided" };
    }

    // ✅ Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) throw { status: 404, message: "Comment not found" };

    // ✅ Ensure User is the Author
    if (comment.author.toString() !== userId) {
        throw { status: 403, message: "Forbidden: You cannot edit this comment" };
    }

    // ✅ Ensure Comment is not empty
    if (!content && taggedUsersIds.length === 0) {
        throw { status: 400, message: "Comment cannot be empty" };
    }

    // ✅ Validate Tagged Users Exist
    if (taggedUsersIds.length > 0) {
        const taggedUsersExist = await validateDocumentsExistence(User, taggedUsersIds);
        if (!taggedUsersExist) {
            throw { status: 404, message: "Tagged users not found" };
        }
    }

    // ✅ Update the comment
    comment.content = content;
    comment.taggedUsers = taggedUsersIds;
    await comment.save();

    return comment;
};




const getPostCommentsService = async (postId, page, limit) => {
    // ✅ Validate post ID
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "Invalid post ID" };
    }

    // ✅ Check if post exists
    const postExists = await Post.findById(postId);
    if (!postExists) {
        throw { status: 404, message: "Post not found" };
    }

    // ✅ Get total comments count
    const totalComments = await Comment.countDocuments({ post: postId });

    // ✅ Fetch comments with pagination
    const comments = await Comment.find({ post: postId })
        .populate("author", "name profilePicture")
        .populate("taggedUsers", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { totalComments, totalPages: Math.ceil(totalComments / limit), comments };
};



const getPostLikesService = async (postId, page, limit) => {
    // ✅ Validate postId
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "Invalid Post ID" };
    }

    // ✅ Find the post and populate likes
    const post = await Post.findById(postId).populate({
        path: "likes",
        select: "name profilePicture",
        options: {
            skip: (page - 1) * limit,
            limit: limit,
        },
    });

    if (!post) {
        throw { status: 404, message: "Post not found" };
    }

    return post.likes;
};


const getPostSharesService = async (postId, page, limit) => {
    // ✅ Validate postId
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        throw { status: 400, message: "Invalid Post ID" };
    }

    // ✅ Find the post and populate shares
    const post = await Post.findById(postId).populate({
        path: "shares",
        select: "name profilePicture",
        options: {
            skip: (page - 1) * limit,
            limit: limit,
        },
    });

    if (!post) {
        throw { status: 404, message: "Post not found" };
    }

    return post.shares;
};






export { createPostService, getSinglePostService, editPostService, likePostService, addCommentService, deleteCommentService, editCommentService, getPostCommentsService, getPostLikesService, getPostSharesService };

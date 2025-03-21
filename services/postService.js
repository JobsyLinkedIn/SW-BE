// services/postService.js
import { postModel as Post, validateCreatePost, validateEditPost } from "../models/post.js";
import User from "../models/user.js";
import { getUserIdFromToken } from "../utils/auth.js";

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



export { createPostService, getSinglePostService, editPostService };

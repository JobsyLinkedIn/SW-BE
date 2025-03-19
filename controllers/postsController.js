import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken"
import { postModel, validateCreatePost } from "../models/post.js";
//import { getUserIdFromToken } from "../services/profileServices.js";

const getUserIdFromToken = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
};

/**-------------------------------------------------------
 * 
 * @desc     Create New Post
 * @route   /api/posts
 * @method   POST
 * @access   Private [Only Logged in user]
 * 
 *-------------------------------------------------------*/
const createPostCtrl = asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    // TODO: Handle Uploaded Media (Implementation Pending)

    // 1️⃣ Validate Post Data with Joi
    const { error, value } = validateCreatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2️⃣ Extract validated fields from Joi
    const { content, taggedUsersIds = [], links = [], sharedPostId = null } = value;

    // 3️⃣ Create and Save the Post
    const post = await postModel.create({
        author: getUserIdFromToken(token), // Get user ID from token
        content,
        taggedUsers: taggedUsersIds,
        links,
        sharedPost: sharedPostId,
    });

    // 4️⃣ Return Response
    res.status(201).json({ message: "Post created successfully", createdPost: post });
});

export { createPostCtrl };


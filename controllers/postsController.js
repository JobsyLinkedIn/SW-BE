const asyncHandler = require("express-async-handler");
const { postModel, validateCreatePost } = require("../models/post");

/**-------------------------------------------------------
 * 
 * @desc     Create New Post
 * @route   /api/posts
 * @method   POST
 * @access   Private [Only Logged in user]
 * 
 *-------------------------------------------------------*/

module.exports.createPostCtrl = asyncHandler(async (req, res) => {
    // 1. Validate Post Data
    const { error } = validateCreatePost(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Validate Tagged Users
    const taggedUsersIds = req.body.taggedUsersIds || [];
    for (let userId of taggedUsersIds) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID in taggedUsersIds" });
        }
    }

    // 3. Validate Shared Post ID (if provided)
    const sharedPostId = req.body.sharedPostId || null;
    if (sharedPostId && !mongoose.Types.ObjectId.isValid(sharedPostId)) {
        return res.status(400).json({ message: "Invalid sharedPostId" });
    }

    // 4. Validate Links (if provided)
    const links = req.body.links || [];
    for (let link of links) {
        if (!link.url || typeof link.url !== "string") {
            return res.status(400).json({ message: "Invalid link URL" });
        }
        link.title = link.title || link.url; // Default title to URL if missing
    }

    // 5. Create and Save the Post
    const post = await postModel.create({
        author: req.user.id, // req.user is set from authentication middleware
        content: req.body.content,
        taggedUsers: taggedUsersIds,
        links: links,
        sharedPost: sharedPostId
    });

    // 6. Return Response
    res.status(201).json({ message: "Post created successfully", createdPost: post });
});

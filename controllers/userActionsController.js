import asyncHandler from "express-async-handler"
import { getUserIdFromToken } from "../utils/auth.js"
import { savePostService, unsavePostService, getSavedPostsService } from "../services/userActionsServices.js"
/**-------------------------------------------------------
 * 
 * @desc     Save Post 
 * @route   /api/user/actions/save-post/:postId
 * @method   PUT
 * @access   Private [Only Logged in User]s
 * 
 *-------------------------------------------------------*/
const savePostCtrl = asyncHandler(async (req, res) => {
    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    // Extract and validate token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);
    const postId = req.params.postId;

    await savePostService(userId, postId);

    res.status(200).json({ message: "Post saved successfully" });
});
/**-------------------------------------------------------
 * 
 * @desc     UnSave Post 
 * @route   /api/user/actions/save-post/:postId
 * @method   DELETE
 * @access   Private [Only Logged in User]
 * 
 *-------------------------------------------------------*/
const unsavePostCtrl = asyncHandler(async (req, res) => {
    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    // Extract and validate token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);
    const postId = req.params.postId;

    await unsavePostService(userId, postId);

    res.status(200).json({ message: "Post unsaved successfully" });
});
/**-------------------------------------------------------
 * 
 * @desc     Get Saves Posts 
 * @route   /api/user/actions/saved-posts
 * @method   GET
 * @access   Private [Only Logged in User]
 * 
 *-------------------------------------------------------*/
const getSavedPostsCtrl = asyncHandler(async (req, res) => {
    //TODO : Add MiddleWare to Handle Token Verifecation and Toekn Payload Extraction
    // Extract and validate token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const userId = getUserIdFromToken(token);
    const { page = 1, limit = 10 } = req.query;

    const savedPosts = await getSavedPostsService(userId, parseInt(page), parseInt(limit));

    res.status(200).json({ message: "Saved posts retrieved successfully", savedPosts });
});

export { getSavedPostsCtrl, savePostCtrl, unsavePostCtrl }
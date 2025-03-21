import express from "express";
import { createPostCtrl, getFeedCtrl, getSinglePostCtrl, editPostCtrl, likePostCtrl, addCommentCtrl, deleteCommentCtrl, editCommentCtrl, getPostCommentsCtrl, getPostLikesCtrl, getPostSharesCtrl } from "../controllers/postsController.js"
const router = express.Router()

// api/posts
router.route("/")
    .get(getFeedCtrl)
    .post(createPostCtrl) //We shoule Use Verify Token MiddleWare First

// api/posts/:id
router.route("/:id")
    .get(getSinglePostCtrl)
    .put(editPostCtrl)

// api/posts/like/:id
router.route("/like/:id")
    .put(likePostCtrl)

// api/posts/comment/:id
router.route("/comment/:id")
    .post(addCommentCtrl)
    .delete(deleteCommentCtrl)
    .put(editCommentCtrl)

// Route to fetch comments of a specific post with pagination
router.get("/:id/comments", getPostCommentsCtrl);

// Route to fetch users who make like to  a specific post with pagination
router.get("/:id/likes", getPostLikesCtrl);
// Route to fetch users who make share to  a specific post with pagination
router.get("/:id/shares", getPostSharesCtrl);
export default router
import express from "express";
import { createPostCtrl, getFeedCtrl, getSinglePostCtrl, editPostCtrl, likePostCtrl } from "../controllers/postsController.js"
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

export default router
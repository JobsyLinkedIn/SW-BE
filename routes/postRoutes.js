import express from "express";
import { createPostCtrl, getFeedCtrl, getSinglePostCtrl } from "../controllers/postsController.js"
const router = express.Router()

// api/posts
router.route("/")
    .get(getFeedCtrl)
    .post(createPostCtrl) //We shoule Use Verify Token MiddleWare First

// api/posts/:id
router.route("/:id")
    .get(getSinglePostCtrl)

export default router
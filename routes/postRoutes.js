import express from "express";
import { createPostCtrl } from "../controllers/postsController.js"
const router = express.Router()

// api/posts
router.route("/")
    .post(createPostCtrl) //We shoule Use Verify Token MiddleWare First

export default router
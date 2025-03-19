import mongoose from "mongoose";
const Joi = require("joi")

const PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    media: [
        {
            type: {
                type: String,
                enum: ["image", "video", "document"],
            },
            url: {
                type: String,
                default: "", // Default empty string if no media is uploaded
            },
            publicId: {
                type: String,
                default: "", // Used for deletion from Cloudinary
            },
        },
    ],
    links: [{
        url: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            default: "",
        }
    }
    ],
    taggedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
    shares:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
        ],
    savedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    sharedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", // References the original post being shared
        default: null,
    },
},
    { timestamps: true }
);

const postModel = mongoose.model("Post", PostSchema);

//Validate Create Post
function validateCreatePost(obj) {
    const schema = Joi.object({
        content: Joi.string().trim().required().messages({
            "any.required": "Content is required.",
            "string.empty": "Content cannot be empty.",
        }),
    })
    return schema.validate(obj);
}

module.exports = { postModel, validateCreatePost }

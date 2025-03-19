import mongoose from "mongoose";
import Joi from "joi";

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


// Validate Create Post
function validateCreatePost(obj) {
    const schema = Joi.object({
        content: Joi.string().trim().required().messages({
            "any.required": "Content is required.",
            "string.empty": "Content cannot be empty.",
        }),
        links: Joi.array()
            .items(
                Joi.object({
                    url: Joi.string().uri().required().messages({
                        "any.required": "Each link must have a URL.",
                        "string.uri": "Invalid URL format.",
                    }),
                    title: Joi.string().optional().allow(""),
                })
            )
            .optional(),
        taggedUsersIds: Joi.array()
            .items(
                Joi.string()
                    .custom((value, helpers) => {
                        if (!mongoose.Types.ObjectId.isValid(value)) {
                            return helpers.error("any.invalid");
                        }
                        return value;
                    }, "MongoDB ObjectId validation")
            )
            .optional()
            .messages({ "any.invalid": "Invalid User ID in taggedUsersIds." }),
        sharedPostId: Joi.string()
            .custom((value, helpers) => {
                if (value && !mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.error("any.invalid");
                }
                return value;
            }, "MongoDB ObjectId validation")
            .optional()
            .messages({ "any.invalid": "Invalid sharedPostId." }),
    });

    return schema.validate(obj);
}

export { postModel, validateCreatePost }

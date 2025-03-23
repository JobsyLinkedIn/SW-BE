import mongoose from "mongoose";
import dotenv from "dotenv";
import { postModel as Post } from "../models/post.js";
import User from "../models/user.js";

const seedPosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const posts = await Post.find();
        if (posts.length > 0) {
            console.log("Posts already exist. Seeding skipped.");
            return;
        }

        // Fetch all existing users
        const users = await User.find();
        if (users.length === 0) {
            console.log("No users found. Seeding skipped.");
            return;
        }

        let numberOfCreatedPosts = 3;

        for (let index = 0; index < numberOfCreatedPosts; index++) {
            // Shuffle users to avoid selecting the same user multiple times
            let shuffledUsers = [...users].sort(() => 0.5 - Math.random());

            let randomUser = shuffledUsers[0]; // Author
            let randomTaggedUser = shuffledUsers[1] || shuffledUsers[0]; // Ensure valid selection
            let randomUserShareThePost = shuffledUsers[1] || shuffledUsers[0]; // Avoid undefined
            let randomUserLikeThePost = shuffledUsers[1] || shuffledUsers[0]; // Avoid undefined

            const post = new Post({
                content: `Post ${index + 1} Content`,
                author: randomUser._id,
                taggedUsers: [randomTaggedUser._id],
                shares: [randomUserShareThePost._id],
                likes: [randomUserLikeThePost._id],
                likesCount: 1,
                sharesCount: 1,
            });

            if (index > 0) {
                // Randomly decide whether to share a post
                if (Math.random() < 0.5) {
                    const totalPosts = await Post.countDocuments();
                    if (totalPosts > 0) {
                        const randomPost = await Post.findOne().skip(Math.floor(Math.random() * totalPosts));
                        if (randomPost) {
                            post.sharedPost = randomPost._id;
                        }
                    }
                }
            }

            await post.save();
        }

        console.log(`${numberOfCreatedPosts} posts seeded successfully.`);
    } catch (error) {
        console.error("Seeding Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

export default seedPosts;

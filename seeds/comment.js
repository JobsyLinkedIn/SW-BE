import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { commentModel as Comment } from '../models/comments.js';
import { postModel as Post } from '../models/post.js';
import User from '../models/user.js';

const seedComments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const comments = await Comment.find();
    if (comments.length > 0) {
      console.log('Comments already exist. Seeding skipped.');
      return;
    }

    const users = await User.find();
    const posts = await Post.find();

    if (users.length === 0 || posts.length === 0) {
      console.log('No users or posts found. Seeding skipped.');
      return;
    }

    let numberOfComments = 5;

    for (let index = 0; index < numberOfComments; index++) {
      // Shuffle users to pick a random author
      let shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      let author = shuffledUsers[0];
      let taggedUser = shuffledUsers[1] || shuffledUsers[0]; // Ensure valid selection

      // Select a random post to comment on
      let randomPost = posts[Math.floor(Math.random() * posts.length)];

      const comment = new Comment({
        author: author._id,
        post: randomPost._id,
        content: `Comment ${index + 1} on post ${randomPost.content}`,
        taggedUsers: [taggedUser._id],
        likes: [],
        replies: [],
      });

      await comment.save();

      // Attach the comment to the post
      randomPost.comments = randomPost.comments || [];
      randomPost.comments.push(comment._id);
      await randomPost.save();
    }

    console.log(`${numberOfComments} comments seeded successfully.`);
  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

export default seedComments;

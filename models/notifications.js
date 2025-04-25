import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,  //receiver
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,  // sender
    },
    type: {
      type: String,
      enum: ['react', 'comment', 'message', 'connection', 'mention'],  
      required: true,
    },
    content: {
      type: String,
      required: true, 
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: false, 
    },
    redirectUrl: {
      type: String,
      required: false,  
    },
    isRead: {
      type: Boolean,
      default: false,  
    }
  },
  { timestamps: true } 
);

const notifications = mongoose.model('Notification', NotificationSchema);

export { notifications };

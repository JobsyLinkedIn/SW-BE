import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Conversation',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: false,
    },
    media: {
      type: {
        type: String,
      },
      url: {
        type: String,
        default: '', // Default empty string if no media is uploaded
      },
      publicId: {
        type: String,
        default: '', // Used for deletion from Cloudinary
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isBlockedMessage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export { Message };

import reportPost from '../../services/privacy/report_post_service.js';
import { postModel as Post } from '../../models/post.js';
import { createReport } from '../../services/reportServices.js';
import mongoose from 'mongoose';

jest.mock('../../models/post.js');
jest.mock('../../services/reportServices.js');

describe('reportPost', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the post is not found', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const postId = new mongoose.Types.ObjectId();
    const reason = 'spam';

    Post.findById.mockResolvedValueOnce(null);

    await expect(reportPost(reporterId, postId, reason)).rejects.toThrow('Post not found');
    expect(Post.findById).toHaveBeenCalledWith(postId);
  });

  it('should throw an error if the reason is invalid', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const postId = new mongoose.Types.ObjectId();
    const reason = 'invalid-reason';

    Post.findById.mockResolvedValueOnce({});

    await expect(reportPost(reporterId, postId, reason)).rejects.toThrow('Invalid report reason');
    expect(Post.findById).toHaveBeenCalledWith(postId);
  });

  it('should throw an error if the post is already reported by the user', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const postId = new mongoose.Types.ObjectId();
    const reason = 'spam';

    const mockPost = {
      reportedBy: [{ reporterId }],
      save: jest.fn(),
    };

    Post.findById.mockResolvedValueOnce(mockPost);

    await expect(reportPost(reporterId, postId, reason)).rejects.toThrow('You already reported this post');
    expect(Post.findById).toHaveBeenCalledWith(postId);
  });

  it('should successfully report a post', async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const postId = new mongoose.Types.ObjectId();
    const reason = 'spam';

    const mockPost = {
      reportedBy: [],
      save: jest.fn().mockResolvedValueOnce(),
    };

    Post.findById.mockResolvedValueOnce(mockPost);
    createReport.mockResolvedValueOnce();

    await reportPost(reporterId, postId, reason);

    expect(mockPost.reportedBy).toHaveLength(1);
    expect(mockPost.reportedBy[0]).toMatchObject({ reporterId, reason });
    expect(mockPost.save).toHaveBeenCalled();
    expect(createReport).toHaveBeenCalledWith({
      type: 'post',
      targetId: postId,
      reason,
      details: '',
      reportedBy: reporterId,
    });
  });
});
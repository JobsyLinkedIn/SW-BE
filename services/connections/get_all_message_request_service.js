
import MessageRequest from '../../models/messages.js';

const get_message_requests = async (userId) => {
    try {
      const messageRequests = await MessageRequest.find({ to: userId })
        .populate('from', 'name email')  
        .populate('to', 'name email')   
        .exec();
      return messageRequests;
    } catch (error) {
      throw new Error('Error fetching message requests');
    }
  };
  
  export default get_message_requests;
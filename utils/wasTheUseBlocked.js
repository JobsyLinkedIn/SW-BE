import UserDetails from '../models/user_details.js';
import { areValidObjectIds } from './validateDB.js';
const wasTheUserBlocked = async (blockerId, blockedId) => {
  console.log(blockerId, blockedId);

  try {
    if (!areValidObjectIds([blockerId, blockedId])) {
      console.log(blockerId, blockedId);
      throw new Error('Users not found');
    }
    const blocker = await UserDetails.findById(blockerId);
    const wasBlocked = blocker?.blockedUsers?.includes(blockedId);
    return !!wasBlocked;
  } catch (error) {
    throw error;
  }
};
export { wasTheUserBlocked };

import UserDetails from "../../models/user_details.js";

export const getBlockedUsers = async (userId) => {
    try {
        const userDetails = await UserDetails.findOne({ user: userId }).populate('blockedUsers');

        if (!userDetails) {
            throw new Error('User not found');
        }

        return userDetails.blockedUsers; 
    } catch (error) {
        throw new Error(`Error retrieving blocked users: ${error.message}`);
    }
};
export default getBlockedUsers;

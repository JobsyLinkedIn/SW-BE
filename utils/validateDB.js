import mongoose from 'mongoose';

/**
 * Validate if a single document or list of documents exist in the database.
 * @param {mongoose.Model} model - The Mongoose model (e.g., User, Post, Comment).
 * @param {string[]} docIds - Array of document IDs to validate.
 * @returns {Promise<boolean>} - Returns true if all IDs exist, otherwise false.
 */
async function validateDocumentsExistence(model, docIds) {
  if (docIds.length === 0) {
    return true;
  }

  const existingDocsCount = await model.countDocuments({ _id: { $in: docIds } });
  return existingDocsCount === docIds.length;
}

/**
 * Validate if all provided IDs in an array are valid MongoDB ObjectIds.
 * @param {string[]} ids - Array of IDs to validate.
 * @returns {boolean} - Returns true if all IDs are valid ObjectIds, otherwise false.
 */
function areValidObjectIds(ids) {
  if (ids.length === 0) {
    return true;
  }
  return ids.every((id) => mongoose.Types.ObjectId.isValid(id));
}

export { validateDocumentsExistence, areValidObjectIds };

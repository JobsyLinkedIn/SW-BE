const uploadMediaService = (UploadedFiles) => {
  try {
    // ✅ Get Uploaded Media (images,video)
    let media = [];
    if (UploadedFiles.length !== 0) {
      media = UploadedFiles.map((file) => ({
        publicId: file.public_id,
        url: file.secure_url,
        type: file.resource_type,
      }));
    }
    return { media: media };
  } catch (error) {
    console.error('Error in Upload Media In The Message:', error);
    throw error; // Re-throw the error for the controller to handle
  }
};
export { uploadMediaService };

// utils/cloudinaryUtils.js
function extractPublicIdFromUrl(url) {
  // This assumes the URL format is something like:
  // https://res.cloudinary.com/your-cloud-name/image/upload/v123456789/brewtime/menu_123.jpg
  // We need to extract the "brewtime/menu_123" part.

  const regex = /\/(?:v\d+\/)?([^/]+\/[^/.]+)\./;
  const match = url.match(regex);
  return match ? match[1] : null;
}

module.exports = { extractPublicIdFromUrl };

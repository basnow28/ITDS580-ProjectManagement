require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');
const google = require('googleapis').google;

const CLIENT_ID = process.env.CLIENT_ID;
const API_KEY = process.env.API_KEY; // Load API key from environment variables

const client = new OAuth2Client(CLIENT_ID);
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2();

async function authorizeMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key']; // Get API key from headers

  // 🔹 Check API Key
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }

  if (authHeader) {
    const accessToken = authHeader.trim().split(' ')[1];

    try {
      // 🔹 Validate OAuth Token
      await client.getTokenInfo(accessToken);

      // 🔹 Get user profile info
      oauth2Client.setCredentials({ access_token: accessToken });
      const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2',
      });

      const userInfoResponse = await oauth2.userinfo.get();
      req.userId = userInfoResponse.data?.id;

      next();
    } catch (error) {
      console.error('Error verifying access token:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid Token' });
    }
  } else {
    return res.status(401).json({ error: 'Unauthorized: No Token Provided' });
  }
}

module.exports = authorizeMiddleware;

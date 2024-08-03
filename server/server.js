// server.js

const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001;
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let { access_token, refresh_token, expires_in } = 0;
const frontend_URI = process.env.FRONTEND_URI;
const redirect_uri = `${frontend_URI}/success`;


// Route for the home page
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Route to start the OAuth flow
app.get('/auth', (req, res) => {
  res.redirect(`https://id.twitch.tv/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=user:read:email+user:read:follows`);
});

// OAuth callback route to handle token exchange
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code; // Get the authorization code from the query parameters
  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.REDIRECT_URI
      }
    });

    access_token = tokenResponse.data.access_token;
    refresh_token = tokenResponse.data.refresh_token;
    expires_in = tokenResponse.data.expires_in;

    // Redirect to frontend 
    res.redirect(redirect_uri);

  } catch (error) {
    console.error('Token exchange failed:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/get-tokens', (req, res) => {
    res.json({ access_token, refresh_token, expires_in });
    });

app.get('/refresh', async (req, res) => {
    try {
        const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            grant_type: 'refresh_token',
            refresh_token: req.query.refresh_token,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        }
        });
        console.log(tokenResponse.data);
        let access_token = tokenResponse.data.access_token;
        let refresh_token = tokenResponse.data.refresh_token;
        let expires_in = tokenResponse.data.expires_in;
    
        res.json({ access_token, refresh_token, expires_in });
    
    } catch (error) {
        console.error('Token exchange failed:', error);
        res.status(500).send('Authentication failed');
    }
    });
// Start the server
app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});

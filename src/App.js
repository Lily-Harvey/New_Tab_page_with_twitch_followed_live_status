import React from "react";


// Replace these constants with your Twitch app details
const CLIENT_ID = "hrkyfsumttf4th56bzy3a2pjxlz47p";
const CLIENT_SECRET = "8q4gngmnse18lkvepyr63p6namodvn"; // Replace with your client secret
const REDIRECT_URI = "http://localhost:3000"; // Ensure this matches exactly with your registered URI

// API Endpoints
const AUTHORIZATION_ENDPOINT = "https://id.twitch.tv/oauth2/authorize";
const TOKEN_ENDPOINT = "https://id.twitch.tv/oauth2/token";
const FOLLOWED_CHANNELS_BY_USER_ID_ENDPOINT = "https://api.twitch.tv/helix/channels/followed";
const USER_INFO_ENDPOINT = "https://api.twitch.tv/helix/users";
const STREAMS_STATUS_ENDPOINT = "https://api.twitch.tv/helix/streams";

const greetings = {
  morning: "Good morning",
  noon: "Good afternoon",
  evening: "Good evening",
  night: "Good night",
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      greeting: greetings.morning,
      showDropdown: false,
      name: "",
      backgroundImage: "",
      previewImage: "",
      accessToken: "",
      followedChannels: [],
    };
    this.startTime = this.startTime.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleImageClick = this.handleImageClick.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.previewImage = this.previewImage.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.clearSettings = this.clearSettings.bind(this);
    this.startOAuthFlow = this.startOAuthFlow.bind(this);
    this.handleOAuthRedirect = this.handleOAuthRedirect.bind(this);
    this.exchangeCodeForToken = this.exchangeCodeForToken.bind(this);
    this.fetchFollowedChannels = this.fetchFollowedChannels.bind(this);
    this.checkLiveStatus = this.checkLiveStatus.bind(this);
  }

  componentDidMount() {
    this.startTime();
    this.loadSettings();
    const savedAccessToken = localStorage.getItem('accessToken');
  if (savedAccessToken) {
    this.setState({ accessToken: savedAccessToken }, () => {
      // Fetch followed channels after setting the token
      this.fetchFollowedChannels();
    });
  }

  this.handleOAuthRedirect(); // Check for OAuth token in the URL
}


  startTime() {
    let today = new Date();
    let h = today.getHours();
    let greeting;
    if (h > 6 && h < 12) {
      greeting = greetings.morning;
    } else if (h >= 12 && h < 17) {
      greeting = greetings.noon;
    } else if (h >= 17 && h < 20) {
      greeting = greetings.evening;
    } else {
      greeting = greetings.night;
    }
    this.setState({ greeting });
    setTimeout(this.startTime, 1000);
  }

  toggleDropdown(event) {
    event.preventDefault();
    this.setState((prevState) => ({
      showDropdown: !prevState.showDropdown,
    }));
  }

  handleNameChange(event) {
    const value = event.target.value;
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
    this.setState({ name: capitalizedValue });
  }

  handleImageClick() {
    this.fileInputRef.click();
  }

  handleImageChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 1200;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const resizedBase64Image = canvas.toDataURL("image/jpeg", 0.9);

        this.setState({ previewImage: resizedBase64Image });
      };
    };

    reader.readAsDataURL(file);
  }

  previewImage() {
    this.setState({ backgroundImage: this.state.previewImage });
  }

  saveSettings() {
    const capitalizedName = this.state.name.charAt(0).toUpperCase() + this.state.name.slice(1);
    localStorage.setItem("name", capitalizedName);

    if (this.state.previewImage) {
      localStorage.setItem("backgroundImage", this.state.previewImage);
      this.setState({ backgroundImage: this.state.previewImage });
    }

    this.setState({ name: capitalizedName, showDropdown: false, previewImage: "" });
    alert("Settings saved!");
  }

  clearSettings() {
    localStorage.removeItem("name");
    localStorage.removeItem("backgroundImage");
    localStorage.removeItem("accessToken"); // Clear the access token
    this.setState({ name: "", backgroundImage: "", previewImage: "", accessToken: "", followedChannels: [] });
  }
  

  loadSettings() {
    const savedName = localStorage.getItem("name");
    const savedBackgroundImage = localStorage.getItem("backgroundImage");

    if (savedName) {
      this.setState({ name: savedName });
    }

    if (savedBackgroundImage) {
      this.setState({ backgroundImage: savedBackgroundImage });
    }
  }

  startOAuthFlow() {
    const url = new URL(AUTHORIZATION_ENDPOINT);
    url.searchParams.append('client_id', CLIENT_ID);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('redirect_uri', REDIRECT_URI);
    url.searchParams.append('scope', 'user:read:follows'); // Ensure correct scope
    window.location.href = url.toString();
  }

  async handleOAuthRedirect() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      await this.exchangeCodeForToken(code);
    }
  }

  async exchangeCodeForToken(code) {
    try {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch token:', errorData);
        throw new Error(`Failed to fetch token: ${errorData.message}`);
      }
  
      const data = await response.json();
      console.log('Access Token Data:', data); // Log token data for debugging
      
      // Save access token to local storage
      localStorage.setItem('accessToken', data.access_token);
      this.setState({ accessToken: data.access_token }, () => {
        // Fetch followed channels after obtaining the token
        this.fetchFollowedChannels();
      });
  
      // Optionally, clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
  }
  

  async getUserId(accessToken) {
    try {
      const response = await fetch(USER_INFO_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-ID': CLIENT_ID,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch user info:', errorData);
        throw new Error(`Failed to fetch user info: ${errorData.message}`);
      }

      const data = await response.json();
      return data.data[0].id;
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  }

  async checkLiveStatus() {
    const { followedChannels, accessToken } = this.state;
    if (!accessToken || followedChannels.length === 0) return;

    try {
      const liveStatusPromises = followedChannels.map(async (channel) => {
        const response = await fetch(`${STREAMS_STATUS_ENDPOINT}?user_id=${channel.broadcaster_id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-ID': CLIENT_ID,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to fetch stream status:', errorData);
          throw new Error(`Failed to fetch stream status: ${errorData.message}`);
        }

        const data = await response.json();
        return {
          ...channel,
          isLive: data.data.length > 0,
        };
      });

      const channelsWithLiveStatus = await Promise.all(liveStatusPromises);
      this.setState({ followedChannels: channelsWithLiveStatus });
    } catch (error) {
      console.error('Error checking live status:', error);
    }
  }

  async fetchFollowedChannels() {
    const { accessToken } = this.state;
    if (!accessToken) return;
  
    try {
      // Get the user ID
      const userId = await this.getUserId(accessToken);
      if (!userId) return;
  
      // Fetch followed channels using the user ID
      const response = await fetch(`${FOLLOWED_CHANNELS_BY_USER_ID_ENDPOINT}?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-ID': CLIENT_ID,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch followed channels:', errorData);
        throw new Error(`Failed to fetch followed channels: ${errorData.message}`);
      }
  
      const data = await response.json();
      console.log('Followed Channels Data:', data); // Log response data
      this.setState({ followedChannels: data.data }, () => {
        this.checkLiveStatus();
      });
    } catch (error) {
      console.error('Error fetching followed channels:', error);
    }
  }
  

  render() {
    const { backgroundImage, previewImage, followedChannels, greeting, name, showDropdown } = this.state;
    const appStyle = {
      background: backgroundImage ? `url(${backgroundImage}) no-repeat center center/cover` : "",
    };

    return (
      <div className="App" style={appStyle}>
        <button className="settings" onClick={this.toggleDropdown}>&#8942;</button>
        {showDropdown && (
          <div className="dropdown">
            <ul>
              <li>
                Name:
                <input
                  type="text"
                  value={this.state.name}
                  onChange={this.handleNameChange}
                  placeholder="Enter your name"
                />
              </li>
              <li onClick={this.handleImageClick} style={{ cursor: "pointer" }}>
                Image: <span style={{ textDecoration: "underline", color: "blue" }}>Upload</span>
              </li>
              {previewImage && (
                <li>
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ maxWidth: "200px", maxHeight: "200px" }}
                  />
                </li>
              )}
              {previewImage && (
                <li>
                  <button onClick={this.previewImage}>Preview</button>
                </li>
              )}
              <li>
                <button onClick={this.startOAuthFlow}>Authorize with Twitch</button>
              </li>
            </ul>
            <button className="save-button" onClick={this.saveSettings}>
              Save
            </button>
            {(localStorage.getItem("name") || localStorage.getItem("backgroundImage")) && (
              <button className="clear-button" onClick={this.clearSettings}>
                Clear
              </button>
            )}
          </div>
        )}
        <div className="greeting-container">
          <h1>{greeting} {name}!</h1>
        </div>
        {followedChannels.length > 0 && (
          <div className="followed">
            <h2>Live Channels:</h2>
            <ul className="followed-channels-list">
              {followedChannels.filter(channel => channel.isLive).map(channel => (
                <li key={channel.broadcaster_id}>
                  {/* Optionally use a button instead of an <a> */}
                  <button className="followed-channels-button" onClick={() => window.open(`https://www.twitch.tv/${channel.broadcaster_name}`, '_blank')}><b></b>{channel.broadcaster_name}&#128308;</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <input
          type="file"
          ref={(ref) => (this.fileInputRef = ref)}
          style={{ display: "none" }}
          onChange={this.handleImageChange}
        />
      </div>
    );
  }
}

export default App;

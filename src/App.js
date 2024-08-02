import React, { useState, useEffect, useCallback, useRef } from 'react';
import Greeting from './components/Greeting';
import SettingsDropdown from './components/SettingsDropdown';
import FollowedChannels from './components/FollowedChannels';

// Replace these constants with your Twitch app details
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;

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

const App = () => {
  const [greeting, setGreeting] = useState(greetings.morning);
  const [showDropdown, setShowDropdown] = useState(false);
  const [name, setName] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [followedChannels, setFollowedChannels] = useState([]);
  const [loading, setLoading] = useState(false); // New state for loading

  const fileInputRef = useRef(null);

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hour = now.getHours();
      let newGreeting;
      if (hour > 6 && hour < 12) newGreeting = greetings.morning;
      else if (hour >= 12 && hour < 17) newGreeting = greetings.noon;
      else if (hour >= 17 && hour < 20) newGreeting = greetings.evening;
      else newGreeting = greetings.night;
      setGreeting(newGreeting);
    };

    updateGreeting();
    const intervalId = setInterval(updateGreeting, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const loadSettings = useCallback(() => {
    const savedName = localStorage.getItem("name");
    const savedBackgroundImage = localStorage.getItem("backgroundImage");

    if (savedName) setName(savedName);
    if (savedBackgroundImage) setBackgroundImage(savedBackgroundImage);

    const savedLiveChannels = localStorage.getItem("liveChannels");
    if (savedLiveChannels) {
      setFollowedChannels(JSON.parse(savedLiveChannels));
    }
  }, []);

  const exchangeCodeForToken = useCallback(async (code) => {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();
    const accessToken = data.access_token;
    localStorage.setItem("accessToken", accessToken);
    setAccessToken(accessToken);
    fetchFollowedChannels(accessToken);
    if (window.opener){
      window.opener.postMessage('refresh', '*'); // Send a message to the parent window
      window.close(); // Close the popup
    }
  }, []);

  const handleOAuthRedirect = useCallback(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code");

    if (code) {
      exchangeCodeForToken(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [exchangeCodeForToken]);

  useEffect(() => {
    loadSettings();
    const savedAccessToken = localStorage.getItem('accessToken');
    if (savedAccessToken) {
      setAccessToken(savedAccessToken);
      const handlePageLoad = () => fetchFollowedChannels(savedAccessToken);
      window.addEventListener('load', handlePageLoad);
      
      return () => window.removeEventListener('load', handlePageLoad);
    }
    handleOAuthRedirect();
  }, [handleOAuthRedirect, loadSettings]);
  
  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data === 'refresh') {
        window.location.reload();
      }
    });
  }, []);
  
  const toggleDropdown = useCallback((event) => {
    event.preventDefault();
    setShowDropdown(prev => !prev);
  }, []);
  
  const handleNameChange = useCallback((event) => {
    const value = event.target.value;
    setName(value.charAt(0).toUpperCase() + value.slice(1));
  }, []);
  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = useCallback((event) => {
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
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const resizedBase64Image = canvas.toDataURL("image/jpeg", 0.9);
        setPreviewImage(resizedBase64Image);
      };
    };
    
    reader.readAsDataURL(file);
  }, []);
  
  const handlePreviewImage = useCallback(() => {
    setBackgroundImage(previewImage);
  }, [previewImage]);
  
  const clearPreviewImage = useCallback(() => {
    setPreviewImage("");
    setBackgroundImage("");
  }, []);
  
  const saveSettings = useCallback(() => {
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    localStorage.setItem("name", capitalizedName);
    
    if (previewImage) {
      localStorage.setItem("backgroundImage", previewImage);
      setBackgroundImage(previewImage);
    }
    
    setName(capitalizedName);
    setShowDropdown(false);
    setPreviewImage("");
    alert("Settings saved!");
  }, [name, previewImage]);
  
  const clearSettings = useCallback(() => {
    localStorage.removeItem("name");
    localStorage.removeItem("backgroundImage");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("liveChannels");
    setName("");
    setBackgroundImage("");
    setPreviewImage("");
    setAccessToken("");
    setFollowedChannels([]);
  }, []);
  
  const startOAuthFlow = () => {
    const url = `${AUTHORIZATION_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=user:read:email+user:read:follows`;
    const newTab = window.open(url, "_blank");
    window.focus();
    newTab.blur();
  };
  
  const fetchFollowedChannels = async (accessToken) => {
    try {
      setLoading(true); // Set loading to true
      
      const userInfoResponse = await fetch(USER_INFO_ENDPOINT, {
        headers: {
          "Client-ID": CLIENT_ID,
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      if (!userInfoResponse.ok) throw new Error('User info fetch failed');
      
      const userInfo = await userInfoResponse.json();
      const userId = userInfo.data[0].id;
      
      const followedChannelsResponse = await fetch(`${FOLLOWED_CHANNELS_BY_USER_ID_ENDPOINT}?user_id=${userId}`, {
        headers: {
          "Client-ID": CLIENT_ID,
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      if (!followedChannelsResponse.ok) throw new Error('Followed channels fetch failed');
      
      const followedChannelsData = await followedChannelsResponse.json();
      const followedChannels = followedChannelsData.data;
      
      const liveChannels = await Promise.all(followedChannels.map(async (channel) => {
        const streamStatusResponse = await fetch(`${STREAMS_STATUS_ENDPOINT}?user_id=${channel.broadcaster_id}`, {
          headers: {
            "Client-ID": CLIENT_ID,
            "Authorization": `Bearer ${accessToken}`,
          },
        });
        
        if (!streamStatusResponse.ok) throw new Error('Stream status fetch failed');
        
        const streamStatusData = await streamStatusResponse.json();
        return {
          ...channel,
          isLive: streamStatusData.data.length > 0,
        };
      }));
      
      localStorage.setItem("liveChannels", JSON.stringify(liveChannels));
      setFollowedChannels(liveChannels);
    } catch (error) {
      console.error('Error fetching followed channels:', error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };
  
  const refreshFollowedChannels = useCallback(() => {
    if (accessToken) {
      fetchFollowedChannels(accessToken);
    }
  }, [accessToken]);
  

  return (
    <div className="App" style={{ background: backgroundImage ? `url(${backgroundImage}) no-repeat center center/cover` : "" }}>
      <button className="settings" onClick={toggleDropdown}>&#9881;</button>
      <SettingsDropdown
        name={name}
        previewImage={previewImage}
        showDropdown={showDropdown}
        handleNameChange={handleNameChange}
        handleImageClick={handleImageClick}
        handleImageChange={handleImageChange}
        previewImageCallback={handlePreviewImage}
        startOAuthFlow={startOAuthFlow}
        saveSettings={saveSettings}
        clearSettings={clearSettings}
        clearPreviewImage={clearPreviewImage} // Pass the new function
      />
      <Greeting greeting={greeting} name={name} />
      {accessToken && (
      <FollowedChannels
        followedChannels={followedChannels}
        refreshFollowedChannels={refreshFollowedChannels}
        loading={loading} // Pass loading state
      />
      )}
    </div>
  );
};

export default App;

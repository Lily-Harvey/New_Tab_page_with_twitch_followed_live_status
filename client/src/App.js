import React, { useState, useEffect, useCallback, useRef } from 'react';
import Greeting from './components/Greeting';
import SettingsDropdown from './components/SettingsDropdown';
import FollowedChannels from './components/FollowedChannels';

// Replace these constants with your Twitch app details
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID; // Your Twitch app client ID
// API Endpoints
const FOLLOWED_CHANNELS_BY_USER_ID_ENDPOINT = "https://api.twitch.tv/helix/channels/followed"; // Twitch followed channels endpoint
const USER_INFO_ENDPOINT = "https://api.twitch.tv/helix/users"; // Twitch user info endpoint
const STREAMS_STATUS_ENDPOINT = "https://api.twitch.tv/helix/streams"; // Twitch stream status endpoint
const GET_TOKENS_ENDPOINT = process.env.REACT_APP_TOKEN_ENDPOINT; // Local server endpoint to get tokens
const AUTHORIZATION_ENDPOINT = process.env.REACT_APP_AUTH_ENDPOINT; // Local server endpoint to start OAuth flow
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Local server URL
// Greetings based on the time of the day 
const greetings = {
  morning: "Good morning",
  noon: "Good afternoon",
  evening: "Good evening",
  night: "Good night",
};

const App = () => {
  const [greeting, setGreeting] = useState(greetings.morning); // Set the default greeting
  const [showDropdown, setShowDropdown] = useState(false); // New state for dropdown visibility
  const [name, setName] = useState(""); // New state for name
  const [backgroundImage, setBackgroundImage] = useState(""); // New state for background image
  const [previewImage, setPreviewImage] = useState(""); // New state for preview image
  const [accessToken, setAccessToken] = useState(""); // New state for access token
  const [followedChannels, setFollowedChannels] = useState([]); // New state for followed channels
  const [loading, setLoading] = useState(false); // New state for loading

  const fileInputRef = useRef(null); // Create a ref for the file input element

  // Update the greeting based on the time of the day 
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

    // Call the function immediately and then every 5 minutes
    updateGreeting();
    const intervalId = setInterval(updateGreeting, 500000);
    return () => clearInterval(intervalId); // Cleanup the interval on unmount
  }, []);

  // Load settings from local storage 
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


  // Initial setup when the app loads 
  useEffect(() => {
    loadSettings(); // Load settings from local storage
    const savedAccessToken = localStorage.getItem('accessToken'); // Get the saved access token
    // If the access token is present, set it and fetch followed channels
    if (savedAccessToken) {
      setAccessToken(savedAccessToken); 
      const handlePageLoad = () => fetchFollowedChannels(savedAccessToken); 
      window.addEventListener('load', handlePageLoad);
      
      return () => window.removeEventListener('load', handlePageLoad); // Cleanup the event listener on unmount
    } // Handle OAuth redirect from Twitch
  }, [ loadSettings]);
  
  // Add a message event listener to refresh the app when needed
  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data === 'refresh') {
        window.location.reload();
      }
    });
  }, []);
  
 // Check if URL is `/success` and fetch tokens
 useEffect(() => {
  const path = window.location.pathname;
  if (path === '/success/') {
    const fetchTokens = async () => {
      try {
        const response = await fetch(GET_TOKENS_ENDPOINT);
        if (!response.ok) throw new Error('Failed to fetch tokens');
        const data = await response.json();
        console.log(data);
    
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('expiresIn', data.expires_in);
        
        setAccessToken(data.access_token);
        fetchFollowedChannels(data.access_token);
        // Notify the parent window to refresh
        if (window.opener) {
          window.opener.postMessage('refresh', '*');
        }

        // Close the current window
        window.close();
      } catch (error) {
        console.error('Error fetching tokens:', error);
      }
    };

    fetchTokens();
  }
}, []); // Run effect only once on component mount

  const handleOAuthFlow = useCallback(() => {
    window.open(AUTHORIZATION_ENDPOINT, '_blank');
  }, []);
  // Manage the dropdown visibility
  const toggleDropdown = useCallback((event) => {
    event.preventDefault();
    setShowDropdown(prev => !prev);
  }, []);
  
  // Handle name change with capitalization 
  const handleNameChange = useCallback((event) => {
    const value = event.target.value;
    setName(value.charAt(0).toUpperCase() + value.slice(1));
  }, []);
  
  // Handle image click to open the file input 
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle image change to the selected image
  const handleImageChange = useCallback((event) => {
    const file = event.target.files[0]; // Get the selected file
    if (!file) return; 
    
    const reader = new FileReader(); // Create a new FileReader
    reader.onloadend = () => {  // Set the onloadend event handler
      const img = new Image(); // Create a new Image
      img.src = reader.result; // Set the image source to the reader result
      
      img.onload = () => { // Set the onload event handler
        const canvas = document.createElement("canvas"); // Create a new canvas element
        const ctx = canvas.getContext("2d"); // Get the 2D context of the canvas
        const maxWidth = 1200; // Set the maximum width
        const maxHeight = 800; // Set the maximum height
        let { width, height } = img; // Get the image width and height

        // Resize the image if it exceeds the maximum dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        // Set the canvas width and height and draw the image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert the canvas content to base64 image and set it as the preview image
        const resizedBase64Image = canvas.toDataURL("image/jpeg", 0.9);
        setPreviewImage(resizedBase64Image);
      };
    };
    
    reader.readAsDataURL(file); // Read the file as a data URL
  }, []);
  
  // Handle preview image to set it as the background image
  const handlePreviewImage = useCallback(() => {
    setBackgroundImage(previewImage);
  }, [previewImage]);
  
  // Clear the preview image and background image 
  const clearPreviewImage = useCallback(() => {
    setPreviewImage("");
    setBackgroundImage("");
  }, []);
  
  // Save the settings to local storage 
  const saveSettings = useCallback(() => {
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1); // Capitalize the name before saving it
    localStorage.setItem("name", capitalizedName); // Save the name to local storage
    
    // Save the background image to local storage if it exists 
    if (previewImage) {
      localStorage.setItem("backgroundImage", previewImage);
      setBackgroundImage(previewImage);
    }
    
    // Set the name and hide the dropdown 
    setName(capitalizedName);
    setShowDropdown(false);
    setPreviewImage("");
    alert("Settings saved!");
  }, [name, previewImage]);
  
  // Clear the settings from local storage 
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
  
  
  // Fetch followed channels using the access token 
  const fetchFollowedChannels = async (accessToken) => {
    try {
      setLoading(true); // Set loading to true
      
      // Fetch user info using the access token 
      const userInfoResponse = await fetch(USER_INFO_ENDPOINT, {
        headers: {
          "Client-ID": CLIENT_ID,
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      if (!userInfoResponse.ok) throw new Error('User info fetch failed');
      
      const userInfo = await userInfoResponse.json(); // Parse the response 
      const userId = userInfo.data[0].id; // Get the user ID from the response 
      
      // Fetch followed channels using the user ID 
      const followedChannelsResponse = await fetch(`${FOLLOWED_CHANNELS_BY_USER_ID_ENDPOINT}?user_id=${userId}`, {
        headers: {
          "Client-ID": CLIENT_ID,
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      
      if (!followedChannelsResponse.ok) throw new Error('Followed channels fetch failed');
      
      // Parse the response and get the followed channels 
      const followedChannelsData = await followedChannelsResponse.json();
      // Get the followed channels data from the response 
      const followedChannels = followedChannelsData.data;
      
      // Check if the followed channels are live 
      const liveChannels = await Promise.all(followedChannels.map(async (channel) => {
        // Fetch stream status using the broadcaster ID 
        const streamStatusResponse = await fetch(`${STREAMS_STATUS_ENDPOINT}?user_id=${channel.broadcaster_id}`, {
          headers: {
            "Client-ID": CLIENT_ID,
            "Authorization": `Bearer ${accessToken}`,
          },
        });
        
        if (!streamStatusResponse.ok) throw new Error('Stream status fetch failed');
        
        // Parse the response and check if the channel is live 
        const streamStatusData = await streamStatusResponse.json();
        return {
          ...channel, // Spread the channel data 
          isLive: streamStatusData.data.length > 0, // Check if the channel is live
        };
      }));
      
      localStorage.setItem("liveChannels", JSON.stringify(liveChannels)); // Save the live channels to local storage 
      setFollowedChannels(liveChannels); // Set the followed channels state 
    } catch (error) {
      console.error('Error fetching followed channels:', error);
    } finally {
      setLoading(false); // Set loading to false 
    }
  };
  
  // Refresh followed channels when the access token changes or button is clicked
  const refreshFollowedChannels = useCallback(() => {
    if (accessToken) {
      localStorage.removeItem("liveChannels"); // Remove the live channels from local storage
      fetchFollowedChannels(accessToken);
    }
  }, [accessToken]);

  const refreshToken = useCallback(() => {
    const refresh_token = localStorage.getItem('refreshToken');
    if (!refresh_token) return;
    const refresh = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/refresh?refresh_token=${refresh_token}`);
        if (!response.ok) throw new Error('Failed to refresh token');
        const data = await response.json();
        console.log(data);
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('expiresIn', data.expires_in);
        localStorage.setItem('refreshToken', data.refresh_token);
        setAccessToken(data.access_token);
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    };

    refresh();
  }, []);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const accessToken = localStorage.getItem('accessToken');
      const expirationTime = localStorage.getItem('expirationTime');
      if (!accessToken || !expirationTime) return;
      const currentTime = new Date().getTime();
      if (currentTime >= expirationTime) {
        refreshToken();
      }
    };

    checkTokenExpiration();
  }, [refreshToken]);

  return (
    <div 
      className="App" 
      // Set background image if provided; otherwise, no background
      style={{ background: backgroundImage ? `url(${backgroundImage}) no-repeat center center/cover` : "" }}
    >
      {/* Button to toggle settings dropdown */}
      <button className="settings" onClick={toggleDropdown}>
        &#9881;
      </button>
  
      {/* SettingsDropdown component with various handlers and callbacks */}
      <SettingsDropdown
        name={name} // Current name setting
        previewImage={previewImage} // Current preview image setting
        showDropdown={showDropdown} // Determines whether the dropdown is visible
        handleNameChange={handleNameChange} // Handler for changing the name
        handleImageClick={handleImageClick} // Handler for image click events
        handleImageChange={handleImageChange} // Handler for changing the image
        previewImageCallback={handlePreviewImage} // Callback for preview image
        startOAuthFlow={handleOAuthFlow} // Function to start OAuth authentication
        saveSettings={saveSettings} // Function to save settings
        clearSettings={clearSettings} // Function to clear settings
        clearPreviewImage={clearPreviewImage} // Function to clear the preview image
        refreshToken={refreshToken} // Function to refresh the token
      />
  
      {/* Greeting component showing a greeting message and user's name */}
      <Greeting 
        greeting={greeting} // Greeting message
        name={name} // User's name
      />
  
      {/* Conditional rendering of FollowedChannels component if accessToken is present */}
      {accessToken && (
        <FollowedChannels
          followedChannels={followedChannels} // List of followed channels
          refreshFollowedChannels={refreshFollowedChannels} // Function to refresh the list of followed channels
          loading={loading} // Loading state for the followed channels
        />
      )}
    </div>
  );
}

export default App;

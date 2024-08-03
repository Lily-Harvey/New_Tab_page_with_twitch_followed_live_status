import React from "react";

// FollowedChannels component displays a list of live followed channels and provides a refresh button
const FollowedChannels = ({ followedChannels, refreshFollowedChannels, loading }) => (
  <div className="followed">
    {/* Header for the followed channels section */}
    <h2>Live Channels:</h2>

    {/* List of followed channels that are currently live */}
    <ul className="followed-channels-list">
      {/* Filter channels to only include those that are live and map them to list items */}
      {followedChannels.filter(channel => channel.isLive).map(channel => (
        <li key={channel.broadcaster_id}>
          <button
            className="followed-channels-button"
            // Open the channel's Twitch page when clicked
            onClick={() => window.open(`https://www.twitch.tv/${channel.broadcaster_name}`, '_blank')}
          >
            {channel.broadcaster_name}&#128308;
          </button>
        </li>
      ))}
    </ul>

    {/* Container for the refresh button */}
    <div className="refresh-container">
      <button
        className="refresh-button"
        onClick={refreshFollowedChannels} // Call the refresh function when clicked
        disabled={loading} // Disable the button while data is loading
      >
        {/* Show "Refreshing..." if loading, otherwise "Refresh Channels" */}
        {loading ? 'Refreshing...' : 'Refresh Channels'}
      </button>
      {/* Show a spinner while loading */}
      {loading && <span className="spinner"></span>}
    </div>
  </div>
);

export default FollowedChannels;

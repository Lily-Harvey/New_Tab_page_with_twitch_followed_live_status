import React from "react";

const FollowedChannels = ({ followedChannels, refreshFollowedChannels, loading }) => (
  <div className="followed">
    <h2>Live Channels:</h2>
    <ul className="followed-channels-list">
      {followedChannels.filter(channel => channel.isLive).map(channel => (
        <li key={channel.broadcaster_id}>
          <button
            className="followed-channels-button"
            onClick={() => window.open(`https://www.twitch.tv/${channel.broadcaster_name}`, '_blank')}>
            {channel.broadcaster_name}&#128308;
          </button>
        </li>
      ))}
    </ul>
    <div className="refresh-container">
      <button
        className="refresh-button"
        onClick={refreshFollowedChannels}
        disabled={loading} // Disable button while loading
      >
        {loading ? 'Refreshing...' : 'Refresh Channels'}
      </button>
      {loading && <span className="spinner"></span>} {/* Add spinner if loading */}
    </div>
  </div>
);

export default FollowedChannels;

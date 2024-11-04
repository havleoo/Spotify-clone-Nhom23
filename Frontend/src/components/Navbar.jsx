import React, { useState } from "react";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import { reducerCases } from "../utils/Constants";
import { CgProfile } from "react-icons/cg";
import { useStateProvider } from "../utils/StateProvider";
import { FiLogOut } from "react-icons/fi";
import { PiUserSwitch } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";
import { FaRegUserCircle } from "react-icons/fa";
import axios from "axios";

export default function Navbar({ navBackground }) {
  const [{ userInfo }] = useStateProvider();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [{ token }, dispatch] = useStateProvider();
  const [errorMessage, setErrorMessage] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);

  const handleToggle = () => {
    setShowInfo((prevShowInfo) => !prevShowInfo);
  };

  const handleUserInfoToggle = () => {
    setIsUserInfoOpen((prevShowInfo) => !prevShowInfo);
  };

  console.log("Current token: ", token);

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track%2Calbum%2Cartist&market=VN&limit=5`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const items = response.data;

      const trackSuggestions = items.tracks.items.map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist) => artist.name),
        image: track.album.images[2]?.url || "",
        context_uri: track.album.uri,
        track_number: track.track_number,
        type: "track",
      }));

      const albumSuggestions = items.albums.items.slice(0, 2).map((album) => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map((artist) => artist.name),
        image: album.images[2]?.url || "",
        context_uri: album.uri,
        type: "album",
        external_urls: album.external_urls,
      }));

      const artistSuggestions = items.artists.items
        .slice(0, 2)
        .map((artist) => ({
          id: artist.id,
          name: artist.name,
          image: artist.images[2]?.url || "",
          type: "artist",
          external_urls: artist.external_urls,
        }));

      setSuggestions([
        ...trackSuggestions,
        ...albumSuggestions,
        ...artistSuggestions,
      ]);

      setErrorMessage(null);
    } catch (error) {
      console.error("Error fetching: ", error);

      if (error.response?.status === 401) {
        setErrorMessage("Token expired. Please log in again.");
      } else if (error.response?.status === 403) {
        setErrorMessage(
          "Authorization failed. Please check your token and permissions."
        );
      } else {
        setErrorMessage("Failed to fetch suggestions. Please try again.");
      }
    }
  };

  const handleInputChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
  };

  const playTrack = async (
    id,
    name,
    artists,
    image,
    context_uri,
    track_number
  ) => {
    const response = await axios.put(
      `https://api.spotify.com/v1/me/player/play`,
      {
        context_uri,
        offset: {
          position: track_number - 1,
        },
        position_ms: 0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    if (response.status === 204) {
      const currentPlaying = {
        id,
        name,
        artists,
        image,
      };
      dispatch({ type: reducerCases.SET_PLAYING, currentPlaying });
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    } else {
      dispatch({ type: reducerCases.SET_PLAYER_STATE, playerState: true });
    }
  };

  const openExternalLink = (externalUrl) => {
    window.open(externalUrl, "_blank"); // Open link in a new tab
  };

  return (
    <Container navBackground={navBackground}>
      <div className="search__bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Tracks, albums, or artists"
          value={searchQuery}
          onChange={handleInputChange}
        />
        {searchQuery && (
          <ul className="suggestions">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => {
                  if (
                    suggestion.type === "artist" ||
                    suggestion.type === "album"
                  ) {
                    openExternalLink(suggestion.external_urls.spotify); // Open Spotify link for artist or album
                  } else {
                    playTrack(
                      suggestion.id,
                      suggestion.name,
                      suggestion.artists,
                      suggestion.image,
                      suggestion.context_uri,
                      suggestion.track_number
                    );
                  }
                }}
              >
                {suggestion.image && (
                  <img
                    src={suggestion.image}
                    alt={`${suggestion.name} cover`}
                  />
                )}

                <span>{suggestion.name}</span>
                <span className="item-type">{suggestion.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="avatar-container">
        <button onClick={handleToggle} className="avatar-button">
          <CgProfile className="avatar-icon" />
        </button>

        {showInfo && (
          <div className="user-info-popup">
            <div className="user-info-header">
              <div className="user-details">
                <CgProfile className="popup-icon" />
                <div className="user-text">
                  <p className="user-profile-name">{userInfo?.name}</p>
                  <p className="user-profile-url">
                    <a
                      href={userInfo?.userUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-link"
                    >
                      {userInfo?.userUrl}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <hr />

            <div>
              <button className="info-button" onClick={handleUserInfoToggle}>
                <FaRegUserCircle className="info-icon" /> Info
              </button>

              {isUserInfoOpen && (
                <div className="info-overlay" onClick={handleUserInfoToggle}>
                  <div
                    className="info-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h2>User Information</h2>
                    <div className="info-details">
                      <div className="info-image-details">
                        {userInfo?.images ? (
                          <img src={userInfo.images} alt="User Info" />
                        ) : (
                          <p>No image available</p>
                        )}
                      </div>

                      <p>Username: </p>
                      <p>Password: </p>
                      <p>Gmail Account: {userInfo?.email}</p>
                      <p>Github Link: </p>
                      <p>Followers: {userInfo?.followers}</p>

                      <button className="manage-account-button">
                        Manage Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="switch-user-button">
              <PiUserSwitch className="switch-icon" /> Switch User
            </button>

            <button className="settings-button">
              <IoSettingsOutline className="settings-icon" /> Settings
            </button>

            <button className="logout-button">
              <FiLogOut className="logout-icon" /> Logout
            </button>
          </div>
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  height: 15vh;
  position: sticky;
  top: 0;
  transition: 0.3s ease-in-out;
  background-color: ${({ navBackground }) =>
    navBackground ? "rgba(0,0,0,0.7)" : "none"};

  .avatar {
    background-color: #111;
    padding: 0.5rem 1.2rem;
    border-radius: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s ease;

    a {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      color: #fff;
      font-weight: bold;

      svg {
        font-size: 1.4rem;
        background-color: #333;
        padding: 0.4rem;
        border-radius: 1rem;
        color: #ccc;
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      &:hover svg {
        background-color: #282828;
        color: #fff;
      }
    }
  }

  .avatar-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px; /* Set equal width and height for a circle */
    height: 40px;
    border: none;
    cursor: pointer;
    background-color: #333333;
    color: white;
    padding: 8px 12px;
    border-radius: 50%;
    font-size: 1.2rem;
    transition: background-color 0.3s ease, transform 0.3s ease; /* Smooth transition for hover effect */
  }

  .avatar-button:hover {
    background-color: #666666;
    transform: scale(1.05); /* Scale up the button on hover */
  }

  .avatar-icon {
    font-text: 5rem;
    color: #fff;
    align-items: center;
  }

  .user-info-popup {
    position: absolute;
    top: 70%;
    right: 32px;
    width: 250px;
    margin-top: 9px;
    padding: 20px;
    background-color: #061114;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    text-align: left;
    z-index: 10;
  }

  .user-info-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .popup-icon {
    font-size: 4rem;
    color: #fff;
    margin-top: -9px;
    margin-right: 8px;
    align-items: center;
  }

  .user-details {
    display: flex;
    flex-direction: row;
    text-align: left;
  }

  .user-text {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .user-profile-name {
    font-size: 1rem;
    color: #fff;
    margin-bottom: 0px;
    margin-left: 2px;
  }

  .user-profile-url {
    font-size: 1rem;
    text-align: center;
    color: #fff;
    margin-bottom: 0;
    margin-left: 0;
  }

  .profile-link {
    color: #fff;
    text-decoration: none;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;
  }

  .profile-link:hover {
    text-decoration: underline;
    color: #b3b3ff;
  }

  .logout-button {
    width: 100%;
    padding: 8px;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #061114;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 15px;
    display: flex;
    align-items: left;
    justify-content: left;
  }

  .logout-button:hover {
    background-color: #666666;
    text-decoration: underline;
  }

  .logout-icon {
    margin-right: 8px; /* Space between icon and text */
    font-size: 1.2rem; /* Adjust icon size */
  }

  .switch-user-button {
    width: 100%;
    padding: 8px;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #061114;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 15px;
    display: flex;
    align-items: left;
    justify-content: left;
  }

  .switch-user-button:hover {
    background-color: #666666;
    text-decoration: underline;
  }

  .switch-icon {
    margin-right: 8px; /* Space between icon and text */
    font-size: 1.2rem; /* Adjust icon size */
  }

  .info-button {
    width: 100%;
    padding: 8px;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #061114;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 15px;
    display: flex;
    align-items: left;
    justify-content: left;
  }

  .info-button:hover {
    background-color: #666666;
    text-decoration: underline;
  }

  .info-icon {
    margin-right: 8px; /* Space between icon and text */
    font-size: 1.2rem; /* Adjust icon size */
  }

  .settings-button {
    width: 100%;
    padding: 8px;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    background-color: #061114;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 15px;
    display: flex;
    align-items: left;
    justify-content: left;
  }

  .settings-button:hover {
    background-color: #666666;
    text-decoration: underline;
  }

  .settings-icon {
    margin-right: 8px; /* Space between icon and text */
    font-size: 1.2rem; /* Adjust icon size */
  }

  .info-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(0.01px);
    background-color: rgba(6, 17, 20, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .info-content {
    background-color: #2f2f2f;
    opacity: 1;
    padding: 20px;
    border-radius: 12px;
    width: 400px;
    max-width: 80%;
    height: 500px;
    text-align: left;
    color: white;
  }

  .info-content h2 {
    margin-top: 0;
  }

  .info-details {
    background-color: #2f2f2f; /* Dark background for contrast */
    padding: 20px;
    border-radius: 8px;
    color: #ffffff;
    font-family: Arial, sans-serif;
    line-height: 1.6;
    width: 100%;
    max-width: 400px;
  }

  .info-details p {
    margin: 10px 0;
    font-size: 16px;
    color: #d1d1d1;
    word-wrap: break-word;
  }

  .info-details p:first-child {
    margin-top: 0;
  }

  .info-details p:last-child {
    margin-bottom: 0;
  }

  /* Optional styling for labels */
  .info-details p::before {
    content: "• "; /* Adds a bullet point */
    color: #white; /* Accent color for bullet points */
  }

  .manage-account-button {
    display: block; /* Makes the button a block element */
    background-color: #2f2f2f; 
    color: white; /* Text color */
    padding: 10px 20px; 
    border: 0.1px solid white;
    border-radius: 20px; /* Rounded corners */
    font-size: 16px; /* Font size */
    font-family: Arial, sans-serif; 
    text-align: center; /* Center text */
    cursor: pointer; /* Pointer cursor on hover */
    margin: 130px auto 0; 
    width: 200px; /* Set a fixed width */
  }

  .manage-account-button:hover {
    background-color: #666666;
  }

  .manage-account-button:focus {
    outline: none; /* Remove outline on focus */
    box-shadow: 0 0 5px rgba(76, 195, 247, 0.5); /* Light shadow on focus */
  }

  .search__bar {
    position: relative;
    background-color: white;
    width: 40%;
    padding: 0.5rem 1.2rem;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.3s ease, transform 0.2s ease;
  }

  .search__bar input {
    border: none;
    height: 2rem;
    width: 100%;
    font-size: 1rem;
    padding: 0.1rem 0.5rem;
    color: #333;
    border-radius: 2rem;
    background: #f8f8f8;
  }

  .search__bar input:focus {
    outline: none;
    background-color: #fff;
  }

  .search__bar:focus-within {
    box-shadow: 0 0 6px 2px rgba(0, 100, 255, 0.4);
    transform: scale(1);
  }

  .suggestions {
    position: absolute;
    top: calc(100% + 1rem);
    left: 0;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    width: 100%; /* Matching width of search bar */
    z-index: 1;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.3s ease;
  }

  .suggestions li {
    list-style-type: none;
    padding: 10px 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease;
    border-radius: 8px;
  }

  .suggestions li img {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .suggestions li span {
    color: #333;
    font-weight: 500;
    margin-left: 10px;
  }

  .suggestions li span.item-type {
    color: #aaa;
    font-size: 0.85rem;
    margin-left: auto;
  }

  .suggestions li:hover {
    background-color: #f8f8f8;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .search__bar {
      width: 80%;
      padding: 0.5rem;
    }

    .suggestions {
      width: 80%;
      left: 10%;
    }
  }
`;

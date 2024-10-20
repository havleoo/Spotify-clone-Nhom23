import React, { useState } from "react";
import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import { reducerCases } from "../utils/Constants";
import { CgProfile } from "react-icons/cg";
import { useStateProvider } from "../utils/StateProvider";
import axios from "axios";

export default function Navbar({ navBackground }) {
  const [{ userInfo }] = useStateProvider();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [{ token }, dispatch] = useStateProvider();

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search?q=${query}&type=track%2Calbum%2Cartist&market=VN&limit=5`,
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
        image: track.album.images[2].url,
        context_uri: track.album.uri,
        track_number: track.track_number,
        type: "track",
      }));

      const albumSuggestions = items.albums.items.slice(0, 5).map((album) => ({
        id: album.id,
        name: album.name,
        artists: album.artists.map((artist) => artist.name),
        image: album.images[2].url,
        context_uri: album.uri,
        type: "album",
        external_urls: album.external_urls,
      }));

      const artistSuggestions = items.artists.items
        .slice(0, 2)
        .map((artist) => ({
          id: artist.id,
          name: artist.name,
          image: artist.images[2].url,
          type: "artist",
          external_urls: artist.external_urls,
        }));

      setSuggestions([
        ...trackSuggestions,
        ...albumSuggestions,
        ...artistSuggestions,
      ]);
    } catch (error) {
      console.error("Error fetching: ", error);
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
          placeholder="Artists, songs, or podcasts"
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
      <div className="avatar">
        <a href="#">
          <CgProfile />
          <span>{userInfo?.userName}</span>
        </a>
      </div>
    </Container>
  );
}

const Container = styled.div`
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
  .search__bar {
    background-color: white;
    width: 30%;
    padding: 0.4rem 1rem;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    input {
      border: none;
      height: 2rem;
      width: 100%;
      &:focus {
        outline: none;
      }
    }
  }
  .avatar {
    background-color: black;
    padding: 0.3rem 0.4rem;
    padding-right: 1rem;
    border-radius: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    a {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: white;
      font-weight: bold;
      svg {
        font-size: 1.3rem;
        background-color: #282828;
        padding: 0.2rem;
        border-radius: 1rem;
        color: #c7c5c5;
      }
    }
  }
`;

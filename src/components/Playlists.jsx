import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";

export default function Playlists({ showCreateInput, onCreateSuccess }) {
  const [{ token, playlists, userInfo, newPlaylistName }, dispatch] = useStateProvider();
  const [contextMenu, setContextMenu] = useState(null); // Lưu trữ vị trí của menu ngữ cảnh
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  useEffect(() => {
    const getPlaylistData = async () => {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/playlists",
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      const { items } = response.data;
      const playlists = items.map(({ name, id }) => {
        return { name, id };
      });
      dispatch({ type: reducerCases.SET_PLAYLISTS, playlists });
    };
    getPlaylistData();
  }, [token, dispatch]);

  const createPlaylist = async () => {
    if (newPlaylistName.trim() === "") return; // Kiểm tra nếu tên trống
    const response = await axios.post(
      `https://api.spotify.com/v1/users/${userInfo.userId}/playlists`, // Thêm userId vào API
      {
        name: newPlaylistName,
        description: "New playlist created via Spotify Clone",
        public: false,
      },
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );
    const createdPlaylist = { name: response.data.name, id: response.data.id };
    dispatch({
      type: reducerCases.SET_PLAYLISTS,
      playlists: [...playlists, createdPlaylist], // Thêm playlist mới vào danh sách
    });
    dispatch({ type: reducerCases.SET_NEW_PLAYLIST_NAME, newPlaylistName: "" }); // Reset tên sau khi tạo

    onCreateSuccess(); // Ẩn input sau khi tạo playlist thành công
  };

  const handlePlaylistNameChange = (e) => {
    dispatch({
      type: reducerCases.SET_NEW_PLAYLIST_NAME,
      newPlaylistName: e.target.value, // Cập nhật tên playlist qua dispatch
    });
  };

  const changeCurrentPlaylist = async (selectedPlaylistId) => {
    dispatch({ type: reducerCases.SET_PLAYLIST_ID, selectedPlaylistId });

    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks`,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.items.length === 0) {
      alert("Playlist này rỗng!"); // Hiển thị alert nếu playlist rỗng
    }
  };

  const handleRightClick = (event, playlistId) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
    setSelectedPlaylistId(playlistId);
  };

  const deletePlaylist = async () => {
    if (selectedPlaylistId) {
      await axios.delete(
        `https://api.spotify.com/v1/playlists/${selectedPlaylistId}/followers`,
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );
      dispatch({
        type: reducerCases.SET_PLAYLISTS,
        playlists: playlists.filter((playlist) => playlist.id !== selectedPlaylistId),
      });
    }
    setContextMenu(null); // Đóng menu ngữ cảnh sau khi xóa
  };

  return (
    <Container>
      {showCreateInput && (
        <div className="create-playlist">
          <input
            type="text"
            placeholder="Enter playlist name"
            value={newPlaylistName}
            onChange={handlePlaylistNameChange}
          />
          <button onClick={createPlaylist}>Create Playlist</button>
        </div>
      )}
      <ul>
        {playlists.map(({ name, id }) => (
          <li
            key={id}
            onClick={() => changeCurrentPlaylist(id)}
            onContextMenu={(e) => handleRightClick(e, id)}
          >
            {name}
          </li>
        ))}
      </ul>

      {contextMenu && (
        <ContextMenu
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={deletePlaylist}
        >
          Delete Playlist
        </ContextMenu>
      )}
    </Container>
  );
}

const Container = styled.div`
  color: #b3b3b3;
  height: 100%;
  overflow: hidden;

  .create-playlist {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    input {
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      outline: none;
    }
    button {
      padding: 0.5rem;
      background-color: #1db954;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: 0.3s ease-in-out;
      &:hover {
        background-color: #1ed760;
      }
    }
  }

  ul {
    list-style-type: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    max-height: 400px; /* Giới hạn chiều cao của danh sách playlist */
    overflow-y: auto; /* Bật tính năng cuộn khi danh sách vượt quá chiều cao */
    &::-webkit-scrollbar {
      width: 0.7rem;
      &-thumb {
        background-color: rgba(255, 255, 255, 0.6);
      }
    }
    li {
      transition: 0.3s ease-in-out;
      cursor: pointer;
      &:hover {
        color: white;
      }
    }
  }
`;

const ContextMenu = styled.div`
  position: absolute;
  background-color: #333;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  &:hover {
    background-color: #444;
  }
`;

import axios from "axios";
import React, { useEffect } from "react";
import styled from "styled-components";
import { reducerCases } from "../utils/Constants";
import { useStateProvider } from "../utils/StateProvider";

export default function Playlists() {
  const [{token, dispatch}] = useStateProvider();
  useEffect(() => {
    const getPlaylistData = async () => {
      const response = await axios.get('https://api.spotify.com/v1/me/playlists', 
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      
      );
      console.log(response);
    };
    getPlaylistData();
  }, [token, dispatch]);
  // return (
  //   <Container>

  //   </Container>
  // );
  return <div>Playlists</div>;
}

// const Container = styled.div`
  
// `;

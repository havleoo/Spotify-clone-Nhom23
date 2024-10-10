import React from "react";
import styled from "styled-components";

export default function Sidebar() {
  return (
    <Container>
      <div className="top__links">
        <div className="logo">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCpYrVsWwufHstOUb2Xmi4Q-EjwAB0jmhl8y071LKMTmZFR5WlSkCXpHafKHqGdTv3YGM&usqp=CAU"
            alt="Spotify-Clone-Logo"
          />
        </div>
        <ul>
          <li>
            <span>Home</span>
          </li>
          <li>
            <span>Search</span>
          </li>
          <li>
            <span>Your Library</span>
          </li>
        </ul>
      </div>
    </Container>
  );
}

const Container = styled.div`

`;

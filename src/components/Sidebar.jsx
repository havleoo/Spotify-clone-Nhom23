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
  background-color: black;
  color: #b3b3b3;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .top__links {
    display: flex;
    flex-direction: column;
    .logo {
      text-align: center;
      margin: 1rem 0;
      img {
        max-inline-size: 80%
        block-size: auto;
      }
    }
    ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      li {
        display: flex;
        gap: 1rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover{
          color: white;
        }
      }
    }
  }
`;

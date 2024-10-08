import axios from "axios";
import React, { useEffect } from "react";
import styled from "styled-components";

export default function Body({ headerBackground }) {

  return (
    <Container headerBackground={headerBackground}>
      BODY
    </Container>
  );
}

const Container = styled.div` 
`;

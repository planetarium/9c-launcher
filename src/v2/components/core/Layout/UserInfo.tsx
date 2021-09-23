import React from "react";
import { motion } from "framer-motion";
import { styled } from "@stitches/react";

const UserInfoStyled = styled(motion.ul, {
  position: "fixed",
  top: 30,
  left: 50,
  display: "flex",
  flexDirection: "column",
  padding: 0,
  margin: 0,
});

const UserInfoItem = styled(motion.li, {
  display: "flex",
  height: 27,
});

export default function UserInfo() {
  return (
    <UserInfoStyled>
      <UserInfoItem></UserInfoItem>
      <UserInfoItem>hello world</UserInfoItem>
    </UserInfoStyled>
  );
}

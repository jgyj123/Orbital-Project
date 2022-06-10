import React, { useState, useEffect } from "react";
import "./AddPost.css";
import {
  Input,
  Box,
  Avatar,
  Flex,
  Select,
  Button,
  Spacer,
  ButtonGroup,
} from "@chakra-ui/react";

import {
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { auth } from "../../firebase";
import { db } from "../../firebase";
import { serverTimestamp } from "firebase/firestore";
import { right } from "@popperjs/core";
const AddPost = (props) => {
  const [clubValue, setClubValue] = useState("");
  const [userData, setUserData] = useState([]);
  const handleChange = (event) => {
    setClubValue(event.target.selectedOptions[0].value);
  };
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("uid", "==", auth.currentUser.uid)
    );
    const docs = getDocs(q);
    docs.then((res) => {
      setUserData(res.docs[0].data());
    });
  }, []);
  const [message, setMessage] = useState("");
  const submitPost = () => {
    const newDate = Date.now();
    const username = userData.name;
    const pic = auth.currentUser.photoURL
      ? auth.currentUser.photoURL
      : "/25541.jpg";
    addDoc(collection(db, "posts"), {
      club: clubValue,
      date: serverTimestamp(),
      message: message,
      username: username,
      profilePic: pic,
    });
    setMessage("");
  };
  return (
    <Box w="100%" bg="white" shadow="lg" p={4} position="relative">
      <Flex align="center">
        <Avatar
          src={
            auth.currentUser.photoURL ? auth.currentUser.photoURL : "/25541.jpg"
          }
        ></Avatar>
        <Input
          placeholder="Say something to your friends!"
          ml={4}
          mr={4}
          width="55%"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        ></Input>
        <Spacer />
        <ButtonGroup gap="1">
          <Select placeholder="Choose a club" onChange={handleChange}>
            <option value="Chess Masters">Chess Masters</option>
            <option value="Liver Enthusiasts">Liver Enthusiasts</option>
          </Select>
          <Button
            margin="auto"
            padding="10px;"
            size="s"
            onClick={submitPost}
            float="right"
          >
            Post
          </Button>
        </ButtonGroup>
      </Flex>
    </Box>
  );
};

export default AddPost;

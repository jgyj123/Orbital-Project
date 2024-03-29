import React, { useEffect } from "react";
import { Box, Flex, Input, Button } from "@chakra-ui/react";
import { useState } from "react";
import { realTimeDb } from "../../firebase";
import { onValue, ref, update, set, push, child } from "firebase/database";
import Message from "./Message";
const InGameChat = (props) => {
  const [messageText, setMessageText] = useState("");

  const handleClick = () => {
    if (messageText !== "") {
      const key = push(
        child(ref(realTimeDb), "messages/" + props.id + "/messages")
      ).key;
      const newRef = ref(
        realTimeDb,
        "messages/" + props.id + "/messages/" + key
      );

      set(newRef, {
        senderName: props.color === "white" ? props.playerOne : props.playerTwo,
        message: messageText,
        color: props.color,
      });

      setMessageText("");
    }
  };
  return (
    <Flex direction="column" position="relative" height="60vh">
      <Box overflow="scroll" height="85%">
        {props.messages.map((item) => {
          return (
            <Message
              message={item[1].message}
              focusColor={props.color}
              senderColor={item[1].color}
              key={item[0]}
              opponentPic={
                props.color === "white" ? props.secondPic : props.firstPic
              }
            />
          );
        })}
      </Box>
      <Box marginTop="auto" marginBottom="4px" display="flex">
        <Input
          bottom="10px"
          mr="4px"
          type="text"
          id="messageBox"
          placeholder="Enter a message here..."
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleClick();
            }
          }}
        ></Input>

        <Button
          colorScheme="gray"
          onClick={(e) => {
            handleClick();
          }}
          bottom="10px"
        >
          Send
        </Button>
      </Box>
    </Flex>
  );
};

export default InGameChat;

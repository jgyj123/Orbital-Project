import { HStack, VStack, Text, Flex, Box, propNames } from "@chakra-ui/react";
import React from "react";
import { BsFillPersonFill } from "react-icons/bs";
import { FaChessKing } from "react-icons/fa";
import { StackDivider } from "@chakra-ui/react";

const Post = (props) => {
  return (
    <Box w="100%">
      <VStack
        divider={<StackDivider />}
        p={4}
        bg="white"
        shadow="lg"
        marginTop={4}
      >
        <Flex w="100%" alignItems="center">
          <VStack>
            <HStack>
              <BsFillPersonFill></BsFillPersonFill>
              <Text>{props.name}</Text>
            </HStack>
          </VStack>

          <HStack bg="gray.100" marginLeft="auto">
            <FaChessKing />
            <Text>{props.club}</Text>
          </HStack>
        </Flex>
        <Text w="100%" textAlign="left">
          {props.message}
        </Text>
      </VStack>
    </Box>
  );
};

export default Post;

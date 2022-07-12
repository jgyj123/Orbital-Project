import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { VStack } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { realTimeDb } from "../../firebase";
import { set, ref, push, child } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { auth } from "../../firebase";
import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
const JoinGameButtons = () => {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("uid", "==", auth.currentUser.uid)
    );
    getDocs(q).then((res) => {
      if (res.docs[0].data().currentGame !== null) {
        setPlaying(true);
      }
    });
  }, []);
  const handleClick = () => {
    const gameKey = push(child(ref(realTimeDb), "games")).key;

    const q = query(
      collection(db, "users"),
      where("uid", "==", auth.currentUser.uid)
    );
    getDocs(q).then((res) => {
      const id = res.docs[0].id;
      const name = res.docs[0].data().name;
      const photo = res.docs[0].data().profilePic;
      const rating = res.docs[0].data().rating;

      const userRef = doc(db, "users", id);

      set(ref(realTimeDb, "games/" + gameKey), {
        gameId: gameKey,
        fen: "start",
        pgn: "start",
        playerOne: id,
        playerOneName: name,
        playerOneRating: rating,
        playerTwoRating: null,
        playerTwo: null,
        playerOnePic: photo ? photo : "25541.jpg",
        playerTwoName: null,
        playerOneTime: 300,
        playerTwoTime: 300,
        gameStarted: false,
        mode: "create",
        gameEnded: false,
      });
      set(ref(realTimeDb, "challenges/" + gameKey), {
        id: gameKey,
        challenger: name,
        challengerPic: photo ? photo : "25541.jpg",
        challengerId: id,
      });
      set(ref(realTimeDb, "messages/" + gameKey), {
        id: gameKey,
        playerOne: name,
        playerOnePic: photo ? photo : "25541.jpg",
      });
      updateDoc(userRef, {
        currentGame: gameKey,
        currentColor: "white",
      });
      navigate("/game");
    });
  };
  return (
    <VStack w="25%" bg="#615D56" minWidth="300px">
      <Button
        w="80%"
        size="lg"
        p="4px;"
        marginTop={10}
        backgroundColor="#252323"
        color="#F5F5F5"
        border="2px"
        borderColor="#ffffff"
        _hover={{ bg: "#ebedf0", color: "#000000" }}
        onClick={handleClick}
      >
        CREATE GAME
      </Button>
      {playing ? (
        <Button
          w="80%"
          size="lg"
          p="4px;"
          marginTop={10}
          backgroundColor="red"
          color="#F5F5F5"
          border="2px"
          borderColor="#ffffff"
          _hover={{ bg: "#ebedf0", color: "red" }}
          onClick={() => navigate("/game")}
        >
          RETURN TO GAME
        </Button>
      ) : (
        "hidden"
      )}
    </VStack>
  );
};

export default JoinGameButtons;

import { React, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import Chessboard from "chessboardjsx";
import { realTimeDb } from "./firebase";
import { update, ref, onValue } from "firebase/database";
import { db } from "./firebase";
import { auth } from "./firebase";
import { BiTimer } from "react-icons/bi";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import {
  Box,
  Text,
  Flex,
  Center,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { BsCameraVideo, BsChat } from "react-icons/bs";
import InGameChat from "./components/inGameChatComponents/InGameChat";

const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:openrelay.metered.ca:80",
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
});

const Game = ({ mode, callId, setPage }) => {
  // takes in Game id, white/black
  //When player creates a game, an unique game Id is created and both players will connect to this unique Id.
  // Both users have reference to the same game node on the real-time db based on game Id.
  const [id, setId] = useState("");
  const [fen, setFen] = useState("start");
  const [color, setColor] = useState("white");
  const [playerOneName, setPlayerOneName] = useState("");
  const [PlayerTwoName, setPlayerTwoName] = useState("Waiting for opponent...");
  const [pgn, setPgn] = useState("");
  const [messages, setMessages] = useState([]);
  const [playerOnePic, setPlayerOnePic] = useState("");
  const [playerTwoPic, setPlayerTwoPic] = useState("");

  // Either we convert the videoCalling portion into an exportable component or we bring over the functionality
  /*
  VIDEO PORTION START
  */
  const [webcamActive, setWebcamActive] = useState(false);
  const [roomId, setRoomId] = useState(callId);
  const localRef = useRef();
  const remoteRef = useRef();
  const setupSources = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const remoteStream = new MediaStream();
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };
    localRef.current.srcObject = localStream;
    remoteRef.current.srcObject = remoteStream;
    setWebcamActive(true);

    if (mode === "create") {
      console.log("setting...");
      const callDoc = doc(collection(db, "calls"));
      const offerCandidates = collection(callDoc, "offerCandidates");
      const answerCandidates = collection(callDoc, "answerCandidates");
      setRoomId(callDoc.id);
      pc.onicecandidate = (event) => {
        event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
      };
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);
      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await setDoc(callDoc, { offer });
      console.log("set");

      onSnapshot(callDoc, (snapshot) => {
        const data = snapshot.data();
        if (!pc.currentRemoteDescription && data?.answer) {
          const answerDescription = new RTCSessionDescription(data.answer);
          pc.setRemoteDescription(answerDescription);
        }
      });

      onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    } else if (mode === "join") {
      const callDoc = doc(collection(db, "calls"), callId);
      const offerCandidates = collection(callDoc, "offerCandidates");
      const answerCandidates = collection(callDoc, "answerCandidates");
      pc.onicecandidate = (event) => {
        event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
      };
      //change
      const callData = (await getDoc(callDoc)).data();
      const offerDescription = callData.offer;
      await pc.setRemoteDescription(
        new RTCSessionDescription(offerDescription)
      );

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        sdp: answerDescription.sdp,
        type: answerDescription.type,
      };
      //change
      await updateDoc(callDoc, { answer });

      onSnapshot(offerCandidates, (snapshot) => {
        //change?
        snapshot.docs.forEach((change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    }
    pc.onconnectionstatechange = (event) => {
      if (pc.connectionState === "disconnected") {
        hangUp();
      }
    };
  };

  const hangUp = async () => {
    pc.close();
    if (roomId) {
      let roomRef = doc(collection(db, "calls"), roomId);
      await getDocs(collection(roomRef, "answerCandidates")).then(
        (querySnapshot) => {
          querySnapshot.forEach((item) => {
            //change
            deleteDoc(doc(db, "answerCandidates", item.id));
          });
        }
      );
      await getDocs(collection(roomRef, "offerCandidates")).then(
        (querySnapshot) => {
          //change
          querySnapshot.forEach((document) => {
            console.log(document);
          });
        }
      );
      //change
      await deleteDoc(doc(db, "calls", roomId));
    }
    window.location.reload();
  };
  /*
 VIDEO PORTION END
 */

  const setWidth = ({ screenWidth, screenHeight }) => {
    if (screenWidth / 2 < 600) {
      return 600;
    }
    return screenWidth / 2;
  };
  const onDrop = ({ sourceSquare, targetSquare }) => {
    if (
      (game.current.turn() == "w" && color != "white") ||
      (game.current.turn() == "b" && color != "black")
    ) {
      return;
    }
    let move = game.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move == null) return;

    const gameRef = ref(realTimeDb, "games/" + id);
    update(gameRef, {
      fen: game.current.fen(),
    });
    setFen(game.current.fen());
  };
  let game = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("uid", "==", auth.currentUser.uid)
    );
    getDocs(q).then((res) => {
      const newId = res.docs[0].data().currentGame;
      setColor(res.docs[0].data().currentColor);
      setId(newId);
      const messageRef = ref(realTimeDb, "messages/" + newId);
      onValue(messageRef, (snapshot) => {
        const data = snapshot.val().messages;
        const newArr = [];
        for (var key in data) {
          newArr.push([key, data[key]]);
        }
        setMessages(newArr);
        setPlayerOnePic(snapshot.val().playerOnePic);
        setPlayerTwoPic(snapshot.val().playerTwoPic);
      });
      game.current = new Chess();

      const gameRef = ref(realTimeDb, "games/" + newId);
      onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        game.current.load(data.fen);
        setFen(data.fen);
        setPlayerOneName(data.playerOneName);

        setPgn(game.current.pgn({ max_width: 5, newline_char: "<br />" }));
        if (data.playerTwoName != null) {
          setPlayerTwoName(data.playerTwoName);
        }
      });
    });
  }, []);
  return (
    <Flex height={"calc(100vw/2)"}>
      <Tabs
        bg="white"
        height="100%"
        width="25%"
        padding="20px"
        minWidth="300px"
        minHeight="600px"
      >
        <TabList>
          <Tab width="50%" alignItems="center">
            Video
            <Box marginLeft="4px">
              <BsCameraVideo size="1.3em" />
            </Box>
          </Tab>
          <Tab width="50%">
            Chat
            <Box marginLeft="4px">
              <BsChat size="1.1em" />
            </Box>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box height="50%">
              <Text textAlign="center" fontSize={28}>
                {color == "white" ? PlayerTwoName : playerOneName}
              </Text>
              <Flex
                bg="black"
                alignItems="center"
                justifyContent="center"
                width="300x"
                height="225px"
              >
                <Text color="white">Player Two Video</Text>
              </Flex>
            </Box>
            <Box height="50%">
              <Text textAlign="center" fontSize={28}>
                {color == "black" ? PlayerTwoName : playerOneName}
              </Text>
              <Flex
                bg="black"
                alignItems="center"
                justifyContent="center"
                width="300x"
                height="225px"
              >
                <Text color="white">Player One Video</Text>
              </Flex>
            </Box>
          </TabPanel>
          <TabPanel>
            <InGameChat
              playerOne={playerOneName}
              playerTwo={PlayerTwoName}
              firstPic={playerOnePic}
              secondPic={playerTwoPic}
              id={id}
              color={color}
              messages={messages}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Chessboard
        position={fen}
        calcWidth={setWidth}
        onDrop={onDrop}
        orientation={color}
      />
      <Box
        width="25%"
        bg="white"
        height="100%"
        minWidth="300px"
        minHeight="600px"
      >
        <Center height="15%" borderBottom=" 2px solid black">
          <Flex alignItems="center">
            <BiTimer size={55}></BiTimer>
            <Text fontSize="40px" fontWeight="500">
              3:00
            </Text>
          </Flex>
        </Center>
        <Center width="100%" height="70%">
          <Text>Chess Pgn here</Text>
        </Center>
        <Center height="15%" borderTop="2px solid black">
          <Flex alignItems="center">
            <BiTimer size={55}></BiTimer>
            <Text fontSize="40px" fontWeight="500">
              3:00
            </Text>
          </Flex>
        </Center>
      </Box>
    </Flex>
  );
};

export default Game;

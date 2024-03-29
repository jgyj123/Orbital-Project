import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { collection } from "firebase/firestore";
import { OAuthButtonGroup } from "./OAuthButtonGroup";
import { PasswordField } from "./PasswordField";
import { auth, db } from "../firebase";

import logo from "../components/Logo.png";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { useUserAuth } from "../authProvider";

export const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [user, setUser] = useState();
  const usersRef = collection(db, "users");
  const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithGoogle,
  } = useUserAuth();
  const login = async () => {
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      setUser(user);
      alert("Login Success!");
      navigate("/");
    } catch (e) {
      console.log(e.message);
      alert(e.message);
    }
  };
  const loginWithGoogle = () => {
    signInWithGoogle()
      .then(() => {
        setUser(auth.currentUser);
        navigate("/");
      })
      .catch(function (error) {
        console.log(error.code);
        alert(error.message);
      });
  };

  const signUp = () => {
    navigate("/signUp");
  };

  // const logout = async () => {
  //   try {
  //     signOut(auth);
  //   } catch (e) {
  //     console.log(e.message);
  //   }
  // };
  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="logo-container">
        <img
          className="logo"
          src={logo}
          height="128px"
          width="128px"
          alt="Logo"
        />
        <p className="logo-text">BetterChess</p>
      </div>
      <Container
        maxW="lg"
        py={{
          base: "12",
          md: "24",
        }}
        px={{
          base: "0",
          sm: "8",
        }}
      >
        <Stack spacing="8">
          <Stack spacing="6">
            <Stack
              spacing={{
                base: "2",
                md: "3",
              }}
              textAlign="center"
            >
              <Heading
                size={useBreakpointValue({
                  base: "s",
                  md: "sm",
                })}
              >
                Log in to your account
              </Heading>
              <HStack spacing="1" justify="center">
                <Text color="muted">Don&apos;t have an account?</Text>
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={signUp}
                  id="sign-up"
                >
                  Sign up
                </Button>
              </HStack>
            </Stack>
          </Stack>
          <Box
            py={{
              base: "0",
              sm: "8",
            }}
            px={{
              base: "4",
              sm: "10",
            }}
            bg="white"
            boxShadow={{
              base: "none",
              sm: useColorModeValue("md", "md-dark"),
            }}
            borderRadius={{
              base: "none",
              sm: "xl",
            }}
          >
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                    }}
                  />
                </FormControl>
                <PasswordField
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                  }}
                />
              </Stack>
              <HStack justify="space-between">
                <Checkbox defaultChecked>Remember me</Checkbox>
                {/* <Button variant="link" colorScheme="blue" size="sm">
                  Forgot password?
                </Button> */}
              </HStack>
              <Stack spacing="6">
                <Button colorScheme="messenger" onClick={login} id="login">
                  Sign in
                </Button>
                <HStack>
                  <Divider />
                  <Text fontSize="sm" whiteSpace="nowrap" color="muted">
                    or continue with
                  </Text>
                  <Divider />
                </HStack>
                <OAuthButtonGroup
                  signInWithGoogle={loginWithGoogle}
                  id="google-login"
                />
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </div>
  );
};
export default Login;

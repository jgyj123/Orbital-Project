import { Button, ButtonGroup, VisuallyHidden } from "@chakra-ui/react";
import { GoogleIcon } from "./ProviderIcons";
import React from "react";

const providers = [
  {
    name: "Google",
    icon: React.createElement(GoogleIcon, { boxSize: "5" }),
  },
];

export const OAuthButtonGroup = (props) => (
  <ButtonGroup variant="outline" spacing="4" width="full">
    {providers.map(({ name, icon }) => (
      <Button key={name} width="full" onClick={props.signInWithGoogle}>
        <VisuallyHidden>Sign in with {name}</VisuallyHidden>
        {icon}
      </Button>
    ))}
  </ButtonGroup>
);

import {
  ButtonGroup,
  ButtonGroupProps,
  IconButton,
  Link,
} from "@chakra-ui/react";
import * as React from "react";
import { FaGithub, FaTwitter } from "react-icons/fa";

export const SocialMediaLinks = (props: ButtonGroupProps) => (
  <ButtonGroup variant="ghost" color="gray.600" {...props}>
    <Link href="https://github.com/ksuhara/pixel-onchained" isExternal>
      <IconButton aria-label="GitHub" icon={<FaGithub fontSize="20px" />} />
    </Link>
    <Link href="https://twitter.com/suhara_ponta" isExternal>
      <IconButton aria-label="Twitter" icon={<FaTwitter fontSize="20px" />} />
    </Link>
  </ButtonGroup>
);

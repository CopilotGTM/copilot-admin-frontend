import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

// fast dot-pulse
const dotPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.3; transform: scale(0.8); }
`;

// fast continuous rotation
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

export default function LoadingCursor() {
  return (
    <Box
      m={2}
      alignSelf="flex-start"
      position="relative"
      w="24px"
      h="24px"
      css={{
        transformOrigin: "center center",
        animation: `
          ${rotate} 1s linear infinite
        `,
      }}
    >
      {/* Top */}
      <Box
        as="span"
        position="absolute"
        top="0"
        left="8px"
        w="8px"
        h="8px"
        bg="purple.400"
        borderRadius="full" // remove if you want true squares
        animation={`${dotPulse} 0.6s infinite ease-in-out`}
      />

      {/* Right */}
      <Box
        as="span"
        position="absolute"
        top="8px"
        right="0"
        w="8px"
        h="8px"
        bg="purple.500"
        borderRadius="full"
        animation={`${dotPulse} 0.6s infinite ease-in-out 0.15s`}
      />

      {/* Bottom */}
      <Box
        as="span"
        position="absolute"
        bottom="0"
        left="8px"
        w="8px"
        h="8px"
        bg="purple.600"
        borderRadius="full"
        animation={`${dotPulse} 0.6s infinite ease-in-out 0.3s`}
      />

      {/* Left */}
      <Box
        as="span"
        position="absolute"
        top="8px"
        left="0"
        w="8px"
        h="8px"
        bg="purple.700"
        borderRadius="full"
        animation={`${dotPulse} 0.6s infinite ease-in-out 0.45s`}
      />
    </Box>
  );
}

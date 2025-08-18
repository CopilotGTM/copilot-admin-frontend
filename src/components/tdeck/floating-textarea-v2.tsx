import { Button, Flex, IconButton, Textarea } from "@chakra-ui/react";
import { Mic, Plus, SendHorizonal } from "lucide-react";
import { motion } from "framer-motion";
import { useColorModeValue } from "../ui/color-mode";

interface FloatingTextAreaV2Props {
  isValid: boolean;
  isLoading: boolean;
  handleSubmit: () => void;
}

export const FloatingTextAreaV2 = ({
  isValid,
  isLoading,
  handleSubmit,
  ...props
}: FloatingTextAreaV2Props) => {
  return (
    <Flex
      //left={"1/2"}
      //translateX={"-50%"}
      position={"absolute"}
      // Center or bottom positioning based on `align` prop
      bottom={5}
      flexDirection={"column"}
      w={"full"}
    >
      <motion.div
        initial={{ opacity: 0, translateY: 50 }} // Initial state (hidden and slightly above)
        animate={{ opacity: 1, translateY: 0 }} // Final state (fully visible and in place)
        transition={{ duration: 0.2 }} // Duration of the animation
      >
        <Flex
          alignItems="center"
          gap="24px"
          bg={useColorModeValue("white", "unset")}
          borderRadius="16px"
          direction={"column"}
          p="24px"
          mx="auto"
          shadow={"md"}
          blur={"md"}
          border={"1px solid"}
          w={"full"}
          borderColor={"gray.200"}
        >
          {/* Input field */}
          <Textarea
            {...props}
            placeholder="Modify deck or ask a question"
            size="sm"
            w="full"
            border="none"
            rows={1}
            maxH={"200px"}
            resize={"vertical"}
            autoresize
            _focus={{
              boxShadow: "none",
              border: "none",
              outline: "none",
            }}
            disabled={isLoading}
          />
          {/* Left-side buttons */}
          <Flex
            w={"full"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Flex alignItems={"center"} gap={2}>
              <Button
                key={"deck"}
                size="xs"
                px={4}
                borderRadius={"full"}
                bg={"gray.100"}
                color={"gray.600"}
                fontSize={"sm"}
                fontWeight={"medium"}
                lineHeight={"20px"}
                cursor={"none"}
              >
                Deck
              </Button>
            </Flex>

            <Flex alignItems={"center"} gap={2}>
              {/* Right-side icons/buttons */}
              <IconButton
                aria-label="Toggle sidebar"
                variant="ghost"
                rounded={"full"}
                size={"md"}
                color={"gray.500"}
                disabled={isLoading}
              >
                <Plus />
              </IconButton>
              <IconButton
                aria-label="Toggle sidebar"
                variant="ghost"
                rounded={"full"}
                size={"md"}
                color={"gray.500"}
                disabled={isLoading}
              >
                <Mic />
              </IconButton>
              <IconButton
                aria-label="Toggle sidebar"
                variant="ghost"
                rounded={"full"}
                size={"md"}
                color={"gray.500"}
                loading={isLoading}
                disabled={!isValid || isLoading}
                onClick={handleSubmit}
              >
                <SendHorizonal />
              </IconButton>
            </Flex>
          </Flex>
        </Flex>
      </motion.div>
    </Flex>
  );
};

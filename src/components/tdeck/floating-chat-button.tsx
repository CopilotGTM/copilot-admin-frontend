import { Box, Text, Flex, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";

interface FloatingChatButtonProps {
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

const FloatingChatButton = ({ onClick }: FloatingChatButtonProps) => {
  return (
    <Box pos={"absolute"} left={0} bottom={16} zIndex={10}>
      <Flex
        onClick={onClick}
        align="center"
        bgGradient="to-r"
        gradientFrom="purple.600"
        gradientTo="blue.500"
        borderEndRadius="full"
        px={4}
        py={2}
        color="white"
        fontWeight="bold"
        fontSize="lg"
        transition="all 0.3s ease"
        _hover={{
          transform: "scale(1.05)",
          boxShadow: "lg",
        }}
        w={"max"}
        cursor={"pointer"}
        className="group"
      >
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Icon
            size={"2xl"}
            style={{
              marginRight: "8px",
              transform: "rotate(-15deg)",
            }}
          >
            <Bot strokeWidth={1.5} />
          </Icon>
        </motion.div>
        <Box
          position={"relative"}
          display={"none"}
          _groupHover={{
            display: "inline-block",
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Text fontSize={"md"}>Hi, I’m GTM-E</Text>
          </motion.div>
        </Box>
      </Flex>
    </Box>
  );
};

export default FloatingChatButton;

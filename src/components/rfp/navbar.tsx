"use client";
import { Button, Flex, IconButton, Text } from "@chakra-ui/react";
import {
  ArrowDownToLine,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  X,
} from "lucide-react";
import { usePanelStore } from "../../app/stores/use-panel-store";
import { Tooltip } from "../ui/tooltip";
import { useSideChatStore } from "../../app/stores/use-sidechat-store";

interface NavbarProps {
  exportToExcel: () => void;
}

export default function Navbar({ exportToExcel }: NavbarProps) {
  const { closePanel } = usePanelStore();
  const { isSideChatOpen, openSideChat, closeSideChat } = useSideChatStore();

  return (
    <Flex
      gap={4}
      bg={"white"}
      borderBottom={"1px solid"}
      borderColor={"gray.200"}
      px="24px"
      //py="12px"
      h={"55px"}
      //pos={"fixed"}
      w={"full"}
      zIndex={10}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      <Flex alignItems={"center"} gap={2}>
        <Tooltip
          content="Share with colleague"
          positioning={{ placement: "bottom" }}
        >
          <IconButton
            aria-label="Share"
            size="md"
            variant="ghost"
            rounded={"xl"}
            onClick={() => {
              if (isSideChatOpen) {
                closeSideChat();
              } else {
                openSideChat();
              }
            }}
          >
            {isSideChatOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </IconButton>
        </Tooltip>
        <Text
          fontSize={"md"}
          color={"gray.800"}
          fontWeight={"semibold"}
          lineHeight={"24px"}
          display={"flex"}
          flexDirection={"row"}
          gap={2}
          alignItems={"center"}
        >
          RFP Document
        </Text>
      </Flex>

      <Flex alignItems={"center"} gap={4}>
        <Tooltip
          content="Share with colleague"
          positioning={{ placement: "bottom" }}
        >
          <IconButton
            aria-label="Share"
            size="md"
            variant="ghost"
            rounded={"xl"}
          >
            <Share2 />
          </IconButton>
        </Tooltip>

        <Tooltip
          content="Export presentation"
          positioning={{ placement: "bottom" }}
        >
          <Button
            aria-label="Export"
            size="sm"
            bg="purple.500"
            px={2}
            rounded="lg"
            onClick={exportToExcel}
          >
            <ArrowDownToLine /> Export
          </Button>
        </Tooltip>

        <IconButton
          size={"md"}
          variant={"ghost"}
          rounded={"xl"}
          onClick={closePanel}
        >
          <X />
        </IconButton>
      </Flex>
    </Flex>
  );
}

"use client";

import { Box, Flex } from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SlideCanvas from "./slide-canvas";
// import Sidebar from "./sidebar";
// import Thumbnails from "./thumbnails";

const Editor = () => {
  // const addSlide = useStore((state) => state.addSlide);
  // const zoom = useStore((state) => state.zoom);
  // const setZoom = useStore((state) => state.setZoom);
  // const autoZoom = useStore((state) => state.autoZoom);

  // useEffect(() => {
  //   autoZoom(); // Auto-zoom on mount
  // }, [autoZoom]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Flex direction="column" h="100vh">
        <Box p={4} bg="gray.100">
          {/* <HStack gap={4}>
            <Button onClick={addSlide}>Add Slide</Button>
            <HStack>
              <Input
                type="number"
                value={Math.round(zoom * 100)}
                onChange={(e) => setZoom(Number(e.target.value) / 100)}
                width="80px"
                size="sm"
              />
              <Box>%</Box>
              <Button onClick={autoZoom} size="sm">
                Auto Zoom
              </Button>
            </HStack>
          </HStack> */}
        </Box>
        <Flex flex={1} position="relative">
          <Box
            id="canvas-container"
            flex={1}
            p={4}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <SlideCanvas />
          </Box>
          {/* <Sidebar /> */}
        </Flex>
        {/* <Thumbnails /> */}
      </Flex>
    </DndProvider>
  );
};

export default Editor;

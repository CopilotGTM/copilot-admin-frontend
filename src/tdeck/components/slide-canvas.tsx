"use client";

import { Stage, Layer, Rect } from "react-konva";
import { useStore } from "../store/slides";
import TextElement from "../elements/text-element";
import { Box } from "@chakra-ui/react";
import { useRef, useState } from "react";
import ImageElement from "../elements/image-element";
import ShapeElement from "../elements/shape-element";
import { useViewportSize } from "../hooks/use-viewport-size";
import { useMainStore } from "../store/main";
import ArcElement from "../elements/arc-element";

const SlideCanvas = () => {
  const currentSlide = useStore((state) => state.currentSlide());
  const canvasScale = useMainStore((state) => state.canvasScale);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const { viewportStyles } = useViewportSize(containerRef);

  // Handle background click to deselect elements
  const handleBackgroundClick = () => {
    setSelectedElementId(null);
  };

  if (!currentSlide) return null;

  // Determine background fill based on background type
  const backgroundFill =
    currentSlide?.background?.type === "solid"
      ? currentSlide.background.color
      : currentSlide?.background?.type === "gradient"
        ? currentSlide.background.gradient?.colors[0]?.color
        : "#FFFFFF"; // Fallback for image or undefined

  return (
    <Box
      ref={containerRef}
      w="full"
      h="full"
      overflow="auto"
      position="relative"
      bg="white"
      css={{
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#F1F1F1",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#BDBDBD",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#A0A0A0",
        },
      }}
      //onMouseDown={dragViewport}
    >
      <Box
        pos={"absolute"}
        left={viewportStyles.left}
        top={viewportStyles.top}
        width={viewportStyles.width * canvasScale}
        height={viewportStyles.height * canvasScale}
        rounded={"4xl"}
        overflow={"hidden"}
        shadow={"sm"}
      >
        <Stage
          width={viewportStyles.width * canvasScale}
          height={viewportStyles.height * canvasScale}
          scaleX={canvasScale}
          scaleY={canvasScale}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={viewportStyles.width * canvasScale}
              height={viewportStyles.height * canvasScale}
              fill={backgroundFill}
              onClick={handleBackgroundClick}
            />
            {currentSlide.elements.map((element) => {
              if (element.type === "text") {
                return (
                  <TextElement
                    key={element.id}
                    element={element}
                    slideId={currentSlide.id}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => setSelectedElementId(element.id)}
                  />
                );
              }
              if (element.type === "image") {
                return (
                  <ImageElement
                    key={element.id}
                    element={element}
                    slideId={currentSlide.id}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => setSelectedElementId(element.id)}
                  />
                );
              }
              if (element.type === "shape" && element.properties.path) {
                return (
                  <ShapeElement
                    key={element.id}
                    element={element}
                    slideId={currentSlide.id}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => setSelectedElementId(element.id)}
                  />
                );
              }
              if (element.type === "list" && element.properties.items) {
                return (
                  <ArcElement
                    key={element.id}
                    element={element}
                    slideId={currentSlide.id}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => setSelectedElementId(element.id)}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </Box>
    </Box>
  );
};

export default SlideCanvas;

import { Box } from "@chakra-ui/react";
import {
  Stage,
  Layer,
  Line,
  Circle,
  Rect,
  Text as KonvaText,
  Group,
} from "react-konva";
import { useState, useEffect, useRef } from "react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import Konva from "konva";

interface TimelineEvent {
  id: number;
  date: string;
  title: string;
  position: number; // from 0 to 100
}

interface TimelineProps {
  events: TimelineEvent[];
  width?: number;
  height?: number;
  shape?: "circle" | "rect";
  boxSize?: number;
  showConnector?: boolean;
  connectorWidth?: number;
  connectorSide?: "left" | "right" | "random";
  itemGap?: number; // pixel gap between items, overrides position
}

const VerticalTimeline: React.FC<TimelineProps> = ({
  events,
  width = 800,
  height = 600,
  shape = "circle",
  boxSize = 40,
  showConnector = true,
  connectorWidth = 50,
  connectorSide = "random",
  itemGap = 50,
}) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const lineColor = useColorModeValue("blue.500", "blue.300");
  const shapeColor = useColorModeValue("blue.600", "blue.400");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const shapeTextColor = useColorModeValue("white", "gray.100");

  const [stageHeight, setStageHeight] = useState(height);
  const titleRefs = useRef<(Konva.Text | null)[]>(
    Array(events.length).fill(null),
  );
  const [titleHeights, setTitleHeights] = useState<number[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setStageHeight(
        window.innerHeight < height ? window.innerHeight - 40 : height,
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [height]);

  // Measure title heights
  useEffect(() => {
    const heights = titleRefs.current.map((node) => node?.height() || 0);
    setTitleHeights(heights);
  }, [events, width]);

  const padding = 40;
  const lineX = width / 2;
  const lineYStart = padding;
  const lineYEnd = stageHeight - padding;
  const lineHeight = lineYEnd - lineYStart;
  const shapeSize = boxSize;
  const textPadding = 8;

  const titleFontSize = 14;
  const dateFontSize = 12;
  const lineSpacing = 4;

  // Default connector width calculation
  const halfSpace = (width - padding * 2 - shapeSize) / 2;
  const defaultConnectorWidth = halfSpace * 0.5;
  const finalConnectorWidth = showConnector
    ? (connectorWidth ?? defaultConnectorWidth)
    : 0;

  // Compute Y positions: if itemGap is provided, stack items dynamically; otherwise use percent
  const yPositions: number[] = [];
  if (itemGap !== undefined) {
    for (let i = 0; i < events.length; i++) {
      if (i === 0) {
        // First item: start at top padding plus half shape
        yPositions[0] = lineYStart + shapeSize / 2;
      } else {
        const prevY = yPositions[i - 1];
        const prevTitleHeight = titleHeights[i - 1] || titleFontSize;
        const prevTitleY = prevY - titleFontSize / 2;
        const prevDateY = prevTitleY + prevTitleHeight + lineSpacing;
        const prevDateHeight = dateFontSize;
        const bottomContent = prevDateY + prevDateHeight;
        // Next shape center = bottom of content + gap + half title line height for centering
        yPositions[i] = bottomContent + itemGap + titleFontSize / 2;
      }
    }
  } else {
    events.forEach((e, i) => {
      yPositions[i] = lineYStart + (e.position / 100) * lineHeight;
    });
  }

  return (
    <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
      <Stage width={width} height={stageHeight}>
        <Layer>
          {/* Centered timeline */}
          <Line
            points={[
              lineX,
              yPositions[0],
              lineX,
              yPositions[events.length - 1],
            ]}
            stroke={lineColor}
            strokeWidth={2.5}
          />

          {events.map((event, index) => {
            // compute y: itemGap overrides percent
            const y = yPositions[index];

            // determine side
            const side: "left" | "right" =
              connectorSide === "random"
                ? index % 2 === 0
                  ? "right"
                  : "left"
                : connectorSide;

            // connector endpoints
            const baseX =
              side === "right" ? lineX + shapeSize / 2 : lineX - shapeSize / 2;
            const connectorEnd =
              side === "right"
                ? baseX + finalConnectorWidth
                : baseX - finalConnectorWidth;

            // text block position
            const textX =
              side === "right" ? connectorEnd + textPadding : padding;
            const textWidth =
              side === "right"
                ? width - textX - padding
                : connectorEnd - padding - textPadding;
            const textAlign: "left" | "right" =
              side === "right" ? "left" : "right";

            // center first title line on connector
            const titleHeight = titleHeights[index] || titleFontSize;
            const titleY = y - titleFontSize / 2;
            const dateY = titleY + titleHeight + lineSpacing;

            return (
              <Group key={event.id}>
                {/* shape */}
                {shape === "circle" ? (
                  <Circle
                    x={lineX}
                    y={y}
                    radius={shapeSize / 2}
                    fill={shapeColor}
                  />
                ) : (
                  <Rect
                    x={lineX - shapeSize / 2}
                    y={y - shapeSize / 2}
                    width={shapeSize}
                    height={shapeSize}
                    fill={shapeColor}
                    cornerRadius={5}
                  />
                )}

                {/* index */}
                <KonvaText
                  x={lineX - shapeSize / 2}
                  y={y - shapeSize / 2}
                  width={shapeSize}
                  height={shapeSize}
                  text={`${index + 1}`}
                  fontSize={Math.round(shapeSize * 0.4)}
                  fill={shapeTextColor}
                  align="center"
                  verticalAlign="middle"
                  fontStyle="bold"
                />

                {/* connector */}
                {showConnector && (
                  <Line
                    points={[baseX, y, connectorEnd, y]}
                    stroke={lineColor}
                    strokeWidth={2}
                  />
                )}

                {/* title */}
                <KonvaText
                  ref={(node) => {
                    titleRefs.current[index] = node;
                  }}
                  x={textX}
                  y={titleY}
                  width={textWidth}
                  text={event.title}
                  fontSize={titleFontSize}
                  fill={textColor}
                  align={textAlign}
                  wrap="word"
                  lineHeight={1.2}
                />

                {/* date */}
                <KonvaText
                  x={textX}
                  y={dateY}
                  width={textWidth}
                  text={event.date}
                  fontSize={dateFontSize}
                  fill={textColor}
                  align={textAlign}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </Box>
  );
};

export default VerticalTimeline;

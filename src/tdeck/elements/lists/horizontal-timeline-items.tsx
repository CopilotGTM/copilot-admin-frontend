import { Box } from "@chakra-ui/react";
import { Stage, Layer, Line, Circle, Text as KonvaText } from "react-konva";
import { useState, useEffect } from "react";
import { useColorModeValue } from "../../../components/ui/color-mode";

interface TimelineEvent {
  id: number;
  date: string;
  title: string;
  position: number;
}

interface TimelineProps {
  events: TimelineEvent[];
  width?: number;
  height?: number;
}

const Timeline: React.FC<TimelineProps> = ({
  events,
  width = 800,
  height = 200,
}) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const lineColor = useColorModeValue("blue.500", "blue.300");
  const pointColor = useColorModeValue("blue.600", "blue.400");
  const textColor = useColorModeValue("gray.800", "gray.200");

  const [stageWidth, setStageWidth] = useState(width);

  useEffect(() => {
    const handleResize = () => {
      setStageWidth(window.innerWidth < width ? window.innerWidth - 40 : width);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width]);

  const padding = 40;
  const lineY = height / 2;
  const lineLength = stageWidth - padding * 2;
  const pointRadius = 8;

  return (
    <Box bg={bgColor} p={4} borderRadius="md" boxShadow="md">
      <Stage width={stageWidth} height={height}>
        <Layer>
          {/* Main timeline */}
          <Line
            points={[padding, lineY, stageWidth - padding, lineY]}
            stroke={lineColor}
            strokeWidth={4}
          />

          {/* Event points and labels */}
          {events.map((event) => {
            const x = padding + (event.position / 100) * lineLength;
            return (
              <>
                <Circle
                  key={`point-${event.id}`}
                  x={x}
                  y={lineY}
                  radius={pointRadius}
                  fill={pointColor}
                />
                <KonvaText
                  key={`text-${event.id}`}
                  x={x - 50}
                  y={lineY - 30}
                  width={100}
                  text={event.title}
                  fontSize={14}
                  fill={textColor}
                  align="center"
                />
                <KonvaText
                  key={`date-${event.id}`}
                  x={x - 50}
                  y={lineY + 20}
                  width={100}
                  text={event.date}
                  fontSize={12}
                  fill={textColor}
                  align="center"
                />
              </>
            );
          })}
        </Layer>
      </Stage>
    </Box>
  );
};

export default Timeline;

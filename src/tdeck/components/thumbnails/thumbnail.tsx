"use client";

import { Layer, Rect, Stage, Text, Path } from "react-konva";
import { Slide } from "../../types";
import ImageThumbnail from "./image-thumbnail";
import { useStore } from "../../store/slides";

const Thumbnail = ({ slide }: { slide: Slide }) => {
  const thumbnailWidth = 150;
  const viewportRatio = useStore((state) => state.viewportRatio);
  const viewportSize = useStore((state) => state.viewportSize);
  const thumbnailHeight = viewportRatio * thumbnailWidth;
  const scale = thumbnailWidth / viewportSize;

  // Determine background fill based on background type
  const backgroundFill =
    slide.background?.type === "solid"
      ? slide.background.color
      : slide?.background?.type === "gradient"
        ? slide.background.gradient?.colors[0]?.color
        : "#FFFFFF"; // Fallback for image or undefined

  return (
    <Stage
      width={thumbnailWidth}
      height={thumbnailHeight}
      scaleX={scale}
      scaleY={scale}
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={thumbnailWidth}
          height={thumbnailHeight}
          fill={backgroundFill}
        />
        {slide.elements.map((element) => {
          if (element.type === "text") {
            return (
              <Text
                key={element.id}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                rotation={element.rotation}
                text={element.properties.content}
                fontSize={element.properties.fontSize}
                fontFamily={element.properties.fontName}
                fill={element.properties.color}
                align={element.properties.align}
                lineHeight={element.properties.lineHeight}
                fontStyle={
                  [
                    element.properties.isBold ? "bold" : "",
                    element.properties.isItalic ? "italic" : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || "normal"
                }
              />
            );
          }
          if (element.type === "image") {
            return <ImageThumbnail key={element.id} element={element} />;
          }
          if (element.type === "shape" && element.properties.path) {
            return (
              <Path
                key={element.id}
                x={element.x}
                y={element.y}
                data={element.properties.path}
                fill={element.properties.fill}
                opacity={element.properties.opacity}
                scaleX={element.width / element.properties.viewBox[0]}
                scaleY={element.height / element.properties.viewBox[1]}
              />
            );
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
};

export default Thumbnail;

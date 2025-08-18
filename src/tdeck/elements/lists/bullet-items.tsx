import React from "react";
import {
  Stage,
  Layer,
  Group,
  Circle,
  Rect,
  Text as KonvaText,
} from "react-konva";

// Helper to convert index to various formats
const toIndex = (idx: number, type: "numerical" | "alphabetical" | "roman") => {
  switch (type) {
    case "alphabetical":
      return String.fromCharCode(65 + (idx % 26));
    case "roman": {
      const romans = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
      ];
      return romans[idx] || (idx + 1).toString();
    }
    default:
      return (idx + 1).toString();
  }
};

interface BulletItemsProps {
  items: string[];
  width?: number;
  height?: number;
  shape?: "circle" | "rect";
  indexType?: "numerical" | "alphabetical" | "roman";
  itemType?: "simple" | "staircase" | "zigzag" | "offset";
  gap?: number; // vertical gap between items
  shapeSize?: number; // diameter or side length of the shape
  padding?: number; // top padding
}

const BulletItems: React.FC<BulletItemsProps> = ({
  items,
  width = 400,
  height = 300,
  shape = "circle",
  indexType = "numerical",
  itemType = "simple",
  gap = 20,
  shapeSize = 24,
  padding = 20,
}) => {
  // starting y-coordinate for first item
  const yStart = padding + shapeSize / 2;
  // indent step for staircase/zigzag
  const indentStep = shapeSize;

  return (
    <Stage width={width} height={height}>
      <Layer>
        {items.map((text, i) => {
          // compute y position
          const y = yStart + i * gap;
          // compute indent based on itemType
          let indent = 0;
          if (itemType === "staircase") {
            indent = i * indentStep;
          } else if (itemType === "zigzag") {
            indent = i % 2 === 0 ? 0 : indentStep;
          } else if (itemType === "offset") {
            indent = (i % 3) * (indentStep / 2);
          }
          // shape X coordinate
          const shapeX = padding + indent;
          // text X next to shape
          const textX = shapeX + shapeSize + 10;
          // index label
          const label = toIndex(i, indexType);

          return (
            <Group key={i} y={y}>
              {shape === "circle" ? (
                <Circle
                  x={shapeX}
                  y={0}
                  radius={shapeSize / 2}
                  fill="#3182CE"
                />
              ) : (
                <Rect
                  x={shapeX - shapeSize / 2}
                  y={-shapeSize / 2}
                  width={shapeSize}
                  height={shapeSize}
                  fill="#3182CE"
                />
              )}
              <KonvaText
                x={shapeX - shapeSize / 2}
                y={-shapeSize / 4}
                width={shapeSize}
                text={label}
                fontSize={shapeSize * 0.6}
                fill="#FFF"
                align="center"
                verticalAlign="middle"
              />
              <KonvaText
                x={textX}
                y={-shapeSize / 2 + 2}
                text={text}
                fontSize={16}
                fill="#2D3748"
                align="left"
              />
            </Group>
          );
        })}
      </Layer>
    </Stage>
  );
};

export default BulletItems;

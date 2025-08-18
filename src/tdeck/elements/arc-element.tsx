"use client";

import React from "react";
import { Group } from "react-konva";
import { useStore } from "../store/slides";
import { SlideListElement } from "../types";

type ArcElementProps = {
  element: SlideListElement;
  slideId: string;
  isSelected: boolean;
  onSelect: () => void;
};

const ArcElement: React.FC<ArcElementProps> = ({
  element,
  slideId,
  isSelected,
  onSelect,
}) => {
  const updateElement = useStore((state) => state.updateElement);

  return (
    <Group
      x={element.x}
      y={element.y}
      onClick={onSelect}
      draggable
      onDragEnd={(e) => {
        updateElement({
          slideId,
          id: element.id,
          props: { x: e.target.x(), y: e.target.y() },
        });
      }}
    >
      {/* <ArcItemList
        items={element.properties.items}
        width={element.width}
        height={element.height}
        innerRadius={element.properties.innerRadius}
        outerRadius={element.properties.outerRadius}
      /> */}
      {isSelected && (
        // you can add selection handles or a border here if desired
        <></>
      )}
    </Group>
  );
};

export default ArcElement;

"use client";

import { Path } from "react-konva";
import { useStore } from "../store/slides";
import { SlideShapeElement } from "../types";

type ShapeElementProps = {
  element: SlideShapeElement;
  slideId: string;
  isSelected: boolean;
  onSelect: () => void;
};

const ShapeElement = ({
  element,
  slideId,
  isSelected,
  onSelect,
}: ShapeElementProps) => {
  const updateElement = useStore((state) => state.updateElement);

  return (
    <>
      <Path
        x={element.x}
        y={element.y}
        data={element.properties.path}
        fill={element.properties.fill}
        opacity={element.properties.opacity}
        scaleX={element.width / element.properties.viewBox[0]}
        scaleY={element.height / element.properties.viewBox[1]}
        onClick={onSelect}
        draggable
        onDragEnd={(e) => {
          updateElement({
            slideId,
            id: element.id,
            props: {
              x: e.target.x(),
              y: e.target.y(),
            },
          });
        }}
      />
      {isSelected && (
        // <Popover.Root>
        //   <PopoverTrigger>
        //     <Box
        //       position="absolute"
        //       top={element.top}
        //       left={element.left + element.width + 10}
        //     />
        //   </PopoverTrigger>
        //   <Portal>
        //     <PopoverContent>
        //       <PopoverBody>
        //         <HStack mb={2}>
        //           <ColorPicker.Root
        //             defaultValue={parseColor(element.properties.fill)}
        //             maxW="150px"
        //             onValueChange={(details) =>
        //               updateElement(slideId, element.id, {
        //                 properties: { fill: details.value.toString('hex') },
        //               } as SElement)
        //             }
        //           >
        //             <ColorPicker.HiddenInput />
        //             <ColorPicker.Control>
        //               <ColorPicker.Input />
        //               <ColorPicker.Trigger />
        //             </ColorPicker.Control>
        //             <Portal>
        //               <ColorPicker.Positioner>
        //                 <ColorPicker.Content>
        //                   <ColorPicker.Area />
        //                   <HStack>
        //                     <ColorPicker.EyeDropper
        //                       size="xs"
        //                       variant="outline"
        //                     />
        //                     <ColorPicker.Sliders />
        //                   </HStack>
        //                 </ColorPicker.Content>
        //               </ColorPicker.Positioner>
        //             </Portal>
        //           </ColorPicker.Root>
        //         </HStack>
        //         <HStack mb={2}>
        //           <Slider
        //             aria-label="opacity-slider"
        //             min={0}
        //             max={1}
        //             step={0.01}
        //             value={element.properties.opacity}
        //             onChange={(value) =>
        //               updateElement(slideId, element.id, {
        //                 properties: { opacity: value },
        //               } as SElement)
        //             }
        //           >
        //             <SliderTrack>
        //               <SliderFilledTrack />
        //             </SliderTrack>
        //             <SliderThumb />
        //           </Slider>
        //         </HStack>
        //       </PopoverBody>
        //     </PopoverContent>
        //   </Portal>
        // </Popover.Root>
        <></>
      )}
    </>
  );
};

export default ShapeElement;

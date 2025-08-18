"use client";

import { Image as KonvaImage } from "react-konva";
import { useImage } from "react-konva-utils";
import { useStore } from "../store/slides";
import { SlideImageElement } from "../types";

type ImageElementProps = {
  element: SlideImageElement;
  slideId: string;
  isSelected?: boolean;
  onSelect?: () => void;
};

const ImageElement = ({
  element,
  slideId,
  //isSelected,
  //onSelect,
}: ImageElementProps) => {
  const updateElement = useStore((state) => state.updateElement);
  const [image] = useImage(element.properties.src);

  return (
    <>
      <KonvaImage
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        image={image!}
        opacity={element.properties.opacity}
        //onClick={onSelect}
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
      {/* {isSelected && (
        <Popover.Root>
          <Popover.Trigger asChild>
            <Box
              position="absolute"
              top={element.y}
              left={element.x + element.width + 10}
            />
          </Popover.Trigger>
          <Portal>
            <Popover.Content>
              <Popover.Body>
                <Slider.Root
                  value={[element.properties.opacity * 100]}
                  min={0}
                  max={100}
                  onValueChange={(details) =>
                    updateElement({
                      slideId,
                      id: element.id,
                      props: {
                        properties: {
                          opacity: details.value[0] / 100,
                        } as SlideImageElement["properties"],
                      } as Partial<SlideImageElement>,
                    })
                  }
                >
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumbs />
                  </Slider.Control>
                </Slider.Root>
              </Popover.Body>
            </Popover.Content>
          </Portal>
        </Popover.Root>
      )} */}
    </>
  );
};

export default ImageElement;

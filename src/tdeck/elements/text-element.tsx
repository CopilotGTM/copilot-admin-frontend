"use client";

import { Text } from "react-konva";
import { useStore } from "../store/slides";
import { SlideTextElement } from "../types";

type TextElementProps = {
  element: SlideTextElement;
  slideId: string;
  isSelected?: boolean;
  onSelect?: () => void;
};

const TextElement = ({
  element,
  slideId,
  //isSelected,
  //onSelect,
}: TextElementProps) => {
  const updateElement = useStore((state) => state.updateElement);

  // const fontSizeCollections = createListCollection({
  //   items: [12, 16, 24, 32, 48, 64, 96].map((fontSize) => {
  //     return {
  //       label: `${fontSize}px`,
  //       value: `${fontSize}`,
  //     };
  //   }),
  // });

  // const headingLevelCollections = createListCollection({
  //   items: [
  //     { label: "H1", value: "h1" },
  //     { label: "H2", value: "h2" },
  //     { label: "H3", value: "h3" },
  //     { label: "Body", value: "Body" },
  //   ],
  // });

  return (
    <>
      <Text
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
        fontStyle={`${element.properties.isBold ? "bold" : ""} ${element.properties.isItalic ? "italic" : ""}`}
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
          <PopoverTrigger>
            <Box
              position="absolute"
              top={element.y}
              left={element.x + element.width + 10}
            />
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverBody>
                <HStack mb={2}>
                  <Input
                    size="sm"
                    value={element.properties.content}
                    onChange={(e) =>
                      updateElement({
                        slideId,
                        id: element.id,
                        props: {
                          properties: {
                            content: e.target.value,
                          } as SlideTextElement["properties"],
                        } as Partial<SlideTextElement>,
                      })
                    }
                    placeholder="Text content"
                  />
                </HStack>
                <HStack mb={2}>
                  <Select
                    size="sm"
                    value={element.properties.fontSize}
                    onChange={(e) => updateElement(slideId, element.id, { fontSize: Number(e.target.value) })}
                  >
                    {[12, 16, 24, 32, 48, 64, 96].map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </Select>
                  <Select.Root
                    collection={fontSizeCollections}
                    size="sm"
                    value={[String(element.properties.fontSize)]}
                    onValueChange={(details) =>
                      // updateElement(slideId, element.id, {
                      //   properties: { fontSize: Number(details.value[0]) },
                      // } as TElement)

                      updateElement({
                        slideId,
                        id: element.id,
                        props: {
                          properties: {
                            fontSize: Number(details.value[0]),
                          } as SlideTextElement["properties"],
                        } as Partial<SlideTextElement>,
                      })
                    }
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Font size" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {fontSizeCollections.items.map((fontSize) => (
                            <Select.Item item={fontSize} key={fontSize.value}>
                              {fontSize.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                  <Select
                    size="sm"
                    value={element.properties.headingLevel}
                    onChange={(e) =>
                      updateElement(slideId, element.id, { headingLevel: e.target.value as 'h1' | 'h2' | 'h3' | 'body' })
                    }
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                    <option value="body">Body</option>
                  </Select>
                  <Select.Root
                    collection={headingLevelCollections}
                    size="sm"
                    value={[element.properties.headingLevel]}
                    onValueChange={(details) =>
                      // updateElement(slideId, element.id, {
                      //   properties: {
                      //     headingLevel: details.value[0] as
                      //       | "h1"
                      //       | "h2"
                      //       | "h3"
                      //       | "body",
                      //   },
                      // } as TElement)

                      updateElement({
                        slideId,
                        id: element.id,
                        props: {
                          properties: {
                            headingLevel: details.value[0] as
                              | "h1"
                              | "h2"
                              | "h3"
                              | "body",
                          } as SlideTextElement["properties"],
                        } as Partial<SlideTextElement>,
                      })
                    }
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Choose heading" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {headingLevelCollections.items.map((headingLevel) => (
                            <Select.Item
                              item={headingLevel}
                              key={headingLevel.value}
                            >
                              {headingLevel.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </HStack>
                <HStack mb={2}>
                  <ColorPicker.Root
                    defaultValue={parseColor(element.properties.color)}
                    maxW="150px"
                    onValueChange={(details) =>
                      // updateElement(slideId, element.id, {
                      //   properties: { color: details.value.toString("hex") },
                      // } as TElement)
                      updateElement({
                        slideId,
                        id: element.id,
                        props: {
                          properties: {
                            color: details.value.toString("hex"),
                          } as SlideTextElement["properties"],
                        } as Partial<SlideTextElement>,
                      })
                    }
                  >
                    <ColorPicker.HiddenInput />
                    <ColorPicker.Control>
                      <ColorPicker.Input />
                      <ColorPicker.Trigger />
                    </ColorPicker.Control>
                    <Portal>
                      <ColorPicker.Positioner>
                        <ColorPicker.Content>
                          <ColorPicker.Area />
                          <HStack>
                            <ColorPicker.EyeDropper
                              size="xs"
                              variant="outline"
                            />
                            <ColorPicker.Sliders />
                          </HStack>
                        </ColorPicker.Content>
                      </ColorPicker.Positioner>
                    </Portal>
                  </ColorPicker.Root>
                </HStack>
                <HStack>
                  <Button
                    size="sm"
                    variant={element.properties.isBold ? "solid" : "outline"}
                    onClick={() =>
                      // updateElement(slideId, element.id, {
                      //   properties: { isBold: !element.properties.isBold },
                      // } as TElement)

                      updateElement({
                        slideId,
                        id: element.id,
                        props: {
                          properties: {
                            isBold: !element.properties.isBold,
                          } as SlideTextElement["properties"],
                        } as Partial<SlideTextElement>,
                      })
                    }
                  >
                    Bold
                  </Button>
                  <Button
                    size="sm"
                    variant={element.properties.isItalic ? "solid" : "outline"}
                    onClick={() =>
                      // updateElement(slideId, element.id, {
                      //   properties: {
                      //     isItalic: !element.properties.isItalic,
                      //   },
                      // } as TElement)

                      updateElement({
                        slideId,
                        id: element.id,
                        props: {
                          properties: {
                            isItalic: !element.properties.isItalic,
                          } as SlideTextElement["properties"],
                        } as Partial<SlideTextElement>,
                      })
                    }
                  >
                    Italic
                  </Button>
                </HStack>
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover.Root>
      )} */}
    </>
  );
};

export default TextElement;

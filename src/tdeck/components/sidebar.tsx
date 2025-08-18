// "use client";

// import { ButtonProps, Flex, IconButton, Menu, Portal } from "@chakra-ui/react";
// import { useDrag, ConnectDragSource } from "react-dnd";
// import { v4 as uuidv4 } from "uuid";
// import { useStore } from "../store";
// import { ImageElement, TextElement } from "../types";
// import React, { forwardRef } from "react";
// import { ALargeSmall, ChartPie, Image } from "lucide-react";

// // Custom DragButton to handle ConnectDragSource ref
// interface DragButtonProps extends ButtonProps {
//   dragRef: ConnectDragSource;
// }

// const DragButton = forwardRef<HTMLButtonElement, DragButtonProps>(
//   ({ dragRef, ...props }, ref) => {
//     return (
//       <IconButton
//         ref={(node) => {
//           if (typeof ref === "function") {
//             ref(node);
//           } else if (ref) {
//             (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
//               node;
//           }
//           dragRef(node);
//         }}
//         variant={"ghost"}
//         rounded={"xl"}
//         {...props}
//       />
//     );
//   },
// );
// DragButton.displayName = "DragButton";

// // Define the type for text options
// type TextOption = {
//   label: string;
//   headingLevel: "h1" | "h2" | "h3" | "body";
//   fontSize: number;
//   isBold: boolean;
// };

// const Sidebar = () => {
//   const addElement = useStore((state) => state.addElement);
//   const activeSlideId = useStore((state) => state.activeSlideId);

//   const [, dragText] = useDrag(() => ({
//     type: "element",
//     item: { type: "text" },
//   }));

//   const [, dragImage] = useDrag(() => ({
//     type: "element",
//     item: { type: "image" },
//   }));

//   const textOptions: TextOption[] = [
//     { label: "Title", headingLevel: "h1", fontSize: 48, isBold: true },
//     { label: "Subtitle", headingLevel: "h2", fontSize: 36, isBold: true },
//     { label: "Heading 1", headingLevel: "h1", fontSize: 32, isBold: true },
//     { label: "Heading 2", headingLevel: "h2", fontSize: 24, isBold: true },
//     { label: "Heading 3", headingLevel: "h3", fontSize: 18, isBold: true },
//     { label: "Body", headingLevel: "body", fontSize: 14, isBold: false },
//   ];

//   const handleAddText = (option: TextOption) => {
//     if (!activeSlideId) return;
//     const newElement: TextElement = {
//       id: uuidv4(),
//       type: "text",
//       left: 100,
//       top: 100,
//       width: 300,
//       height: 50,
//       rotate: 0,
//       properties: {
//         content: `New ${option.label}`,
//         fontSize: option.fontSize,
//         fontName: "Roboto",
//         color: "#333333",
//         align: "left",
//         lineHeight: 1.2,
//         isBold: option.isBold,
//         isItalic: false,
//         headingLevel: option.headingLevel,
//       },
//     };
//     addElement(activeSlideId, newElement);
//   };

//   const handleAddImage = () => {
//     if (!activeSlideId) return;
//     const newElement: ImageElement = {
//       id: uuidv4(),
//       type: "image",
//       left: 100,
//       top: 100,
//       width: 200,
//       height: 150,
//       rotate: 0,
//       properties: {
//         src: "https://via.placeholder.com/200x150",
//         opacity: 1,
//       },
//     };
//     addElement(activeSlideId, newElement);
//   };

//   return (
//     <Flex
//       flexDirection={"column"}
//       position="absolute"
//       right="4"
//       top="50%"
//       transform="translateY(-50%)"
//       bg="white"
//       p={2}
//       borderRadius="2xl"
//       gap={2}
//       shadow="sm"
//     >
//       <Menu.Root>
//         <Menu.Trigger asChild>
//           <DragButton dragRef={dragText}>
//             <ALargeSmall />
//           </DragButton>
//         </Menu.Trigger>
//         <Portal>
//           <Menu.Positioner>
//             <Menu.Content>
//               {textOptions.map((option) => (
//                 <Menu.Item
//                   key={option.headingLevel + option.label}
//                   value={option.label}
//                   onClick={() => handleAddText(option)}
//                 >
//                   {option.label}
//                 </Menu.Item>
//               ))}
//             </Menu.Content>
//           </Menu.Positioner>
//         </Portal>
//       </Menu.Root>
//       <DragButton dragRef={dragImage} onClick={handleAddImage}>
//         <Image />
//       </DragButton>
//       <IconButton disabled rounded={"xl"}>
//         <ChartPie />
//       </IconButton>
//     </Flex>
//   );
// };

// export default Sidebar;

"use client";

import { Flex, IconButton, Menu, Portal } from "@chakra-ui/react";
import { useDrag, ConnectDragSource } from "react-dnd";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "../store/slides";
import { SlideTextElement, SlideImageElement, ElementTypes } from "../types";
import React, { forwardRef } from "react";
import { ALargeSmall, ChartPie, Image } from "lucide-react";

// Custom DragButton to handle ConnectDragSource ref
interface DragButtonProps extends React.ComponentProps<typeof IconButton> {
  dragRef: ConnectDragSource;
}

const DragButton = forwardRef<HTMLButtonElement, DragButtonProps>(
  ({ dragRef, ...props }, ref) => {
    return (
      <IconButton
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
              node;
          }
          dragRef(node);
        }}
        variant="ghost"
        borderRadius="xl"
        {...props}
      />
    );
  },
);
DragButton.displayName = "DragButton";

// Define the type for text options
type TextOption = {
  label: string;
  headingLevel: "h1" | "h2" | "h3" | "body";
  fontSize: number;
  isBold: boolean;
};

const Sidebar = () => {
  const addElement = useStore((state) => state.addElement);

  const [, dragText] = useDrag(() => ({
    type: "element",
    item: { type: "text" },
  }));

  const [, dragImage] = useDrag(() => ({
    type: "element",
    item: { type: "image" },
  }));

  const textOptions: TextOption[] = [
    { label: "Title", headingLevel: "h1", fontSize: 48, isBold: true },
    { label: "Subtitle", headingLevel: "h2", fontSize: 36, isBold: true },
    { label: "Heading 1", headingLevel: "h1", fontSize: 32, isBold: true },
    { label: "Heading 2", headingLevel: "h2", fontSize: 24, isBold: true },
    { label: "Heading 3", headingLevel: "h3", fontSize: 18, isBold: true },
    { label: "Body", headingLevel: "body", fontSize: 14, isBold: false },
  ];

  const handleAddText = (option: TextOption) => {
    const newElement: SlideTextElement = {
      id: uuidv4(),
      type: ElementTypes.TEXT,
      x: 100,
      y: 100,
      width: 300,
      height: 50,
      rotation: 0,
      properties: {
        content: `New ${option.label}`,
        fontSize: option.fontSize,
        fontName: "Roboto",
        color: "#333333",
        align: "left",
        lineHeight: 1.2,
        isBold: option.isBold,
        isItalic: false,
        headingLevel: option.headingLevel,
        textType:
          option.label.toLowerCase() as SlideTextElement["properties"]["textType"],
      },
    };
    addElement(newElement);
  };

  const handleAddImage = () => {
    const newElement: SlideImageElement = {
      id: uuidv4(),
      type: ElementTypes.IMAGE,
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      rotation: 0,
      properties: {
        src: "https://via.placeholder.com/200x150",
        opacity: 1,
        fixedRatio: true,
      },
    };
    addElement(newElement);
  };

  return (
    <Flex
      flexDirection="column"
      position="absolute"
      right="4"
      top="50%"
      transform="translateY(-50%)"
      bg="white"
      p={2}
      borderRadius="2xl"
      gap={2}
      shadow="sm"
    >
      <Menu.Root>
        <Menu.Trigger asChild>
          <DragButton dragRef={dragText}>
            <ALargeSmall />
          </DragButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {textOptions.map((option) => (
                <Menu.Item
                  key={option.headingLevel + option.label}
                  value={option.label}
                  onClick={() => handleAddText(option)}
                >
                  {option.label}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <DragButton
        dragRef={dragImage}
        onClick={handleAddImage}
        aria-label="Add Image"
      >
        <Image />
      </DragButton>
      <IconButton disabled borderRadius="xl" aria-label="Add Chart">
        <ChartPie />
      </IconButton>
    </Flex>
  );
};

export default Sidebar;

// "use client";

// import { Flex } from "@chakra-ui/react";
// import Carousel from "../../../components/ui/carousel";
// import { useStore } from "../../store";
// import ThumbnailItem from "./thumbnail-item";

// export default function Thumbnails() {
//   const presentation = useStore((s) => s.presentation);
//   const activeSlideId = useStore((s) => s.activeSlideId);
//   const setActiveSlide = useStore((s) => s.setActiveSlide);
//   const addSlide = useStore((s) => s.addSlide);

//   const THUMB_WIDTH = 170;
//   const THUMB_HEIGHT = (presentation.height / presentation.width) * THUMB_WIDTH;

//   return (
//     <Carousel
//       itemWidth={THUMB_WIDTH}
//       gap={8}
//       height={`${THUMB_HEIGHT + 25}px`} // + vertical padding
//       bg="gray.50"
//       borderTop="1px solid"
//       borderColor="gray.200"
//     >
//       <Flex gap={2}>
//         {presentation.slides.map((slide) => (
//           <ThumbnailItem
//             key={slide.id}
//             slide={slide}
//             isActive={slide.id === activeSlideId}
//             thumbnailWidth={THUMB_WIDTH}
//             thumbnailHeight={THUMB_HEIGHT}
//             onClick={() => setActiveSlide(slide.id)}
//           />
//         ))}

//         {/* The “+ Add Slide” tile */}
//         <ThumbnailItem
//           isAddButton
//           thumbnailWidth={THUMB_WIDTH}
//           thumbnailHeight={THUMB_HEIGHT}
//           onClick={addSlide}
//         />
//       </Flex>
//     </Carousel>
//   );
// }

"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useStore } from "../../store/slides";
import ThumbnailItem from "./thumbnail-item";
import { useRef } from "react";

export default function Thumbnails() {
  // const { slides, slideIndex, updateSlideIndex, addSlide } = useStore((s) => ({
  //   slides: s.slides,
  //   slideIndex: s.slideIndex,
  //   updateSlideIndex: s.updateSlideIndex,
  //   addSlide: s.addSlide,
  // }));

  const slides = useStore((state) => state.slides);
  const slideIndex = useStore((state) => state.slideIndex);
  const updateSlideIndex = useStore((state) => state.updateSlideIndex);
  const addSlide = useStore((state) => state.addSlide);

  //const THUMB_WIDTH = 170;
  //const ASPECT_RATIO = 16 / 9; // Standard slide aspect ratio
  //const THUMB_HEIGHT = (THUMB_WIDTH / ASPECT_RATIO);

  const thumbnailWidth = 150;
  const viewportRatio = useStore((state) => state.viewportRatio);
  //const viewportSize = useStore((state) => state.viewportSize);
  const thumbnailHeight = viewportRatio * thumbnailWidth;
  //const scale = thumbnailWidth / viewportSize;
  const boxRef = useRef<HTMLElement | null>(null);

  console.log("@@@@@@boxRef", boxRef?.current?.clientWidth);

  return (
    // <Carousel
    //   itemWidth={thumbnailWidth}
    //   gap={8}
    //   height={`${thumbnailHeight + 25}px`} // + vertical padding
    //   bg="gray.50"
    //   borderTop="1px solid"
    //   borderColor="gray.200"
    // >
    //   <Flex gap={2}>
    //     {slides.map((slide, index) => (
    //       <ThumbnailItem
    //         key={slide.id}
    //         slide={slide}
    //         isActive={index === slideIndex}
    //         thumbnailWidth={thumbnailWidth}
    //         thumbnailHeight={thumbnailHeight}
    //         onClick={() => updateSlideIndex(index)}
    //       />
    //     ))}

    //     {/* The “+ Add Slide” tile */}
    //     <ThumbnailItem
    //       isAddButton
    //       thumbnailWidth={thumbnailWidth}
    //       thumbnailHeight={thumbnailHeight}
    //       onClick={() => addSlide()}
    //     />
    //   </Flex>
    // </Carousel>
    <Box
      //align="center"
      //h={"max"}
      //position="relative"
      py={2}
      //{...props}
      overflow={"hidden"}
      w="full"
      ref={boxRef}
    >
      <Box w={"full"} overflow="hidden">
        <Flex
          align="center"
          w="full"
          overflow={"auto"}
          css={{
            "&::-webkit-scrollbar": { display: "none" },
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
          }}
        >
          <Flex gap={2}>
            {slides.map((slide, index) => (
              <ThumbnailItem
                key={slide.id}
                slide={slide}
                isActive={index === slideIndex}
                thumbnailWidth={thumbnailWidth}
                thumbnailHeight={thumbnailHeight}
                onClick={() => updateSlideIndex(index)}
              />
            ))}

            {/* The “+ Add Slide” tile */}
            <ThumbnailItem
              isAddButton
              thumbnailWidth={thumbnailWidth}
              thumbnailHeight={thumbnailHeight}
              onClick={() => addSlide()}
            />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}

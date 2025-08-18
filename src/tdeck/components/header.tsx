// import {
//   Button,
//   createListCollection,
//   Flex,
//   HStack,
//   IconButton,
//   Menu,
//   Portal,
//   Text,
// } from "@chakra-ui/react";
// import { useEffect } from "react";
// import { useStore } from "../store/slides";
// import { Tooltip } from "../../components/ui/tooltip";
// import {
//   ArrowDownToLine,
//   Maximize,
//   Minus,
//   Play,
//   Plus,
//   Redo,
//   Share2,
//   Undo,
// } from "lucide-react";

// export default function Header() {
//   const zoom = useStore((state) => state.zoom);
//   const setZoom = useStore((state) => state.setZoom);
//   const autoZoom = useStore((state) => state.autoZoom);
//   const undo = useStore((state) => state.undo);
//   const redo = useStore((state) => state.redo);

//   const zoomCollections = createListCollection({
//     items: [
//       { label: "200%", value: "200" },
//       { label: "150%", value: "150" },
//       { label: "125%", value: "125" },
//       { label: "100%", value: "100" },
//       { label: "75%", value: "75" },
//       { label: "50%", value: "50" },
//       { label: "Adapt to screen", value: "auto-zoom" },
//     ],
//   });

//   // Zoom in with 10% increment
//   const zoomIn = () => {
//     setZoom(Math.min(zoom + 0.1, 2)); // Cap at 200%
//   };

//   // Zoom out with 10% decrement
//   const zoomOut = () => {
//     setZoom(Math.max(zoom - 0.1, 0.1)); // Minimum 10%
//   };

//   // Handle input change for direct zoom value entry
//   const handleZoomChange = (zoomValue: string) => {
//     console.log("@@@@@@e", zoomValue);
//     if (zoomValue === "auto-zoom") {
//       autoZoom();
//     } else {
//       const value = Number(zoomValue);
//       if (value >= 10 && value <= 200) {
//         setZoom(value / 100);
//       }
//     }
//   };

//   // Auto-zoom on initial load
//   useEffect(() => {
//     autoZoom(); // Auto-zoom on mount
//   }, [autoZoom]);

//   return (
//     <HStack
//       gap={4}
//       h="55px"
//       w="full"
//       px={4}
//       bg="white"
//       borderBottom="1px solid"
//       borderColor="gray.200"
//       justifyContent="space-between"
//     >
//       <HStack>
//         <HStack>
//           <Tooltip content="Undo" positioning={{ placement: "bottom" }}>
//             <IconButton
//               aria-label="Undo"
//               onClick={undo}
//               size="sm"
//               variant={"ghost"}
//             >
//               <Undo />
//             </IconButton>
//           </Tooltip>
//           <Tooltip content="Redo" positioning={{ placement: "bottom" }}>
//             <IconButton
//               aria-label="Redo"
//               onClick={redo}
//               size="sm"
//               variant={"ghost"}
//             >
//               <Redo />
//             </IconButton>
//           </Tooltip>
//         </HStack>
//       </HStack>

//       <HStack gap={8}>
//         <Flex alignItems={"center"} gap={2}>
//           <IconButton
//             aria-label="Zoom out"
//             size="sm"
//             onClick={zoomOut}
//             disabled={zoom <= 0.1}
//             variant={"ghost"}
//           >
//             <Minus />
//           </IconButton>

//           <Menu.Root positioning={{ placement: "bottom" }}>
//             <Menu.Trigger asChild>
//               <Button variant={"ghost"} size={"sm"} gap={2} px={2}>
//                 {Math.round(zoom * 100)}%
//               </Button>
//             </Menu.Trigger>
//             <Portal>
//               <Menu.Positioner>
//                 <Menu.Content w={"full"} gap={2} rounded={"lg"}>
//                   {zoomCollections.items.map((zoom) => (
//                     <Menu.Item
//                       key={zoom.value}
//                       value={zoom.value}
//                       p={1}
//                       onClick={() => {
//                         handleZoomChange(zoom.value);
//                       }}
//                     >
//                       <Text fontSize={"sm"} w="full" textAlign={"center"}>
//                         {zoom.label}
//                       </Text>
//                     </Menu.Item>
//                   ))}
//                 </Menu.Content>
//               </Menu.Positioner>
//             </Portal>
//           </Menu.Root>

//           <IconButton
//             aria-label="Zoom in"
//             size="sm"
//             onClick={zoomIn}
//             disabled={zoom >= 2}
//             variant={"ghost"}
//           >
//             <Plus />
//           </IconButton>

//           <Tooltip
//             content="Fit slide to window"
//             positioning={{ placement: "bottom" }}
//           >
//             <IconButton
//               aria-label="Auto zoom"
//               onClick={autoZoom}
//               size="sm"
//               variant={"ghost"}
//             >
//               <Maximize />
//             </IconButton>
//           </Tooltip>
//         </Flex>

//         <Flex alignItems={"center"} gap={2}>
//           <Tooltip
//             content="Share with colleague"
//             positioning={{ placement: "bottom" }}
//           >
//             <IconButton
//               aria-label="Auto zoom"
//               //onClick={autoZoom}
//               size="sm"
//               variant={"ghost"}
//             >
//               <Share2 />
//             </IconButton>
//           </Tooltip>

//           <Tooltip content="Present it" positioning={{ placement: "bottom" }}>
//             <IconButton
//               aria-label="Auto zoom"
//               //onClick={autoZoom}
//               size="sm"
//               variant={"ghost"}
//             >
//               <Play />
//             </IconButton>
//           </Tooltip>

//           <Tooltip
//             content="Fit slide to window"
//             positioning={{ placement: "bottom" }}
//           >
//             <Button
//               aria-label="Auto zoom"
//               //onClick={autoZoom}
//               size="sm"
//               bg={"purple.500"}
//               px={2}
//               rounded={"lg"}
//             >
//               <ArrowDownToLine /> Export
//             </Button>
//           </Tooltip>
//         </Flex>
//       </HStack>
//     </HStack>
//   );
// }

import {
  Button,
  createListCollection,
  Flex,
  HStack,
  IconButton,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useMainStore } from "../store/main";
import { Tooltip } from "../../components/ui/tooltip";
import {
  ArrowDownToLine,
  Maximize,
  Minus,
  Play,
  Plus,
  Redo,
  Share2,
  Undo,
} from "lucide-react";
import { useScaleCanvas } from "../hooks/use-scale-canvas";

export default function Header() {
  // const { undo, redo } = useStore((state) => ({
  //   undo: state.undo,
  //   redo: state.redo,
  // }));

  // const canvasScale = useMainStore((state) => state.canvasScale);
  const canvasScalePercentage = useMainStore(
    (state) => state.canvasScalePercentage,
  );
  // const scaleCanvas = useMainStore((state) => state.scaleCanvas);
  // const setCanvasScalePercentage = useMainStore((state) => state.setCanvasScalePercentage);
  // const resetCanvas = useMainStore((state) => state.resetCanvas);

  const { scaleCanvas, setCanvasScalePercentage, resetCanvas } =
    useScaleCanvas();

  const zoomCollections = createListCollection({
    items: [
      { label: "200%", value: "200" },
      { label: "150%", value: "150" },
      { label: "125%", value: "125" },
      { label: "100%", value: "100" },
      { label: "75%", value: "75" },
      { label: "50%", value: "50" },
      { label: "Adapt to screen", value: "adapt" },
    ],
  });

  // Zoom in/out with 5% increments
  const zoomIn = () => {
    scaleCanvas("+");
  };

  const zoomOut = () => {
    scaleCanvas("-");
  };

  // Handle zoom selection from menu
  const handleZoomChange = (zoomValue: string) => {
    if (zoomValue === "adapt") {
      resetCanvas();
    } else {
      const value = Number(zoomValue);
      if (value >= 30 && value <= 200) {
        setCanvasScalePercentage(value);
      }
    }
    //setCanvasScaleVisible(false);
  };

  // Auto-scale on initial load
  // useEffect(() => {
  //   resetCanvas();
  // }, [resetCanvas]);

  return (
    <HStack
      gap={4}
      h="55px"
      w="full"
      px={4}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      justifyContent="space-between"
    >
      <HStack>
        <HStack>
          <Tooltip content="Undo" positioning={{ placement: "bottom" }}>
            <IconButton
              aria-label="Undo"
              //onClick={undo}
              size="sm"
              variant="ghost"
            >
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip content="Redo" positioning={{ placement: "bottom" }}>
            <IconButton
              aria-label="Redo"
              //onClick={redo}
              size="sm"
              variant="ghost"
            >
              <Redo />
            </IconButton>
          </Tooltip>
        </HStack>
      </HStack>

      <HStack gap={8}>
        <Flex alignItems="center" gap={2}>
          <IconButton
            aria-label="Zoom out"
            size="sm"
            onClick={zoomOut}
            disabled={canvasScalePercentage <= 30}
            variant="ghost"
          >
            <Minus />
          </IconButton>

          <Menu.Root positioning={{ placement: "bottom" }}>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm" gap={2} px={2}>
                {canvasScalePercentage}%
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content w="full" gap={2} rounded="lg">
                  {zoomCollections.items.map((zoom) => (
                    <Menu.Item
                      key={zoom.value}
                      value={zoom.value}
                      p={1}
                      onClick={() => handleZoomChange(zoom.value)}
                    >
                      <Text fontSize="sm" w="full" textAlign="center">
                        {zoom.label}
                      </Text>
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>

          <IconButton
            aria-label="Zoom in"
            size="sm"
            onClick={zoomIn}
            disabled={canvasScalePercentage >= 200}
            variant="ghost"
          >
            <Plus />
          </IconButton>

          <Tooltip
            content="Fit slide to window"
            positioning={{ placement: "bottom" }}
          >
            <IconButton
              aria-label="Auto scale"
              onClick={resetCanvas}
              size="sm"
              variant="ghost"
            >
              <Maximize />
            </IconButton>
          </Tooltip>
        </Flex>

        <Flex alignItems="center" gap={2}>
          <Tooltip
            content="Share with colleague"
            positioning={{ placement: "bottom" }}
          >
            <IconButton aria-label="Share" size="sm" variant="ghost">
              <Share2 />
            </IconButton>
          </Tooltip>

          <Tooltip content="Present it" positioning={{ placement: "bottom" }}>
            <IconButton aria-label="Present" size="sm" variant="ghost">
              <Play />
            </IconButton>
          </Tooltip>

          <Tooltip
            content="Export presentation"
            positioning={{ placement: "bottom" }}
          >
            <Button
              aria-label="Export"
              size="sm"
              bg="purple.500"
              px={2}
              rounded="lg"
            >
              <ArrowDownToLine /> Export
            </Button>
          </Tooltip>
        </Flex>
      </HStack>
    </HStack>
  );
}

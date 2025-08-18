// import { create } from "zustand";
// import { v4 as uuidv4 } from "uuid";
// import samplePresentation from "../mock/sample-presentation.json";

// import { Slide, SlideElement, SlideImageElement, SlideTextElement, SlideTheme } from "../types";

// type Deck = {
//   id: string;
//   title: string;
//   theme: SlideTheme;
//   width: number;
//   height: number;
//   slides: Slide[];
// };

// type State = {
//   presentation: Deck;
//   activeSlideId: string | null;
//   selectedElementId: string | null;
//   history: Deck[];
//   historyIndex: number;
//   zoom: number;
// };

// type Actions = {
//   setActiveSlide: (slideId: string) => void;
//   addSlide: () => void;
//   addElement: (slideId: string, element: SlideElement) => void;
//   updateElement: (
//     slideId: string,
//     elementId: string,
//     updates:
//       | Partial<
//           Omit<SlideTextElement, "properties" | "type"> & {
//             properties: Partial<SlideTextElement["properties"]>;
//           }
//         >
//       | Partial<
//           Omit<SlideImageElement, "properties" | "type"> & {
//             properties: Partial<SlideImageElement["properties"]>;
//           }
//         >
//   ) => void;
//   setZoom: (zoom: number) => void;
//   autoZoom: () => void;
//   undo: () => void;
//   redo: () => void;
// };

// export const useStore = create<State & Actions>((set) => ({
//   presentation: samplePresentation.presentation as Deck,
//   activeSlideId: samplePresentation.presentation.slides[0]?.id || null,
//   selectedElementId: null,
//   history: [samplePresentation.presentation as Deck],
//   historyIndex: 0,
//   zoom: 1,

//   setActiveSlide: (slideId) =>
//     set(() => ({
//       activeSlideId: slideId,
//       selectedElementId: null,
//     })),

//   addSlide: () =>
//     set((state) => {
//       const newSlide: Slide = {
//         id: uuidv4(),
//         order: state.presentation.slides.length + 1,
//         background: { type: "solid", color: "#FFFFFF" },
//         themeOverride: {},
//         elements: [],
//       };
//       const newPresentation = {
//         ...state.presentation,
//         slides: [...state.presentation.slides, newSlide],
//       };
//       return {
//         presentation: newPresentation,
//         activeSlideId: newSlide.id,
//         history: [
//           ...state.history.slice(0, state.historyIndex + 1),
//           newPresentation,
//         ],
//         historyIndex: state.historyIndex + 1,
//       };
//     }),

//   addElement: (slideId, element) =>
//     set((state) => {
//       const newPresentation = {
//         ...state.presentation,
//         slides: state.presentation.slides.map((slide) =>
//           slide.id === slideId
//             ? { ...slide, elements: [...slide.elements, element] }
//             : slide
//         ),
//       };
//       return {
//         presentation: newPresentation,
//         history: [
//           ...state.history.slice(0, state.historyIndex + 1),
//           newPresentation,
//         ],
//         historyIndex: state.historyIndex + 1,
//       };
//     }),

//   updateElement: (slideId, elementId, updates) =>
//     set((state) => {
//       const newPresentation = {
//         ...state.presentation,
//         slides: state.presentation.slides.map((slide) =>
//           slide.id === slideId
//             ? {
//                 ...slide,
//                 elements: slide.elements.map((el) => {
//                   if (el.id !== elementId) return el;
//                   const updatedElement = { ...el };
//                   if ("left" in updates) updatedElement.left = updates.left!;
//                   if ("top" in updates) updatedElement.top = updates.top!;
//                   if ("width" in updates) updatedElement.width = updates.width!;
//                   if ("height" in updates)
//                     updatedElement.height = updates.height!;
//                   if ("rotate" in updates)
//                     updatedElement.rotate = updates.rotate!;
//                   if (updates.properties) {
//                     updatedElement.properties = {
//                       ...el.properties,
//                       ...updates.properties,
//                     };
//                   }
//                   return updatedElement;
//                 }),
//               }
//             : slide
//         ),
//       };
//       return {
//         presentation: newPresentation,
//         history: [
//           ...state.history.slice(0, state.historyIndex + 1),
//           newPresentation,
//         ],
//         historyIndex: state.historyIndex + 1,
//       };
//     }),

//   setZoom: (zoom) =>
//     set(() => ({
//       zoom: Math.max(0.1, Math.min(zoom, 2)),
//     })),

//   autoZoom: () =>
//     set((state) => {
//       const container = document.getElementById("canvas-container");
//       if (!container) return state;

//       const containerWidth = container.clientWidth;
//       const containerHeight = container.clientHeight;
//       const BASE_WIDTH = 1280;
//       const BASE_HEIGHT = 720;

//       // Calculate the zoom factor to fit the slide in the container while maintaining aspect ratio
//       const horizontalZoom = containerWidth / BASE_WIDTH;
//       const verticalZoom = containerHeight / BASE_HEIGHT;

//       // Use the smaller zoom factor to ensure the slide fits completely
//       // Apply a scale factor of 85% to give some padding around the slide
//       const scaleFactor = 0.85;
//       const fitZoom = Math.min(horizontalZoom, verticalZoom) * scaleFactor;

//       // Limit zoom between 10% and 200%
//       const newZoom = Math.max(0.1, Math.min(fitZoom, 2));

//       return { zoom: newZoom };
//     }),

//   undo: () =>
//     set((state) => {
//       if (state.historyIndex <= 0) return state;
//       return {
//         presentation: state.history[state.historyIndex - 1],
//         historyIndex: state.historyIndex - 1,
//         activeSlideId: state.activeSlideId,
//         selectedElementId: null,
//       };
//     }),

//   redo: () =>
//     set((state) => {
//       if (state.historyIndex >= state.history.length - 1) return state;
//       return {
//         presentation: state.history[state.historyIndex + 1],
//         historyIndex: state.historyIndex + 1,
//         activeSlideId: state.activeSlideId,
//         selectedElementId: null,
//       };
//     }),
// }));

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { omit } from "lodash";
import samplePresentation from "../mock/sample-presentation.json";
import {
  Slide,
  SlideTheme,
  SlideElement,
  SlideTemplate,
  SlideAnimation,
  SlideBackgroundType,
  LineStyleType,
} from "../types";

interface RemovePropData {
  id: string;
  propName: string | string[];
}

interface UpdateElementData {
  id: string | string[];
  props: Partial<SlideElement>;
  slideId?: string;
}

interface FormatedAnimation {
  animations: SlideAnimation[];
  autoNext: boolean;
}

interface SlidesState {
  title: string;
  theme: SlideTheme;
  slides: Slide[];
  slideIndex: number;
  viewportSize: number;
  viewportRatio: number;
  templates: SlideTemplate[];
}

interface Actions {
  setTitle: (title: string) => void;
  setTheme: (themeProps: Partial<SlideTheme>) => void;
  setViewportSize: (size: number) => void;
  setViewportRatio: (ratio: number) => void;
  setSlides: (slides: Slide[]) => void;
  setTemplates: (templates: SlideTemplate[]) => void;
  updateSlideIndex: (index: number) => void;
  addSlide: (slide?: Slide | Slide[]) => void;
  updateSlide: (props: Partial<Slide>, slideId?: string) => void;
  removeSlideProps: (data: RemovePropData) => void;
  deleteSlide: (slideId: string | string[]) => void;
  addElement: (element: SlideElement | SlideElement[]) => void;
  deleteElement: (elementId: string | string[]) => void;
  updateElement: (data: UpdateElementData) => void;
  removeElementProps: (data: RemovePropData) => void;
  currentSlide: () => Slide | undefined;
  currentSlideAnimations: () => SlideAnimation[];
  formatedAnimations: () => FormatedAnimation[];
}

export const useStore = create<SlidesState & Actions>((set, get) => ({
  title: samplePresentation.presentation.title || "Untitled Presentation",
  theme: samplePresentation.presentation.theme as SlideTheme,
  slides: samplePresentation.presentation.slides as Slide[],
  slideIndex: 0,
  viewportSize: 1280,
  viewportRatio: 0.5625, // 16:9
  templates: [
    {
      name: "Red General",
      id: "template_1",
      cover: "https://asset.pptist.cn/img/template_1.jpg",
    },
    {
      name: "Blue General",
      id: "template_2",
      cover: "https://asset.pptist.cn/img/template_2.jpg",
    },
    {
      name: "Purple General",
      id: "template_3",
      cover: "https://asset.pptist.cn/img/template_3.jpg",
    },
    {
      name: "Morandi Color",
      id: "template_4",
      cover: "https://asset.pptist.cn/img/template_4.jpg",
    },
  ],

  setTitle: (title) =>
    set(() => ({
      title: title || "Untitled Presentation",
    })),

  setTheme: (themeProps) =>
    set((state) => ({
      theme: { ...state.theme, ...themeProps },
    })),

  setViewportSize: (size) =>
    set(() => ({
      viewportSize: size,
    })),

  setViewportRatio: (ratio) =>
    set(() => ({
      viewportRatio: ratio,
    })),

  setSlides: (slides) =>
    set(() => ({
      slides,
      slideIndex: 0,
    })),

  setTemplates: (templates) =>
    set(() => ({
      templates,
    })),

  updateSlideIndex: (index) =>
    set((state) => ({
      slideIndex: Math.max(0, Math.min(index, state.slides.length - 1)),
    })),

  addSlide: (slide) =>
    set((state) => {
      const slides = slide
        ? Array.isArray(slide)
          ? slide.map((s) => ({ ...s, sectionTag: undefined }))
          : [{ ...slide, sectionTag: undefined }]
        : [
            {
              id: uuidv4(),
              background: {
                type: "solid" as SlideBackgroundType,
                color: "#FFFFFF",
              },
              themeOverride: {
                backgroundColor: "#FFFFFF",
                fontColor: "#333333",
                fontName: "Roboto",
                outline: {
                  style: "solid" as LineStyleType,
                  width: 0,
                  color: "#000000",
                },
                shadow: { h: 0, v: 0, blur: 0, color: "#000000" },
              },
              elements: [],
            },
          ];
      const addIndex = state.slideIndex + 1;
      return {
        slides: [
          ...state.slides.slice(0, addIndex),
          ...slides,
          ...state.slides.slice(addIndex),
        ],
        slideIndex: addIndex,
      };
    }),

  updateSlide: (props, slideId) =>
    set((state) => {
      const slideIndex = slideId
        ? state.slides.findIndex((s) => s.id === slideId)
        : state.slideIndex;
      const newSlides = [...state.slides];
      newSlides[slideIndex] = { ...newSlides[slideIndex], ...props };
      return {
        slides: newSlides,
      };
    }),

  removeSlideProps: (data) =>
    set((state) => {
      const { id, propName } = data;
      return {
        slides: state.slides.map((slide) =>
          slide.id === id ? (omit(slide, propName) as Slide) : slide,
        ),
      };
    }),

  deleteSlide: (slideId) =>
    set((state) => {
      const slidesId = Array.isArray(slideId) ? slideId : [slideId];
      const newSlides = [...state.slides];
      const deleteIndices = slidesId
        .map((id) => newSlides.findIndex((s) => s.id === id))
        .filter((index) => index !== -1)
        .sort((a, b) => b - a);

      for (const index of deleteIndices) {
        const deletedSlideSection = newSlides[index].sectionTag;
        if (
          deletedSlideSection &&
          newSlides[index + 1] &&
          !newSlides[index + 1].sectionTag
        ) {
          newSlides[index + 1].sectionTag = deletedSlideSection;
          delete newSlides[index].sectionTag;
        }
        newSlides.splice(index, 1);
      }

      let newIndex = Math.min(...deleteIndices);
      if (newIndex > newSlides.length - 1) newIndex = newSlides.length - 1;

      return {
        slides: newSlides,
        slideIndex: newIndex,
      };
    }),

  addElement: (element) =>
    set((state) => {
      const elements = Array.isArray(element) ? element : [element];
      const newSlides = [...state.slides];
      newSlides[state.slideIndex] = {
        ...newSlides[state.slideIndex],
        elements: [...newSlides[state.slideIndex].elements, ...elements],
      };
      return {
        slides: newSlides,
      };
    }),

  deleteElement: (elementId) =>
    set((state) => {
      const elementIdList = Array.isArray(elementId) ? elementId : [elementId];
      const newSlides = [...state.slides];
      newSlides[state.slideIndex] = {
        ...newSlides[state.slideIndex],
        elements: newSlides[state.slideIndex].elements.filter(
          (el) => !elementIdList.includes(el.id),
        ),
      };
      return {
        slides: newSlides,
      };
    }),

  updateElement: (data) =>
    set((state) => {
      const { id, props, slideId } = data;
      const elIdList = typeof id === "string" ? [id] : id;
      const slideIndex = slideId
        ? state.slides.findIndex((s) => s.id === slideId)
        : state.slideIndex;
      const newSlides = [...state.slides];
      newSlides[slideIndex] = {
        ...newSlides[slideIndex],
        elements: newSlides[slideIndex].elements.map((el) => {
          if (!elIdList.includes(el.id)) return el;
          const updatedElement = {
            ...el,
            x: props.x ?? el.x,
            y: props.y ?? el.y,
            width: props.width ?? el.width,
            height: props.height ?? el.height,
            rotation: props.rotation ?? el.rotation,
          };
          if (props.properties) {
            updatedElement.properties = {
              ...el.properties,
              ...props.properties,
            };
          }
          return updatedElement;
        }) as SlideElement[],
      };
      return {
        slides: newSlides,
      };
    }),

  removeElementProps: (data) =>
    set((state) => {
      const { id, propName } = data;
      const propNames = typeof propName === "string" ? [propName] : propName;
      const newSlides = [...state.slides];
      newSlides[state.slideIndex] = {
        ...newSlides[state.slideIndex],
        elements: newSlides[state.slideIndex].elements.map((el) =>
          el.id === id ? (omit(el, propNames) as SlideElement) : el,
        ),
      };
      return {
        slides: newSlides,
      };
    }),

  currentSlide: () => get().slides[get().slideIndex],

  currentSlideAnimations: () => {
    const state = get();
    const currentSlide = state.slides[state.slideIndex];
    if (!currentSlide?.animations) return [];
    const elIds = currentSlide.elements.map((el) => el.id);
    return currentSlide.animations.filter((animation) =>
      elIds.includes(animation.elId),
    );
  },

  formatedAnimations: () => {
    const state = get();
    const currentSlide = state.slides[state.slideIndex];
    if (!currentSlide?.animations) return [];

    const elIds = currentSlide.elements.map((el) => el.id);
    const animations = currentSlide.animations.filter((animation) =>
      elIds.includes(animation.elId),
    );

    const formatedAnimations: FormatedAnimation[] = [];
    for (const animation of animations) {
      if (animation.trigger === "click" || !formatedAnimations.length) {
        formatedAnimations.push({ animations: [animation], autoNext: false });
      } else if (animation.trigger === "meantime") {
        const last = formatedAnimations[formatedAnimations.length - 1];
        last.animations = last.animations.filter(
          (item) => item.elId !== animation.elId,
        );
        last.animations.push(animation);
        formatedAnimations[formatedAnimations.length - 1] = last;
      } else if (animation.trigger === "auto") {
        const last = formatedAnimations[formatedAnimations.length - 1];
        last.autoNext = true;
        formatedAnimations[formatedAnimations.length - 1] = last;
        formatedAnimations.push({ animations: [animation], autoNext: false });
      }
    }
    return formatedAnimations;
  },
}));

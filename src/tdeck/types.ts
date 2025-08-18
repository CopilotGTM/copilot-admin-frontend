export const enum ElementTypes {
  TEXT = "text",
  IMAGE = "image",
  SHAPE = "shape",
  LIST = "list",
}

export const enum TextType {
  TITLE = "title",
  SUBTITLE = "subtitle",
  CONTENT = "content",
  ITEM = "item",
  ITEM_TITLE = "itemTitle",
  NOTES = "notes",
  HEADER = "header",
  FOOTER = "footer",
  PART_NUMBER = "partNumber",
  ITEM_NUMBER = "itemNumber",
}

export type LineStyleType = "solid" | "dashed" | "dotted";

export interface ElementShadow {
  h: number;
  v: number;
  blur: number;
  color: string;
}

export interface ElementOutline {
  style?: LineStyleType;
  width?: number;
  color?: string;
}

export type ElementLinkType = "web" | "slide";

export interface ElementLink {
  type: ElementLinkType;
  target: string;
}

export interface SlideBaseElement {
  id: string;
  type: ElementTypes;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  lock?: boolean;
  groupId?: string;
  link?: ElementLink;
  name?: string;
  shadow?: ElementShadow;
  outline?: ElementOutline;
}

export interface SlideTextElement extends SlideBaseElement {
  type: ElementTypes.TEXT;
  properties: {
    content: string;
    fontSize: number;
    fontName: string;
    color: string;
    align: "left" | "center" | "right";
    lineHeight: number;
    isBold: boolean;
    isItalic: boolean;
    headingLevel: "h1" | "h2" | "h3" | "body";
    textType: TextType;
    wordSpace?: number;
    opacity?: number;
    paragraphSpace?: number;
    vertical?: boolean;
  };
}

export interface listItem {
  title: string;
  desc: string;
  color?: string;
}

export interface SlideListElement extends SlideBaseElement {
  type: ElementTypes.LIST;
  properties: {
    component: "arc";
    items: listItem[];
    innerRadius: number;
    outerRadius: number;
  };
}

export interface ImageElementFilters {
  blur?: string;
  brightness?: string;
  contrast?: string;
  grayscale?: string;
  saturate?: string;
  "hue-rotate"?: string;
  sepia?: string;
  invert?: string;
  opacity?: string;
}

export interface ImageElementClip {
  range: [[number, number], [number, number]];
  shape: string;
}

export const enum ImageType {
  PAGE_FIGURE = "pageFigure",
  ITEM_FIGURE = "itemFigure",
  BACKGROUND = "background",
}

export interface SlideImageElement extends SlideBaseElement {
  type: ElementTypes.IMAGE;
  properties: {
    src: string;
    opacity: number;
    fixedRatio: boolean;
    flipH?: boolean;
    flipV?: boolean;
    filters?: ImageElementFilters;
    clip?: ImageElementClip;
    radius?: number;
    colorMask?: string;
    imageType?: ImageType;
  };
}

export type GradientType = "linear" | "radial";
export interface GradientColor {
  pos: number;
  color: string;
}
export interface Gradient {
  type: GradientType;
  colors: GradientColor[];
  rotate: number;
}

export interface ShapeText {
  content: string;
  defaultFontName: string;
  defaultColor: string;
  align: "top" | "middle" | "bottom";
  type?: TextType;
}

export const enum ShapePathFormulasKeys {
  ROUND_RECT = "roundRect",
  ROUND_RECT_DIAGONAL = "roundRectDiagonal",
  ROUND_RECT_SINGLE = "roundRectSingle",
  ROUND_RECT_SAMESIDE = "roundRectSameSide",
  CUT_RECT_DIAGONAL = "cutRectDiagonal",
  CUT_RECT_SINGLE = "cutRectSingle",
  CUT_RECT_SAMESIDE = "cutRectSameSide",
  CUT_ROUND_RECT = "cutRoundRect",
  MESSAGE = "message",
  ROUND_MESSAGE = "roundMessage",
  L = "L",
  RING_RECT = "ringRect",
  PLUS = "plus",
  TRIANGLE = "triangle",
  PARALLELOGRAM_LEFT = "parallelogramLeft",
  PARALLELOGRAM_RIGHT = "parallelogramRight",
  TRAPEZOID = "trapezoid",
  BULLET = "bullet",
  INDICATOR = "indicator",
}

export interface SlideShapeElement extends SlideBaseElement {
  type: ElementTypes.SHAPE;
  properties: {
    path: string;
    viewBox: [number, number];
    fill: string;
    opacity: number;
    fixedRatio: boolean;
    flipH?: boolean;
    flipV?: boolean;
    gradient?: Gradient;
    pattern?: string;
    text?: ShapeText;
    pathFormula?: ShapePathFormulasKeys;
    keypoints?: number[];
  };
}

export type SlideElement =
  | SlideTextElement
  | SlideImageElement
  | SlideShapeElement
  | SlideListElement;

export type SlideBackgroundType = "solid" | "image" | "gradient";
export type SlideBackgroundImageSize = "cover" | "contain" | "repeat";
export interface SlideBackgroundImage {
  src: string;
  size: SlideBackgroundImageSize;
}

export interface SlideBackground {
  type: SlideBackgroundType;
  color?: string;
  image?: SlideBackgroundImage;
  gradient?: Gradient;
  overlay?: {
    color: string;
    opacity: number;
  };
}

export type AnimationType = "in" | "out" | "attention";
export type AnimationTrigger = "click" | "meantime" | "auto";

export interface SlideAnimation {
  id: string;
  elId: string;
  effect: string;
  type: AnimationType;
  duration: number;
  trigger: AnimationTrigger;
}

export type TurningMode =
  | "no"
  | "fade"
  | "slideX"
  | "slideY"
  | "random"
  | "slideX3D"
  | "slideY3D"
  | "rotate"
  | "scaleY"
  | "scaleX"
  | "scale"
  | "scaleReverse";

export interface NoteReply {
  id: string;
  content: string;
  time: number;
  user: string;
}

export interface Note {
  id: string;
  content: string;
  time: number;
  user: string;
  elId?: string;
  replies?: NoteReply[];
}

export interface SectionTag {
  id: string;
  title?: string;
}

export type SlideType = "cover" | "contents" | "transition" | "content" | "end";

export interface Slide {
  id: string;
  elements: SlideElement[];
  notes?: Note[];
  remark?: string;
  background?: SlideBackground;
  animations?: SlideAnimation[];
  turningMode?: TurningMode;
  sectionTag?: SectionTag;
  type?: SlideType;
}

export interface SlideTheme {
  backgroundColor: string;
  themeColors: string[];
  fontColor: string;
  fontName: string;
  outline?: ElementOutline;
  shadow?: ElementShadow;
}

export interface SlideTemplate {
  name: string;
  id: string;
  cover: string;
}

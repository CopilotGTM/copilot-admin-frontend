import { Image as KonvaImage } from "react-konva";
import { useImage } from "react-konva-utils";
import { SlideImageElement } from "../../types";

interface ImageThumbnailProps {
  element: SlideImageElement;
}

export default function ImageThumbnail({ element }: ImageThumbnailProps) {
  const [image] = useImage(element.properties.src);
  return (
    <KonvaImage
      key={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      image={image || undefined}
      opacity={element.properties.opacity}
    />
  );
}

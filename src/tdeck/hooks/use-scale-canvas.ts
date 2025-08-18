"use client";

import { useMainStore } from "../store/main";

export const useScaleCanvas = () => {
  const canvasScalePercentage = useMainStore(
    (state) => state.canvasScalePercentage,
  );
  const canvasScale = useMainStore((state) => state.canvasScale);
  const canvasDragged = useMainStore((state) => state.canvasDragged);
  const setCanvasScale = useMainStore((state) => state.setCanvasScale);
  const setCanvasDragged = useMainStore((state) => state.setCanvasDragged);
  const setCanvasScalePercentage = useMainStore(
    (state) => state.setCanvasScalePercentage,
  );

  /**
   * Scale canvas by incrementing or decrementing percentage
   * @param command Zoom in (+) or out (-)
   */
  const scaleCanvas = (command: "+" | "-") => {
    let percentage = canvasScalePercentage;
    const step = 5;
    const max = 200;
    const min = 30;

    if (command === "+" && percentage <= max) {
      percentage += step;
    }
    if (command === "-" && percentage >= min) {
      percentage -= step;
    }

    setCanvasScalePercentage(percentage);
    setCanvasScale(percentage / 100);
  };

  /**
   * Set canvas scale percentage to achieve a target scale
   * @param value Target canvas scale (e.g., 0.9 for 90%)
   */
  const setCanvasScalePercentage_ = (value: number) => {
    const percentage =
      Math.round((value / canvasScale) * canvasScalePercentage) / 100;
    setCanvasScalePercentage(percentage);
    setCanvasScale(percentage / 100);
  };

  /**
   * Reset canvas to default scale and position
   */
  const resetCanvas = () => {
    setCanvasScalePercentage(90);
    setCanvasScale(0.9);
    if (canvasDragged) {
      setCanvasDragged(false);
    }
  };

  return {
    scaleCanvas,
    setCanvasScalePercentage: setCanvasScalePercentage_,
    resetCanvas,
  };
};

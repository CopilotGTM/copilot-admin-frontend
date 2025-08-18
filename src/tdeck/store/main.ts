"use client";

import { create } from "zustand";

interface MainState {
  canvasScalePercentage: number; // 画布可视区域百分比
  canvasScale: number; // 画布缩放比例
  canvasDragged: boolean; // 画布被拖拽移动
}

interface Actions {
  setCanvasScalePercentage: (percentage: number) => void;
  setCanvasScale: (scale: number) => void;
  setCanvasDragged: (isDragged: boolean) => void;
}

export const useMainStore = create<MainState & Actions>((set) => ({
  canvasScalePercentage: 90, // Default 90%
  canvasScale: 1, // Default scale per Vue main.ts
  canvasDragged: false, // Initial drag state

  setCanvasScalePercentage: (percentage) =>
    set(() => ({
      canvasScalePercentage: percentage,
    })),

  setCanvasScale: (scale) =>
    set(() => ({
      canvasScale: scale,
    })),

  setCanvasDragged: (isDragged) =>
    set(() => ({
      canvasDragged: isDragged,
    })),
}));

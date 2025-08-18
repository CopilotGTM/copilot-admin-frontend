"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useStore } from "../store/slides";
import { useMainStore } from "../store/main";

interface ViewportStyles {
  width: number;
  height: number;
  left: number;
  top: number;
}

export const useViewportSize = (
  canvasRef: React.RefObject<HTMLElement | null>,
) => {
  const [viewportLeft, setViewportLeft] = useState(0);
  const [viewportTop, setViewportTop] = useState(0);

  const canvasScalePercentage = useMainStore(
    (state) => state.canvasScalePercentage,
  );
  const setScaleCanvas = useMainStore((state) => state.setCanvasScale);

  const viewportRatio = useStore((state) => state.viewportRatio);
  const viewportSize = useStore((state) => state.viewportSize);

  // Initialize viewport position
  const initViewportPosition = useCallback(() => {
    if (!canvasRef.current) return;

    const canvasWidth = canvasRef.current.clientWidth;
    const canvasHeight = canvasRef.current.clientHeight;

    if (canvasHeight / canvasWidth > viewportRatio) {
      const viewportActualWidth = canvasWidth * (canvasScalePercentage / 100);
      setScaleCanvas(viewportActualWidth / viewportSize);
      setViewportLeft((canvasWidth - viewportActualWidth) / 2);
      setViewportTop((canvasHeight - viewportActualWidth * viewportRatio) / 2);
    } else {
      const viewportActualHeight = canvasHeight * (canvasScalePercentage / 100);
      setScaleCanvas(viewportActualHeight / (viewportSize * viewportRatio));
      setViewportLeft((canvasWidth - viewportActualHeight / viewportRatio) / 2);
      setViewportTop((canvasHeight - viewportActualHeight) / 2);
    }
  }, [
    canvasRef,
    canvasScalePercentage,
    viewportRatio,
    viewportSize,
    setScaleCanvas,
  ]);

  // Update viewport position on canvasScalePercentage change
  const setViewportPosition = useCallback(
    (newValue: number, oldValue: number) => {
      if (!canvasRef.current) return;

      const canvasWidth = canvasRef.current.clientWidth;
      const canvasHeight = canvasRef.current.clientHeight;

      if (canvasHeight / canvasWidth > viewportRatio) {
        const newViewportActualWidth = canvasWidth * (newValue / 100);
        const oldViewportActualWidth = canvasWidth * (oldValue / 100);
        const newViewportActualHeight = newViewportActualWidth * viewportRatio;
        const oldViewportActualHeight = oldViewportActualWidth * viewportRatio;

        setScaleCanvas(newViewportActualWidth / viewportSize);
        setViewportLeft(
          viewportLeft - (newViewportActualWidth - oldViewportActualWidth) / 2,
        );
        setViewportTop(
          viewportTop - (newViewportActualHeight - oldViewportActualHeight) / 2,
        );
      } else {
        const newViewportActualHeight = canvasHeight * (newValue / 100);
        const oldViewportActualHeight = canvasHeight * (oldValue / 100);
        const newViewportActualWidth = newViewportActualHeight / viewportRatio;
        const oldViewportActualWidth = oldViewportActualHeight / viewportRatio;

        setScaleCanvas(
          newViewportActualHeight / (viewportSize * viewportRatio),
        );
        setViewportLeft(
          viewportLeft - (newViewportActualWidth - oldViewportActualWidth) / 2,
        );
        setViewportTop(
          viewportTop - (newViewportActualHeight - oldViewportActualHeight) / 2,
        );
      }
    },
    [
      canvasRef,
      viewportRatio,
      viewportSize,
      setScaleCanvas,
      viewportLeft,
      viewportTop,
    ],
  );

  // Watch canvasScalePercentage changes
  useEffect(() => {
    let previousPercentage = canvasScalePercentage;
    setViewportPosition(canvasScalePercentage, previousPercentage);
    previousPercentage = canvasScalePercentage;
  }, [canvasScalePercentage, setViewportPosition]);

  // Watch viewportRatio and viewportSize changes
  useEffect(() => {
    initViewportPosition();
  }, [viewportRatio, viewportSize, initViewportPosition]);

  // Handle canvas resize
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      initViewportPosition();
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef?.current);
      }
    };
  }, [canvasRef, initViewportPosition]);

  // Computed viewport styles
  const viewportStyles = useMemo<ViewportStyles>(
    () => ({
      width: viewportSize,
      height: viewportSize * viewportRatio,
      left: viewportLeft,
      top: viewportTop,
    }),
    [viewportSize, viewportRatio, viewportLeft, viewportTop],
  );

  // Drag viewport
  const dragViewport = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      let isMouseDown = true;

      const startPageX = e.pageX;
      const startPageY = e.pageY;
      const originLeft = viewportLeft;
      const originTop = viewportTop;

      const handleMouseMove = (e: MouseEvent) => {
        if (!isMouseDown) return;

        const currentPageX = e.pageX;
        const currentPageY = e.pageY;

        setViewportLeft(originLeft + (currentPageX - startPageX));
        setViewportTop(originTop + (currentPageY - startPageY));
      };

      const handleMouseUp = () => {
        isMouseDown = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        // Note: canvasDragged is not in useMainStore; omitted
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [viewportLeft, viewportTop],
  );

  return {
    viewportStyles,
    dragViewport,
  };
};

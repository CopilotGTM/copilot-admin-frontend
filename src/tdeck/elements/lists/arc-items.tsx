import Konva from "konva";
import React, { useRef, useState, useEffect } from "react";
import { Group, Arc, Line, Circle, Text } from "react-konva";

const DEFAULT_COLORS = [
  "#0473E1",
  "#0266C8",
  "#0148AB",
  "#0B7BC9",
  "#035A9E",
  "#023E73",
];
type ItemType = {
  title: string;
  desc: string;
  color?: string;
};

export default function ArcItemList({
  items = [], // array of { title, desc, color? }
  width = 800,
  height = 400,
  innerRadius = 80,
  outerRadius = 120,
}) {
  const n = Math.min(Math.max(items.length, 1), 6);
  const titleRefs = useRef<(Konva.Text | null)[]>(Array(n).fill(null));
  const [titleH, setTitleH] = useState<number[]>(Array(n).fill(0));

  useEffect(() => {
    const hs = titleRefs.current.slice(0, n).map((r) => (r ? r.height() : 0));
    setTitleH(hs);
  }, [items, width, height]);

  if (!n) return null;
  const isOdd = n % 2 === 1;

  // geometry
  const CX = width / 2;
  const CY = height / 2;
  const thickness = outerRadius - innerRadius;
  const midR = innerRadius + thickness / 2;
  const arcA = 360 / n;
  const toRad = (d: number) => (d * Math.PI) / 180;

  // styling
  const HLINE = 80; // horizontal bar length for even
  const RLINE = 30; // extra radial length for odd
  const DOT_R = 5;
  const GAP = 20; // gap from dot→text
  const EDGE = 20; // edge margin
  //const SH_OFF = 4;
  const TF = 14,
    TLH = 1.2;
  const DF = 12,
    DLH = 1.3;

  // measure title heights for vertical centering

  // clamp for horizontal even-case
  const leftClamp = CX - outerRadius - GAP;
  const rightClamp = CX + outerRadius + GAP;

  // build every slice
  const steps = items.slice(0, n).map((it: ItemType, i) => {
    // slice start & midpoint
    const startA = -90 + i * arcA;
    const midA = startA + arcA / 2;
    const mRad = toRad(midA);

    // badge at slice start
    const sRad = toRad(startA);
    const badgeX = CX + midR * Math.cos(sRad);
    const badgeY = CY + midR * Math.sin(sRad);

    // connector start
    const sx = CX + midR * Math.cos(mRad);
    const sy = CY + midR * Math.sin(mRad);

    // dot & text region
    let dotX, dotY, textX, textY, textW, align;
    if (isOdd) {
      // radial line out
      dotX = CX + (outerRadius + RLINE) * Math.cos(mRad);
      dotY = CY + (outerRadius + RLINE) * Math.sin(mRad);

      // text immediately outside ring, left or right
      const right = Math.cos(mRad) >= 0;
      // provisional width (we’ll clamp after measuring title)
      textW = Math.min(
        right ? width - EDGE - (dotX + GAP) : dotX - GAP - EDGE,
        width,
      );
      // horizontal textX
      textX = right ? dotX + GAP : dotX - GAP - textW;
      // vertical center title at dotY
      textY = dotY - (titleH[i] || TF) / 2;
      align = right ? "left" : "right";
    } else {
      // purely horizontal connector
      const rawX = Math.cos(mRad) >= 0 ? sx + HLINE : sx - HLINE;
      dotX =
        Math.cos(mRad) >= 0
          ? Math.min(rawX, rightClamp)
          : Math.max(rawX, leftClamp);
      dotY = sy;
      const right = Math.cos(mRad) >= 0;

      textW = right ? width - EDGE - (dotX + GAP) : dotX - GAP - EDGE;
      textX = right ? dotX + GAP : EDGE;
      textY = dotY - (titleH[i] || TF) / 2;
      align = right ? "left" : "right";
    }

    return {
      title: it.title,
      desc: it.desc,
      startA,
      arcA,
      color: it.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      num: String(i + 1).padStart(2, "0"),
      badgeX,
      badgeY,
      sx,
      sy,
      dotX,
      dotY,
      textX,
      textY,
      textW,
      align,
    };
  });

  return (
    //<Stage width={width} height={height}>
    <Group>
      {/* 1) Arcs */}
      {/* <Layer> */}
      {steps.map((s, i) => (
        <Arc
          key={i}
          x={CX}
          y={CY}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill={s.color}
          rotation={s.startA}
          angle={s.arcA}
        />
      ))}
      {/* </Layer> */}

      {/* 2) Connectors */}
      {/* <Layer> */}
      {steps.map((s, i) => (
        <Line
          key={i}
          points={[s.sx, s.sy, s.dotX, s.dotY]}
          stroke={s.color}
          strokeWidth={2}
        />
      ))}
      {/* </Layer> */}

      {/* 3) Dots */}
      {/* <Layer> */}
      {steps.map((s, i) => (
        <Circle key={i} x={s.dotX} y={s.dotY} radius={DOT_R} fill={s.color} />
      ))}
      {/* </Layer> */}

      {/* 4) Badges */}
      {/* <Layer> */}
      {steps.map((s, i) => (
        <Group key={i}>
          <Circle
            x={s.badgeX}
            y={s.badgeY}
            radius={thickness / 2}
            fill={s.color} // match the arc
            shadowColor="black"
            shadowBlur={6}
            shadowOpacity={0.3}
            shadowOffsetX={0} // no horizontal shift
            shadowOffsetY={4} // pull the shadow up only
            listening={false}
          />
          <Text
            x={s.badgeX - thickness / 2}
            y={s.badgeY - thickness / 2}
            width={thickness}
            height={thickness}
            text={s.num}
            fontSize={thickness * 0.5}
            align="center"
            verticalAlign="middle"
            fontStyle="bold"
            fill="#fff"
          />
        </Group>
      ))}
      {/* </Layer> */}

      {/* 5) Text */}
      {/* <Layer> */}
      {steps.map((s, i) => (
        <Group key={i}>
          <Text
            ref={(el) => {
              titleRefs.current[i] = el;
            }}
            x={s.textX}
            y={s.textY}
            width={s.textW}
            text={s.title}
            fontSize={TF}
            lineHeight={TLH}
            wrap="word"
            align={s.align}
            fill="#333"
          />
          <Text
            x={s.textX}
            y={s.textY + (titleH[i] || TF) + 4}
            width={s.textW}
            text={s.desc}
            fontSize={DF}
            lineHeight={DLH}
            wrap="word"
            align={s.align}
            fill="#666"
          />
        </Group>
      ))}
      {/* </Layer> */}
    </Group> //</Stage>
  );
}

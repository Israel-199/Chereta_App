import React, { useMemo } from "react";
import { View, Animated, StyleSheet } from "react-native";
import Svg, {
  G,
  Circle,
  Path,
  Text as SvgText,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from "react-native-svg";

interface LotteryWheelProps {
  size: number;
  totalSlots?: number;
  rotationAnim: Animated.Value;
  isSpinning?: boolean;
}

const DEFAULT_SLOTS = 104;

const StaticWheelSvg = React.memo<{
  size: number;
  R: number;
  R_outer: number;
  R_gold_inner: number;
  R_num_outer: number;
  R_num_inner: number;
  R_shield: number;
  fontSize: number;
  spokesAndNumbers: any[];
  studs: any[];
}>(
  ({
    size,
    R,
    R_outer,
    R_gold_inner,
    R_num_outer,
    R_num_inner,
    R_shield,
    fontSize,
    spokesAndNumbers,
    studs,
  }) => (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="goldRimGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#F5D061" />
          <Stop offset="25%" stopColor="#D4AF37" />
          <Stop offset="50%" stopColor="#8B6508" />
          <Stop offset="75%" stopColor="#F5D061" />
          <Stop offset="100%" stopColor="#B8860B" />
        </LinearGradient>
        <RadialGradient id="woodShield" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#5D3A1A" />
          <Stop offset="65%" stopColor="#3E240F" />
          <Stop offset="100%" stopColor="#221205" />
        </RadialGradient>
        <LinearGradient id="spearMetal" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#1E293B" />
          <Stop offset="30%" stopColor="#64748B" />
          <Stop offset="50%" stopColor="#F8FAFC" />
          <Stop offset="70%" stopColor="#475569" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>
        <RadialGradient id="metalBoss" cx="35%" cy="35%" r="65%">
          <Stop offset="0%" stopColor="#E2E8F0" />
          <Stop offset="40%" stopColor="#94A3B8" />
          <Stop offset="80%" stopColor="#475569" />
          <Stop offset="100%" stopColor="#1E293B" />
        </RadialGradient>
      </Defs>

      <Circle cx={R} cy={R} r={R_outer} fill="none" stroke="url(#goldRimGrad)" strokeWidth={7} />
      <Circle cx={R} cy={R} r={R_gold_inner} fill="none" stroke="#B8860B" strokeWidth={1} />
      <Circle cx={R} cy={R} r={R_num_outer} fill="#FFFFFF" />

      <G id="spokes">
        {spokesAndNumbers.map((item) => (
          <Path key={`spoke-${item.key}`} d={item.spokePath} fill="#72BF44" stroke="none" />
        ))}
      </G>

      <Circle cx={R} cy={R} r={R_num_outer} fill="none" stroke="#CBD5E1" strokeWidth={1} />
      <Circle cx={R} cy={R} r={R_num_inner} fill="none" stroke="#CBD5E1" strokeWidth={1} />

      <G id="dividers">
        {spokesAndNumbers.map((item) => (
          <Path key={`div-${item.key}`} d={`M ${item.divX1} ${item.divY1} L ${item.divX2} ${item.divY2}`} stroke="#CBD5E1" strokeWidth={0.6} />
        ))}
      </G>

      <G id="numbers">
        {spokesAndNumbers.map((item) => (
          <SvgText
            key={`num-${item.key}`}
            x={item.numX}
            y={item.numY}
            fill="#1B365D"
            fontSize={fontSize}
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="central"
            transform={`rotate(${item.textRotation}, ${item.numX}, ${item.numY})`}
          >
            {item.num}
          </SvgText>
        ))}
      </G>

      <Circle cx={R} cy={R} r={R_shield} fill="url(#woodShield)" stroke="#221205" strokeWidth={2.5} />
      <Circle cx={R} cy={R} r={R_shield - 2.5} fill="none" stroke="#8B6508" strokeWidth={1.5} />

      {studs.map((s, idx) => (
        <Circle key={`stud-${idx}`} cx={s.x} cy={s.y} r={size * 0.009} fill="#D4AF37" stroke="#222" strokeWidth={0.5} />
      ))}
    </Svg>
  ),
  () => true
);

const LotteryWheelComponent: React.FC<LotteryWheelProps> = ({
  size,
  totalSlots = DEFAULT_SLOTS,
  rotationAnim,
}) => {
  const R = size / 2;
  const numSlots = Math.max(12, Math.min(104, totalSlots));

  const angleSteps = useMemo(() => {
    const weights = Array.from({ length: numSlots }, (_, i) =>
      i + 1 >= 100 ? 1.35 : 1
    );

    const totalWeight = weights.reduce(
      (sum, weight) => sum + weight,
      0
    );

    return weights.map(
      (weight) => (360 * weight) / totalWeight
    );
  }, [numSlots]);

  const R_outer = R - 4;
  const R_gold_inner = R - 6;
  const R_num_outer = R - 8;
  const R_num_inner = R - 20;
  const R_num = R - 14;
  const R_spoke_outer = R_num_inner;
  const R_spoke_inner = R * 0.23;
  const R_shield = R * 0.22;
  const R_boss = R * 0.07;

  const spokesAndNumbers = useMemo(() => {
    const items = [];
    let accumulatedAngle = 0;

    for (let i = 0; i < numSlots; i++) {
      const num = i + 1;
      const currentStep = angleSteps[i];

      const centerAngleDeg = accumulatedAngle + currentStep / 2 - 90;
      const centerAngleRad = (centerAngleDeg * Math.PI) / 180;
      const radStep = (currentStep * Math.PI) / 180;
      const halfW = radStep * 0.44;

      const a1 = centerAngleRad - halfW;
      const a2 = centerAngleRad + halfW;

      const x1 = R + R_spoke_inner * Math.cos(a1);
      const y1 = R + R_spoke_inner * Math.sin(a1);

      const x2 = R + R_spoke_outer * Math.cos(a1);
      const y2 = R + R_spoke_outer * Math.sin(a1);

      const x3 = R + R_spoke_outer * Math.cos(a2);
      const y3 = R + R_spoke_outer * Math.sin(a2);

      const x4 = R + R_spoke_inner * Math.cos(a2);
      const y4 = R + R_spoke_inner * Math.sin(a2);

      const spokePath = `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;

      const divX1 = R + R_num_inner * Math.cos(a1);
      const divY1 = R + R_num_inner * Math.sin(a1);

      const divX2 = R + R_num_outer * Math.cos(a1);
      const divY2 = R + R_num_outer * Math.sin(a1);

      const numX = R + R_num * Math.cos(centerAngleRad);
      const numY = R + R_num * Math.sin(centerAngleRad);

      const textRotation = 0;

      items.push({
        key: i,
        num,
        spokePath,
        divX1,
        divY1,
        divX2,
        divY2,
        numX,
        numY,
        textRotation,
      });

      accumulatedAngle += currentStep;
    }

    return items;
  }, [
    numSlots,
    angleSteps,
    R,
    R_spoke_inner,
    R_spoke_outer,
    R_num_inner,
    R_num_outer,
    R_num,
  ]);

  const studs = useMemo(() => {
    const list = [];
    const count = 14;
    const studR = R_shield - 4;

    for (let i = 0; i < count; i++) {
      const a = (i * (360 / count) * Math.PI) / 180;
      list.push({
        x: R + studR * Math.cos(a),
        y: R + studR * Math.sin(a),
      });
    }

    return list;
  }, [R, R_shield]);

  const spearRotation = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const fontSize = useMemo(() => {
    if (numSlots > 80) return Math.max(6.2, size * 0.022);
    if (numSlots > 50) return Math.max(7.8, size * 0.026);
    return Math.max(9.8, size * 0.033);
  }, [numSlots, size]);

  const spearLength = (R_num_inner - R_shield) * 0.84;
  const spearWidth = Math.max(13, size * 0.042);
  const spearTipY = R - R_shield - spearLength;
  const spearBaseY = R - R_shield + 4;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* STATIC WHEEL (Memoized for 60fps instant tab rendering) */}
      <StaticWheelSvg
        size={size}
        R={R}
        R_outer={R_outer}
        R_gold_inner={R_gold_inner}
        R_num_outer={R_num_outer}
        R_num_inner={R_num_inner}
        R_shield={R_shield}
        fontSize={fontSize}
        spokesAndNumbers={spokesAndNumbers}
        studs={studs}
      />

      {/* ROTATING THIN METALLIC SPEARHEAD POINTER */}
      <Animated.View
        style={[
          styles.pointerContainer,
          {
            width: size,
            height: size,
            transform: [
              {
                rotate: spearRotation,
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Detailed Ethiopian Spearhead Blade */}
          <Path
            d={`M ${R} ${spearTipY} 
               Q ${R - spearWidth * 0.55} ${R - (R - spearTipY) * 0.55} ${R - spearWidth / 2} ${spearBaseY} 
               L ${R + spearWidth / 2} ${spearBaseY} 
               Q ${R + spearWidth * 0.55} ${R - (R - spearTipY) * 0.55} ${R} ${spearTipY} Z`}
            fill="url(#spearMetal)"
            stroke="#0F172A"
            strokeWidth={1.5}
          />

          {/* Central Ridge Line on Spear */}
          <Path
            d={`M ${R} ${spearTipY + 4} L ${R} ${spearBaseY - 2}`}
            stroke="#0F172A"
            strokeWidth={1.8}
          />

          {/* Side Bevel Highlight Lines */}
          <Path
            d={`M ${R} ${spearTipY + 8} L ${R - spearWidth * 0.35} ${spearBaseY - 4}`}
            stroke="#FFFFFF"
            strokeWidth={1}
            opacity={0.8}
          />

          <Path
            d={`M ${R} ${spearTipY + 8} L ${R + spearWidth * 0.35} ${spearBaseY - 4}`}
            stroke="#1E293B"
            strokeWidth={1}
            opacity={0.6}
          />

          {/* Spear Socket Collar */}
          <Path
            d={`M ${R - spearWidth * 0.45} ${spearBaseY - 4} L ${R + spearWidth * 0.45} ${spearBaseY - 4} L ${R + spearWidth * 0.35} ${spearBaseY + 2} L ${R - spearWidth * 0.35} ${spearBaseY + 2} Z`}
            fill="#0F172A"
            stroke="#D4AF37"
            strokeWidth={1}
          />

          {/* Center Metal Boss Cap */}
          <Circle
            cx={R}
            cy={R}
            r={R_boss}
            fill="url(#metalBoss)"
            stroke="#0F172A"
            strokeWidth={1.8}
          />

          <Circle
            cx={R}
            cy={R}
            r={R_boss * 0.45}
            fill="#D4AF37"
            stroke="#111"
            strokeWidth={0.8}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pointerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const LotteryWheel = React.memo(LotteryWheelComponent);
export default LotteryWheel;
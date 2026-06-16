import { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Line, Text as SvgText, Circle, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { Colors } from "../../constants/colors";

interface DataPoint {
  label: string;
  balance: number;
  isSummer?: boolean;
}

interface BalanceChartProps {
  data: DataPoint[];
}

const CHART_HEIGHT = 180;
const PADDING = { top: 16, bottom: 32, left: 12, right: 12 };

function fmt(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export function BalanceChart({ data }: BalanceChartProps) {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 40; // 20px padding each side
  const innerWidth = chartWidth - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const { points, pathD, gradientD, zeroY, minVal, maxVal } = useMemo(() => {
    if (data.length < 2) return { points: [], pathD: "", gradientD: "", zeroY: 0, minVal: 0, maxVal: 0 };

    const balances = data.map((d) => d.balance);
    const minVal = Math.min(0, ...balances);
    const maxVal = Math.max(0, ...balances);
    const range = maxVal - minVal || 1;

    const scaleY = (val: number) =>
      PADDING.top + innerHeight - ((val - minVal) / range) * innerHeight;
    const scaleX = (i: number) =>
      PADDING.left + (i / (data.length - 1)) * innerWidth;

    const points = data.map((d, i) => ({ x: scaleX(i), y: scaleY(d.balance), ...d }));

    // Build smooth path using cubic bezier
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = (points[i - 1].x + points[i].x) / 2;
      pathD += ` C ${cp1x} ${points[i - 1].y}, ${cp1x} ${points[i].y}, ${points[i].x} ${points[i].y}`;
    }

    // Gradient fill
    const gradientD =
      pathD +
      ` L ${points[points.length - 1].x} ${PADDING.top + innerHeight}` +
      ` L ${points[0].x} ${PADDING.top + innerHeight} Z`;

    const zeroY = scaleY(0);

    return { points, pathD, gradientD, zeroY, minVal, maxVal };
  }, [data, innerWidth, innerHeight]);

  if (data.length < 2) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>Not enough data for chart</Text>
      </View>
    );
  }

  const lineColor = data[data.length - 1].balance >= 0 ? Colors.secondary : Colors.danger;
  const gradientId = "balanceGradient";

  // Show every Nth label to avoid crowding
  const labelStep = data.length <= 6 ? 1 : data.length <= 10 ? 2 : 3;

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={lineColor} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>

        {/* Zero reference line */}
        {zeroY > PADDING.top && zeroY < PADDING.top + innerHeight && (
          <Line
            x1={PADDING.left}
            y1={zeroY}
            x2={PADDING.left + innerWidth}
            y2={zeroY}
            stroke={Colors.border}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        )}

        {/* Gradient fill */}
        <Path d={gradientD} fill={`url(#${gradientId})`} />

        {/* Line */}
        <Path d={pathD} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3} fill={p.balance >= 0 ? Colors.secondary : Colors.danger} />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => {
          if (i % labelStep !== 0 && i !== points.length - 1) return null;
          const shortLabel = p.label.replace("Winter", "Win").replace("Summer", "Sum").replace("Fall", "Fall");
          return (
            <SvgText
              key={i}
              x={p.x}
              y={CHART_HEIGHT - 4}
              fontSize={9}
              fill={Colors.textMuted}
              textAnchor="middle"
            >
              {shortLabel}
            </SvgText>
          );
        })}
      </Svg>

      {/* Y-axis labels */}
      <View style={[styles.yLabel, { top: PADDING.top - 6 }]}>
        <Text style={styles.yLabelText}>{fmt(maxVal)}</Text>
      </View>
      {minVal < 0 && (
        <View style={[styles.yLabel, { bottom: PADDING.bottom + 2 }]}>
          <Text style={[styles.yLabelText, { color: Colors.danger }]}>{fmt(minVal)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative" },
  empty: { height: CHART_HEIGHT, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 13, color: Colors.textMuted },
  yLabel: { position: "absolute", left: 0 },
  yLabelText: { fontSize: 9, color: Colors.textMuted },
});

/**
 * 手繪風格样式生成器
 * 基於节点ID生成一致的隨机样式，確保每次渲染都相同
 */

// 简单的hash函数，将字符串转换为数字
export function hashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 轉換为32位整數
  }
  return Math.abs(hash);
}

// 基於种子的偽隨机數生成器
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 生成範圍内的隨机數
function randomInRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

// 生成节点的手繪样式
export function getHanddrawnStyle(nodeId: string, nodeType: 'product' | 'concept' | 'generated') {
  const hash = hashCode(nodeId);
  
  // 为不同属性使用不同的种子
  const rotateSeed = hash + 1;
  const borderRadiusSeed = hash + 2;
  const borderWidthSeed = hash + 3;
  const skewSeed = hash + 4;

  // 生成傾斜角度 (更微妙的 -2度到2度)
  const rotateAngle = randomInRange(rotateSeed, -2, 2);
  
  // 生成不規则边框圆角
  const borderRadius = {
    topLeft: Math.floor(randomInRange(borderRadiusSeed, 85, 95)),
    topRight: Math.floor(randomInRange(borderRadiusSeed + 1, 3, 10)),
    bottomRight: Math.floor(randomInRange(borderRadiusSeed + 2, 88, 98)),
    bottomLeft: Math.floor(randomInRange(borderRadiusSeed + 3, 2, 8))
  };

  // 生成边框宽度变化
  const borderWidth = {
    top: randomInRange(borderWidthSeed, 1.5, 3),
    right: randomInRange(borderWidthSeed + 1, 2, 4),
    bottom: randomInRange(borderWidthSeed + 2, 1.5, 3),
    left: randomInRange(borderWidthSeed + 3, 3, 6)
  };

  // 生成更微妙的傾斜效果 (-0.5度到0.5度)
  const skewX = randomInRange(skewSeed, -0.5, 0.5);


  // 根據节点类型选择颜色類名
  const colorClass = {
    product: 'ink-box-yellow',
    concept: 'ink-box-green', 
    generated: 'ink-box-blue'
  }[nodeType];

  return {
    className: colorClass,
    style: {
      transform: `rotate(${rotateAngle}deg) skewX(${skewX}deg)`,
      borderRadius: `${borderRadius.topLeft}% ${borderRadius.topRight}% ${borderRadius.bottomRight}% ${borderRadius.bottomLeft}% / 
                   ${Math.floor(randomInRange(borderRadiusSeed + 4, 3, 8))}% 
                   ${Math.floor(randomInRange(borderRadiusSeed + 5, 90, 98))}% 
                   ${Math.floor(randomInRange(borderRadiusSeed + 6, 5, 12))}% 
                   ${Math.floor(randomInRange(borderRadiusSeed + 7, 92, 98))}%`,
      borderWidth: `${borderWidth.top}px ${borderWidth.right}px ${borderWidth.bottom}px ${borderWidth.left}px`,
      borderStyle: 'solid'
    } as React.CSSProperties,
    innerStyle: {
      transform: `rotate(${-rotateAngle}deg) skewX(${-skewX}deg)` // 反向轉回来，保持内容正常
    }
  };
}

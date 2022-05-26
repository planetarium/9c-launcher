import hourglassImg from "src/v2/resources/collection/items/400000.png";
import APpotionImg from "src/v2/resources/collection/items/500000.png";

export default {
  [400000]: {
    name: "Hourglass",
    img: hourglassImg,
  },
  [500000]: {
    name: "AP Potion",
    img: APpotionImg,
  },
} as Record<number, { name: string; img: string }>;

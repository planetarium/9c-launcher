import hourglassImg from "src/v2/resources/collection/items/400000.png";
import APpotionImg from "src/v2/resources/collection/items/500000.png";
import RuneImg from "src/v2/resources/collection/items/20001.png";

export default {
  400000: {
    name: "Hourglass",
    img: hourglassImg,
  },
  500000: {
    name: "AP Potion",
    img: APpotionImg,
  },
  20001: {
    name: "Rune Stone",
    img: RuneImg,
  },
} as Record<number, { name: string; img: string }>;

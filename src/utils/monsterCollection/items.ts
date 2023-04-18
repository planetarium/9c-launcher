import RuneImg from "src/renderer/resources/collection/items/20001.png";
import HourglassImg from "src/renderer/resources/collection/items/400000.png";
import APpotionImg from "src/renderer/resources/collection/items/500000.png";

export default {
  400000: {
    name: "Hourglass",
    img: HourglassImg,
  },
  500000: {
    name: "AP Potion",
    img: APpotionImg,
  },
  20001: {
    name: "Rune Stone",
    img: RuneImg,
  },
  // FIXME: Update assets after asset is made
  800201: {
    name: "Golden Meat",
    img: HourglassImg,
  },
  600201: {
    name: "Gold Dust",
    img: HourglassImg,
  },
} as Record<number, { name: string; img: string }>;

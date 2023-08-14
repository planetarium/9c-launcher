import RuneImg from "src/renderer/resources/collection/items/20001.png";
import HourglassImg from "src/renderer/resources/collection/items/400000.png";
import APpotionImg from "src/renderer/resources/collection/items/500000.png";
import GoldenMeatImg from "src/renderer/resources/collection/items/800201.png";
import GoldDustImg from "src/renderer/resources/collection/items/600201.png";
import CrystalImg from "src/renderer/resources/collection/items/crystal.png";

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
  800201: {
    name: "Golden Meat",
    img: GoldenMeatImg,
  },
  600201: {
    name: "Gold Dust",
    img: GoldDustImg,
  },
  1: {
    name: "Crystal",
    img: CrystalImg,
  },
  2: {
    name: "Garage Token",
    img: CrystalImg,
  },
} as Record<number, { name: string; img: string }>;

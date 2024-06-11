import RuneImg from "src/renderer/resources/collection/items/20001.png";
import HourglassImg from "src/renderer/resources/collection/items/400000.png";
import APpotionImg from "src/renderer/resources/collection/items/500000.png";
import SilverDustImg from "src/renderer/resources/collection/items/800201.png";
import GoldDustImg from "src/renderer/resources/collection/items/600201.png";
import RubyDustImg from "src/renderer/resources/collection/items/600202.png";
import GoldenMeatImg from "src/renderer/resources/collection/items/800202.png";

import CrystalImg from "src/renderer/resources/collection/items/crystal.png";
import GarageImg from "src/renderer/resources/collection/items/garage.png";

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
    name: "Silver Dust",
    img: SilverDustImg,
  },
  600201: {
    name: "Gold Dust",
    img: GoldDustImg,
  },
  600202: {
    name: "Ruby Dust",
    img: RubyDustImg,
  },
  800202: {
    name: "Golden Meat",
    img: GoldenMeatImg,
  },
  1: {
    name: "Crystal",
    img: CrystalImg,
  },
  2: {
    name: "Garage Token",
    img: GarageImg,
  },
} as Record<number, { name: string; img: string }>;

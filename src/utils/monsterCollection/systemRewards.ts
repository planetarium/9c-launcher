import apImg from "src/renderer/resources/collection/icon-action-power.webp";
import crystalImg from "src/renderer/resources/collection/items/crystal.png";
import ncgImg from "src/renderer/resources/collection/items/ncg.png";

const systemRewards: Reward[] = [
  {
    name: "crystal",
    img: crystalImg,
    title: "Crystal Grinding",
    amount: [0, 50, 100, 200, 200, 200, 200, 200],
  },
  {
    name: "arena",
    img: ncgImg,
    title: "Arena Reward",
    amount: [0, 100, 200, 300, 300, 300, 300, 300],
  },
  {
    name: "stage",
    img: apImg,
    title: "Stage AP",
    amount: [0, 0, 20, 20, 40, 40, 40, 40],
  },
];

type Reward = {
  name: string;
  img: string;
  title: string;
  amount: number[];
};

export default systemRewards;

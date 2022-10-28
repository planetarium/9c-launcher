import crystalImg from "src/v2/resources/collection/items/crystal.png";
import apImg from "src/v2/resources/collection/icon-action-power.webp";
import ncgImg from "src/v2/resources/collection/items/ncg.png";

const systemRewards: Reward[] = [
  {
    name: "crystal",
    img: crystalImg,
    title: `Crystal Grinding`,
    amount: [0, 50, 100, 200, 300],
  },
  {
    name: "arena",
    img: apImg,
    title: `Arena Reward`,
    amount: [0, 100, 200, 200, 200],
  },
  {
    name: "stage",
    img: ncgImg,
    title: "Stage AP",
    amount: [0, 0, 20, 20, 40],
  },
];

type Reward = {
  name: string;
  img: string;
  title: string;
  amount: number[];
};

export default systemRewards;

import { CollectionSheetItem } from "src/interfaces/collection";
import { CollectionSheetQuery } from "src/generated/graphql";

type SheetResponse = NonNullable<
  NonNullable<
    CollectionSheetQuery["stateQuery"]["monsterCollectionSheet"]
  >["orderedList"]
>[0];

export function mapSheetResponseToSheet(
  response: SheetResponse,
): CollectionSheetItem {
  if (!response) throw new Error("response is null");
  return {
    level: response?.level,
    requiredGold: response?.requiredGold,
    reward: response?.rewards.map((reward) => {
      if (!reward) throw new Error("reward is null");
      return {
        itemId: reward?.itemId,
        quantity: reward?.quantity,
      };
    }),
  };
}

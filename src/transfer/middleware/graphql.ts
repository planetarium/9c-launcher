import { GraphQLClient } from "graphql-request";
import { HEADLESS_URL } from "../../config";
import { getSdk } from "../../generated/graphql-request";

const client = new GraphQLClient(`http://${HEADLESS_URL}/graphql`);
const headlessGraphQLSDK = getSdk(client);

export type GraphQLSDK = ReturnType<typeof getSdk>;
export default headlessGraphQLSDK;

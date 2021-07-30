import { assert } from "chai";
import { GraphQLClient } from "graphql-request";
import { getSdk } from "src/generated/graphql-request";
import HeadlessStore from "src/transfer/stores/headless";

const client = new GraphQLClient(`http://localhost:23061/graphql`);
const headlessGraphQLSDK = getSdk(client);

describe("snapshot", function () {


  describe("get current epoch from store", function () {
    it("should be equal base epoch with empty store", async function () {
        const transferStore = new HeadlessStore(headlessGraphQLSDK);
        await transferStore.trySetAgentAddress();
        console.log(transferStore.getAgentAddress());
    });
  });

});

import MockedHeadlessStore from "src/transfer/stores/mockHeadless";

describe("snapshot", function () {


  describe("get current epoch from store", function () {
    it("should be equal base epoch with empty store", async function () {
        const transferStore = new MockedHeadlessStore();
        await transferStore.trySetAgentAddress();
        console.log(transferStore.getAgentAddress());
    });
  });

});

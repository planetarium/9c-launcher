import { observer } from "mobx-react";
import React from "react";
import Layout from "src/renderer/components/core/Layout";
import { T } from "src/renderer/i18n";
import Button from "src/renderer/components/ui/Button";
import { ipcRenderer } from "electron";
import H1 from "src/renderer/components/ui/H1";

const transifexTags = "v2/ConfirmUpdateView";

async function handleConfirm() {
  await ipcRenderer.invoke("execute launcher update", false);
}

function ConfirmUpdateView() {
  return (
    <Layout flex sidebar>
      <H1>Launcher Update Detected</H1>
      <T
        _str="A new launcher update has been detected within the game launcher. Please proceed with the update"
        _tags={transifexTags}
      />
      <Button variant="primary" centered onClick={handleConfirm}>
        <T _str="Confirm Update" _tags={transifexTags} />
      </Button>
    </Layout>
  );
}

export default observer(ConfirmUpdateView);

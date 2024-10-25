import React from "react";
import { observer } from "mobx-react";
import Layout from "src/renderer/components/core/Layout";
import { T } from "src/renderer/i18n";
import H1 from "src/renderer/components/ui/H1";
import Button, { ButtonBar } from "src/renderer/components/ui/Button";
import H2 from "src/renderer/components/ui/H2";
import { useStore } from "src/utils/useStore";
import { useHistory } from "react-router";
import ImportInput from "src/renderer/components/ImportInput";
import useKeyImport from "src/renderer/hooks/useKeyImport";

const transifexTags = "v2/import-view";

function ImportView() {
  const account = useStore("account");
  const history = useHistory();

  const { key, setKey, error, handleSubmit, isKeyValid } = useKeyImport();

  return (
    <Layout sidebar>
      <H1>
        <T _str="Register Your Key" _tags={transifexTags} />
      </H1>
      <H2>
        <T _str="Register your backed up key string." _tags={transifexTags} />
      </H2>
      {error && <p>{error}</p>}
      <ImportInput
        onSubmit={setKey}
        fromFile={key.fromFile}
        invalid={!!key.key && !account.isValidPrivateKey(key.key ?? "")}
      />
      <ButtonBar>
        <Button onClick={history.goBack.bind(history)}>
          <T _str="Prev" _tags={transifexTags} />
        </Button>
        <Button variant="primary" disabled={!isKeyValid} onClick={handleSubmit}>
          <T _str="Next" _tags={transifexTags} />
        </Button>
      </ButtonBar>
    </Layout>
  );
}

export default observer(ImportView);

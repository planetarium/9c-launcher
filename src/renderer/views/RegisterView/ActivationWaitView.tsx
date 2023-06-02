import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { get } from "src/config";
import Layout from "src/renderer/components/core/Layout";
import Button from "src/renderer/components/ui/Button";
import H1 from "src/renderer/components/ui/H1";
import { ExtLink } from "src/renderer/components/ui/Link";
import { T } from "src/renderer/i18n";
import loading from "src/renderer/resources/icons/loading.png";
import { registerStyles } from ".";
import { LoadingImage } from "../MonsterCollectionOverlay/base";
import { useStore } from "src/utils/useStore";
import { TxStatus, useTransactionResultLazyQuery } from "src/generated/graphql";

const transifexTags = "v2/views/register/ActivationWaitView";

function ActivationWaitView() {
  const history = useHistory();
  const account = useStore("account");
  const [fetchStatus, { data: txStatus, stopPolling }] =
    useTransactionResultLazyQuery({
      pollInterval: 1000,
      fetchPolicy: "no-cache",
    });

  useEffect(() => {
    fetch(
      get("OnboardingPortalUrl") +
        "/api/account/contract?" +
        new URLSearchParams({
          address: account.loginSession!.address.toHex(),
          activationCode: account.activationKey,
        }).toString(),
      {
        method: "POST",
        mode: "no-cors",
      }
    )
      .then((res) => {
        if (!res.ok) {
          history.push("/register/activationFail");
        } else {
          return res.text()!;
        }
      })
      .then((TxId) => {
        TxId
          ? fetchStatus({ variables: { txId: TxId! } })
          : history.push("/register/activationFail");
      });
  }, []);

  useEffect(() => {
    if (!txStatus) return;
    if (txStatus.transaction.transactionResult.txStatus === TxStatus.Success) {
      history.push("/register/activationSuccess");
    }
    if (txStatus.transaction.transactionResult.txStatus !== TxStatus.Staging) {
      stopPolling?.();
      history.push("/register/activationFail");
    }
  }, [txStatus]);

  return (
    <Layout sidebar css={registerStyles}>
      <H1>
        <T _str="Activation is in progress..." _tags={transifexTags} />
      </H1>
      <p>
        <T
          _str="This process can take upto a minute. While you are waiting, we strongly recommend you to backup your keystore file."
          _tags={transifexTags}
        />
      </p>
      <ExtLink
        href={get("KeystoreBackupDocumentationUrl")}
        css={{ color: "#1EB9DB" }}
      >
        <T
          _str="Please check the document for details."
          _tags={transifexTags}
        />
      </ExtLink>
      <Button
        layout
        variant="primary"
        centered
        css={{
          marginTop: 160,
        }}
        disabled
      >
        <LoadingImage src={loading} />
      </Button>
    </Layout>
  );
}

export default observer(ActivationWaitView);

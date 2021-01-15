import { observer } from "mobx-react";
import React, { useEffect } from "react";

import { useProtectedPrivateKeysQuery } from "../../../generated/graphql";
import useStores from "../../../hooks/useStores";
import { Index } from "../../../interfaces/i18n";

import { useLocale } from "../../i18n";

import ncLogoImage from "../../resources/logo.png"

import indexViewStyle from "./IndexView.style";

const IndexView = observer(() => {
  const { routerStore, standaloneStore } = useStores();

  // styles.
  const styles = indexViewStyle();
  const descriptionPStyle = {
    marginBlockStart: "0.5em",
    marginBlockEnd: "0.5em",
  }

  // locales.
  const { locale } = useLocale<Index>("index");
  const description = locale("description");

  const { loading, error, data } = useProtectedPrivateKeysQuery({
    fetchPolicy: "no-cache",
  });

  return (
    <div className={`leftBoard ${styles.root}`}>
      <img src={ncLogoImage} className={styles.ncLogoImage} />
      <div className={styles.welcomeText}>{locale("welcome")}</div>
      <div className={styles.descriptionText}>
        {
          typeof description === "string"
            ? description
            : description.map((paragraph) => (
              <p style={descriptionPStyle}>{paragraph}</p>
            ))
        }
      </div>
      <button className={`primaryButton ${styles.primaryButton}`}>{locale("createAccount")}</button>
      <div className={styles.alreadyHaveAnAccountText}><a>{locale("alreadyHaveAccount")}</a></div>
    </div>
  );
});

export default IndexView;
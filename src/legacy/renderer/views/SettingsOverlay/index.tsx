import React, { useCallback, useEffect, useState, useMemo } from "react";
import { observer } from "mobx-react";
import { styled } from "src/renderer/stitches.config";
import { useLanguages } from "@transifex/react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { configStore, userConfigStore } from "src/config";
import type { IConfig } from "src/interfaces/config";
import { T } from "src/renderer/i18n";
import log from "electron-log";
import { clipboard, shell, ipcRenderer } from "electron";
import { app } from "@electron/remote";
import toast from "react-hot-toast";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import H1 from "src/renderer/components/ui/H1";
import {
  Select,
  SelectOption,
  SelectWrapper,
} from "src/renderer/components/ui/Select";
import { t } from "@transifex/native";
import Button from "src/renderer/components/ui/Button";
import OverlayBase, {
  CloseButton,
} from "src/renderer/components/core/OverlayBase";
import Checkbox from "src/renderer/components/ui/Checkbox";
import AdvancedAction from "./AdvancedAction";
import UpdateIcon from "@material-ui/icons/Update";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import { OverlayProps } from "src/utils/types";
import { getKeyStorePath } from "src/stores/account";
import { ExportOverlay } from "src/renderer/components/core/Layout/UserInfo/ExportOverlay";
import { useStore } from "src/utils/useStore";
import { useLoginSession } from "src/utils/useLoginSession";

declare const CURRENT_VERSION: string;

const SCROLLBAR_SIZE = 10;

const ScrollAreaRoot = styled(ScrollArea.Root, {});

const ScrollAreaViewport = styled(ScrollArea.Viewport, {
  width: "100%",
  height: "70vh",
});

const ScrollAreaScrollbar = styled(ScrollArea.Scrollbar, {
  "&": {
    display: "flex",
    userSelect: "none",
    touchAction: "none",
    borderRadius: SCROLLBAR_SIZE,
    margin: `-24px`,
    transition: "background 160ms ease-out",
  },
  "&:hover": { backgroundColor: "$gray80" },
  '&[data-orientation="vertical"]': { width: SCROLLBAR_SIZE },
});

const ScrollAreaThumb = styled(ScrollArea.Thumb, {
  flex: 1,
  background: "$primary",
  borderRadius: SCROLLBAR_SIZE,
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "100%",
    minWidth: 44,
    minHeight: 44,
  },
});

const Form = styled("form", {
  display: "flex",
});

const FormSection = styled("div", {
  flex: 1,
  "& + &": {
    marginLeft: 40,
  },
  "& > * + *": {
    margin: "1em 0",
  },
});

const GroupTitle = styled("h2", {
  fontWeight: "$bold",
  fontSize: 18,
});

type Languages = Array<Record<"code" | "name" | "localized_name", string>>;

const transifexTags = "v2/configuration";

function handleOpenKeyStorePath() {
  getKeyStorePath().then((keyStorPath) => {
    console.log(`Open keystore folder. ${keyStorPath}`);
    shell.showItemInFolder(keyStorPath);
  });
}

function handleOpenLogPath() {
  const openpath = log.transports.file.getFile().path;
  console.log(`Open log folder. ${openpath}`);
  shell.showItemInFolder(openpath);
}

async function handlePlayerUpdate() {
  const result = await ipcRenderer.invoke("manual player update", true);
  return result;
}

const awsSinkGuid: string | undefined = ipcRenderer.sendSync(
  "get-aws-sink-cloudwatch-guid",
);

const InfoTextStyled = styled("div", {
  bottom: 50,
  left: 50,
  dragable: false,
});

function SettingsOverlay({ onClose, isOpen }: OverlayProps) {
  let versionToDisplay = "unknown";
  try {
    versionToDisplay = CURRENT_VERSION;
  } catch (error) {
    console.log("The error " + error);
    console.log("Cannot get version of application.");
  }
  const {
    register,
    control,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = useForm({
    defaultValues: {
      ...configStore.store,
      ...userConfigStore.store,
    },
  });
  const languages: Languages = useLanguages();

  const onSubmit = useCallback(
    (d: IConfig) => {
      if (!isDirty) return;
      console.log(dirtyFields);
      for (const [key, value] of Object.entries(d))
        if (dirtyFields[key as keyof IConfig])
          userConfigStore.set(key as keyof IConfig, value);
      app.relaunch();
      app.exit();
    },
    [isDirty, dirtyFields],
  );

  const onError = useCallback((errors: FieldErrors<IConfig>) => {
    if (Object.keys(errors).length === 0) return;
  }, []);

  const [exportOverlayOpened, setExportOverlayOpened] = useState(false);
  const { registry } = useStore("planetary");
  const { isLogin } = useStore("account");

  useEffect(
    () => () => void handleSubmit(onSubmit, onError)(), // Submit a form when exits.
    [],
  );

  const address = useLoginSession()?.address;

  const debugValue = useMemo(
    () =>
      [
        `LAUNCHER_VERSION: ${versionToDisplay}`,
        address && `Account: ${address.toString()}`,
        `Commit: ${GIT_HASH}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [address],
  );
  const onClick = () => {
    clipboard.writeText(debugValue);
    toast(<T _str="Copied version information." _tags="v2/diagnostics" />, {
      position: "bottom-left",
      id: "version-copied",
    });
  };

  return (
    <OverlayBase isOpen={isOpen} onDismiss={onClose}>
      <ScrollAreaRoot type="always">
        <ScrollAreaViewport>
          <CloseButton onClick={onClose} />
          <H1 css={{ marginTop: 0 }}>
            <T _str="Settings" _tags={transifexTags} />
          </H1>
          <p>
            <T _str="" _tags={transifexTags} />
          </p>
          <Form onSubmit={handleSubmit(onSubmit, onError)} id="form">
            <FormSection>
              <GroupTitle>
                <T _str="Language" _tags={transifexTags} />
              </GroupTitle>
              <p>
                <T _str="Select the language you want." _tags={transifexTags} />
              </p>
              <Controller
                name="Locale"
                control={control}
                render={({ field }) => (
                  <SelectWrapper fullWidth>
                    <Select {...field}>
                      {languages.map(({ code, localized_name }) => (
                        <SelectOption key={code} value={code}>
                          {localized_name}
                        </SelectOption>
                      ))}
                    </Select>
                  </SelectWrapper>
                )}
              />

              <GroupTitle>
                <T _str="Advanced" _tags={transifexTags} />
              </GroupTitle>
              <AdvancedAction
                link
                onClick={handleOpenLogPath}
                text={t("Open Log Folder")}
              />
              <AdvancedAction
                link
                onClick={handleOpenKeyStorePath}
                text={t("Open keystore Folder")}
              />
              {isLogin && (
                <AdvancedAction
                  icon={<AccountBoxIcon />}
                  text={t("Export keystore")}
                  onClick={() => {
                    setExportOverlayOpened(true);
                  }}
                />
              )}
              <AdvancedAction
                icon={<UpdateIcon />}
                onClick={handlePlayerUpdate}
                text={t("Manual Player Update")}
              />
            </FormSection>
            <FormSection>
              <GroupTitle>
                <T _str="User Interface" _tags={transifexTags} />
              </GroupTitle>
              <Checkbox {...register("TrayOnClose")}>
                <T
                  _str="Keep launcher on tray when closed"
                  _tags={transifexTags}
                />
              </Checkbox>
              <GroupTitle>
                <T _str="Send Information" _tags={transifexTags} />
              </GroupTitle>
            </FormSection>
          </Form>
          <Button
            type="submit"
            form="form"
            disabled={!isDirty}
            centered
            variant="primary"
          >
            <T _str="Save" _tags={transifexTags} />
          </Button>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation="vertical">
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
      </ScrollAreaRoot>
      <ExportOverlay
        isOpen={exportOverlayOpened}
        onClose={() => setExportOverlayOpened(false)}
      />
      <InfoTextStyled onClick={onClick}>
        {`Launcher version: ${versionToDisplay}`}
      </InfoTextStyled>
    </OverlayBase>
  );
}

export default observer(SettingsOverlay);

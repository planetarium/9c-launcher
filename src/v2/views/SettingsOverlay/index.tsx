import React, { useCallback, useEffect } from "react";
import { observer } from "mobx-react";
import { styled } from "src/v2/stitches.config";
import { useLanguages } from "@transifex/react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { configStore, userConfigStore } from "src/config";
import type { IConfig } from "src/interfaces/config";
import { T } from "src/renderer/i18n";
import path from "path";
import log from "electron-log";
import { shell, ipcRenderer } from "electron";
import { app } from "@electron/remote";
import { preloadService } from "src/v2/machines/preloadMachine";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import H1 from "src/v2/components/ui/H1";
import TextField from "src/v2/components/ui/TextField";
import { Select, SelectOption } from "src/v2/components/ui/Select";
import FolderChooser from "./FolderChooser";
import { t } from "@transifex/native";
import Button from "src/v2/components/ui/Button";
import OverlayBase, { CloseButton } from "src/v2/components/core/OverlayBase";
import Checkbox from "src/v2/components/ui/Checkbox";
import AdvancedAction from "./AdvancedAction";
import DeleteIcon from "@material-ui/icons/Delete";
import UpdateIcon from "@material-ui/icons/Update";
import { OverlayProps } from "src/v2/utils/types";
import toast from "react-hot-toast";

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
    marginTop: "1em",
  },
});

const GroupTitle = styled("h2", {
  fontWeight: "$bold",
  fontSize: 18,
});

type Languages = Array<Record<"code" | "name" | "localized_name", string>>;

const transifexTags = "v2/configuration";

function handleOpenKeyStorePath() {
  const openpath = path.join(app.getPath("appData"), "planetarium", "keystore");
  console.log(`Open keystore folder. ${openpath}`);
  shell.showItemInFolder(openpath);
}

function handleOpenLogPath() {
  const openpath = log.transports.file.getFile().path;
  console.log(`Open log folder. ${openpath}`);
  shell.showItemInFolder(openpath);
}

async function clearCache() {
  preloadService.send("IDLE");
  const result = await ipcRenderer.invoke("clear cache", true);
  return result;
}

async function handleLauncherUpdate() {
  const result = await ipcRenderer.invoke("start launcher update");
  return result;
}

async function handlePlayerUpdate() {
  const result = await ipcRenderer.invoke("start player update", true);
  return result;
}

function SettingsOverlay({ onClose, isOpen }: OverlayProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
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
    [isDirty, dirtyFields]
  );

  const onError = useCallback((errors: FieldErrors<IConfig>) => {
    if (Object.keys(errors).length === 0) return;
  }, []);

  useEffect(
    () => () => void handleSubmit(onSubmit, onError)(), // Submit a form when exits.
    []
  );

  const preferLegacyInterface = watch("PreferLegacyInterface");

  useEffect(() => {
    if (preferLegacyInterface)
      toast("Please let us know what issue you've had on Discord!");
  }, [preferLegacyInterface]);

  const useRemoteHeadless = watch("UseRemoteHeadless");

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
              <span>
                <T _str="Select the language you want." _tags={transifexTags} />
              </span>
              <Controller
                name="Locale"
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    {languages.map(({ code, localized_name }) => (
                      <SelectOption key={code} value={code}>
                        {localized_name}
                      </SelectOption>
                    ))}
                  </Select>
                )}
              />
              <GroupTitle>
                <T _str="Connection" _tags={transifexTags} />
              </GroupTitle>
              <Checkbox {...register("UseRemoteHeadless")}>
                <T _str="Use Remote Headless" _tags={transifexTags} />
              </Checkbox>
              <GroupTitle>
                <T _str="Advanced" _tags={transifexTags} />
              </GroupTitle>
              <AdvancedAction
                icon={<DeleteIcon />}
                onClick={clearCache}
                text={t("Clear Cache")}
              />
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
              <AdvancedAction
                icon={<UpdateIcon />}
                onClick={handleLauncherUpdate}
                text={t("Manual Launcher Update")}
              />
              <AdvancedAction
                icon={<UpdateIcon />}
                onClick={handlePlayerUpdate}
                text={t("Manual Player Update")}
              />
            </FormSection>
            <FormSection>
              <GroupTitle>
                <T _str="Root chain path" _tags={transifexTags} />
              </GroupTitle>
              <span>
                <T
                  _str="Path where game chain data is stored."
                  _tags={transifexTags}
                />
              </span>
              <FolderChooser
                control={control}
                name="BlockchainStoreDirParent"
              />

              <GroupTitle>
                <T _str="Chain store directory name" _tags={transifexTags} />
              </GroupTitle>
              <TextField
                label={t("Chain store directory name")}
                readOnly
                {...register("BlockchainStoreDirName")}
              />

              <GroupTitle>
                <T _str="Send Information" _tags={transifexTags} />
              </GroupTitle>
              <Checkbox {...register("Mixpanel")}>
                <T
                  _str="Send anonymous usage information"
                  _tags={transifexTags}
                />
              </Checkbox>
              <Checkbox {...register("Sentry")}>
                <T _str="Report errors and bugs" _tags={transifexTags} />
              </Checkbox>

              <GroupTitle>
                <T _str="Debugging" _tags={transifexTags} />
              </GroupTitle>
              <Checkbox {...register("PreferLegacyInterface")}>
                <T _str="Use Legacy Interface" _tags={transifexTags} />
              </Checkbox>
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
    </OverlayBase>
  );
}

export default observer(SettingsOverlay);

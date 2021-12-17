import React, { useCallback, useEffect } from "react";
import { observer } from "mobx-react";
import { motion } from "framer-motion";
import { styled } from "src/v2/stitches.config";
import { useLanguages } from "@transifex/react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { configStore, userConfigStore } from "src/config";
import type { IConfig } from "src/interfaces/config";
import { useStore } from "src/v2/utils/useStore";
import { T } from "src/renderer/i18n";

import H1 from "src/v2/components/ui/H1";
import TextField from "src/v2/components/ui/TextField";
import { Select, SelectOption } from "src/v2/components/ui/Select";
import FolderChooser from "./FolderChooser";
import { t } from "@transifex/native";
import Button from "src/v2/components/ui/Button";
import OverlayBase from "src/v2/components/core/OverlayBase";
import Checkbox from "src/v2/components/ui/Checkbox";

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
const app = require("electron").remote.app;

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsOverlay({ onClose, isOpen }: SettingsOverlayProps) {
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
    [isDirty, dirtyFields]
  );

  const onError = useCallback((errors: FieldErrors<IConfig>) => {
    if (Object.keys(errors).length === 0) return;
  }, []);

  useEffect(
    () => () => void handleSubmit(onSubmit, onError)(), // Submit a form when exits.
    []
  );

  return (
    <OverlayBase isOpen={isOpen} onDismiss={onClose}>
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
          <FolderChooser control={control} name="BlockchainStoreDirParent" />

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
            <T _str="Send anonymous usage information" _tags={transifexTags} />
          </Checkbox>
          <Checkbox {...register("Sentry")}>
            <T _str="Report errors and bugs" _tags={transifexTags} />
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
    </OverlayBase>
  );
}

export default observer(SettingsOverlay);

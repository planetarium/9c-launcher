import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogLabel,
  AlertDialogOverlay,
} from "@reach/alert-dialog";
import { styled } from "src/renderer/stitches.config";

import dialogBackground from "src/renderer/resources/collection/popup.png";
import migrationBackground from "src/renderer/resources/collection/popup-m.png";
import primaryButton from "src/renderer/resources/collection/button-ok.png";
import primaryButtonHover from "src/renderer/resources/collection/button-ok-over.png";
import secondaryButton from "src/renderer/resources/collection/button-cancel-2.png";
import secondaryButtonHover from "src/renderer/resources/collection/button-cancel-2-over.png";
import infoIcon from "src/renderer/resources/collection/mark-information.png";
import React, { useRef } from "react";
import { T } from "@transifex/react";
import { VisuallyHidden } from "@reach/visually-hidden";

export const AlertBackdrop = styled(AlertDialogOverlay, {
  zIndex: 3,
});

export const AlertBase = styled(AlertDialogContent, {
  "&&": {
    width: 528,
    height: 333,
    padding: "2rem",
    boxSizing: "border-box",
    backgroundImage: `url(${dialogBackground})`,
    backgroundColor: "transparent",
    fontFamily: "Montserrat",

    display: "flex",
    flexDirection: "column",
  },
});

export const AlertHeader = styled("header", {
  height: "80px",
  "> img": {
    display: "block",
    margin: "-20px auto -10px",
  },
});

export const AlertTitle = styled(AlertDialogLabel, {
  color: "#fefebf",
  textShadow: "0px 2px 2px rgba(0, 0, 0, 0.5)",
  fontWeight: "bold",
  textAlign: "center",
  fontSize: 20,
});

export const AlertDescription = styled(AlertDialogDescription, {
  marginTop: "auto",
  color: "#ebceb1",
  textShadow: "0px 2px 2px rgba(0, 0, 0, 0.5)",
  textAlign: "center",
  fontSize: 18,
});

export const AlertButtonBar = styled("div", {
  marginTop: "auto",
  textAlign: "center",
});

export const AlertButton = styled("button", {
  appearance: "none",
  all: "unset",
  width: 208,
  height: 58,
  backgroundImage: `url(${secondaryButton})`,
  transition: "background-image 0.2s ease-in-out",
  textAlign: "center",
  fontSize: 24,
  fontWeight: "bold",
  color: "#e3ad67",

  "&:hover": {
    backgroundImage: `url(${secondaryButtonHover})`,
  },

  variants: {
    variant: {
      primary: {
        backgroundImage: `url(${primaryButton})`,
        color: "#38261a",
        "&:hover": {
          backgroundImage: `url(${primaryButtonHover})`,
        },
      },
    },
    wide: {
      true: {
        width: 333,
        backgroundSize: "333px 100%",
      },
    },
  },
});

interface AlertProps {
  onCancel?(): void;
  onConfirm(): void;
  children: React.ReactNode;
  title: React.ReactNode;
  isOpen?: boolean;
}

export function Alert({
  onCancel,
  onConfirm,
  children,
  title,
  isOpen,
}: AlertProps) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <AlertBackdrop
      leastDestructiveRef={ref}
      onDismiss={onCancel}
      isOpen={isOpen}
    >
      <AlertBase>
        <AlertHeader>
          <img src={infoIcon} />
          <AlertTitle>{title}</AlertTitle>
        </AlertHeader>
        <AlertDescription>{children}</AlertDescription>
        <AlertButtonBar>
          {onCancel && (
            <AlertButton onClick={onCancel} ref={ref}>
              <T _str="Cancel" _tags="v2/collection/alert" />
            </AlertButton>
          )}
          <AlertButton onClick={onConfirm} variant="primary">
            <T _str="OK" _tags="v2/collection/alert" />
          </AlertButton>
        </AlertButtonBar>
      </AlertBase>
    </AlertBackdrop>
  );
}

export const MigrationAlertBase = styled(AlertDialogContent, {
  "&&": {
    width: 728,
    height: 433,
    padding: "2rem",
    boxSizing: "border-box",
    backgroundImage: `url(${migrationBackground})`,
    backgroundColor: "transparent",
    fontFamily: "Montserrat",

    display: "flex",
    flexDirection: "column",
  },
});

export const MigrationAlertHeader = styled("header", {
  height: 110,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridTemplateRows: "36px 1fr",
  gridAutoFlow: "column",
  columnGap: "1rem",
  rowGap: 5,
  padding: "0 50px",
  marginTop: -10,
});

export const MigrationAlertItemTitle = styled("h2", {
  fontSize: 16,
  color: "#e3ad67",
  fontWeight: "bold",
  textAlign: "center",
});

export const MigrationAlertItemDetails = styled("div", {
  boxShadow: "inset 0px 4px 7px 0 rgba(39, 21, 12, 0.8)",
  backgroundColor: "rgba(39, 21, 12, 0.8)",
  borderRadius: 10,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  color: "#fff6b9",
  fontSize: 18,
  fontWeight: "bold",
  "& img": {
    height: "1em",
    marginRight: "0.5em",
    verticalAlign: "sub",
  },
  "& strong": {
    fontSize: 30,
  },
});

interface MigrationAlertItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

export function MigrationAlertItem({
  title,
  children,
}: MigrationAlertItemProps) {
  return (
    <>
      <MigrationAlertItemTitle>{title}</MigrationAlertItemTitle>
      <MigrationAlertItemDetails>{children}</MigrationAlertItemDetails>
    </>
  );
}
interface MigrationAlertProps extends Omit<AlertProps, "title"> {
  isClaimable: boolean;
  items: React.ReactNode | React.ReactNode[];
}

export function MigrationAlert({
  onCancel,
  onConfirm,
  children,
  items,
  isClaimable,
  isOpen,
}: MigrationAlertProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertBackdrop
      leastDestructiveRef={buttonRef}
      onDismiss={onCancel}
      isOpen={isOpen}
    >
      <MigrationAlertBase>
        <VisuallyHidden>
          <AlertDialogLabel>Migration</AlertDialogLabel>
        </VisuallyHidden>
        <MigrationAlertHeader>{items}</MigrationAlertHeader>
        <AlertDescription>{children}</AlertDescription>
        <AlertButtonBar>
          <AlertButton
            ref={buttonRef}
            onClick={onConfirm}
            variant="primary"
            wide={isClaimable}
          >
            {isClaimable ? (
              <T _str="Claim & Migrate" _tags="v2/collection/migration" />
            ) : (
              <T _str="Migrate" _tags="v2/collection/migration" />
            )}
          </AlertButton>
        </AlertButtonBar>
      </MigrationAlertBase>
    </AlertBackdrop>
  );
}

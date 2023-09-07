import React, { MouseEvent, useCallback } from "react";
import FileCopyIcon from "@material-ui/icons/FileCopy";

interface StakeStatusButtonProps {
  onClick: () => void;
}

export function StakeStatusButton({ onClick }: StakeStatusButtonProps) {
  const eventListener = useCallback<(e: MouseEvent) => void>(
    (e) => {
      e.stopPropagation();
      onClick();
    },
    [onClick],
  );

  return <FileCopyIcon onClick={eventListener} />;
}

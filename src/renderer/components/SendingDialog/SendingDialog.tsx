import { Button, Dialog, styled, Typography } from "@material-ui/core";
import { T } from "@transifex/react";
import React from "react";

export type Props = {
  open: boolean;
  onDetailedView: () => void;
};

const DetailButton = styled(Button)({
  width: "234px",
  height: "60px",
  fontFamily: "Montserrat",
});

const SendingMessage = styled(Typography)({
  fontFamily: "Montserrat",
  textAlign: "center",
  padding: "10px",
  fontWeight: "bold",
  fontSize: "32px",
  color: "#fff",
});

const transifexTags = "Transfer/Components/SendingDialog";

const SendingDialog: React.FC<Props> = (props: Props) => {
  const { open, onDetailedView } = props;

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      aria-labelledby="renew-dialog-title"
      open={open}
      PaperProps={{
        style: {
          backgroundColor: "transparent",
          boxShadow: "none",
          maxWidth: "770px",
          height: "150px",
        },
      }}
    >
      <div>
        <SendingMessage>
          <T _str="Sending..." _tags={transifexTags} />
        </SendingMessage>
        <div>
          <DetailButton onClick={onDetailedView} variant="contained">
            <T _str="Open Detailed View" _tags={transifexTags} />
          </DetailButton>
        </div>
      </div>
    </Dialog>
  );
};

export default SendingDialog;

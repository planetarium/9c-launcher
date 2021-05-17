import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import React from "react";

import './CharSelectDialog.scss'

export type Props = {
  onClick: (avatarAddress: string) => void;
  avatar: { address: string; name: string }[];
};

const charSelectDialogStyle = makeStyles({
  radioGroup: {
    width: "400px",
    height: "250px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-left",
  },
  button: {
    width: "300px",
  }
});

const CharSelectDialog: React.FC<Props> = (props: Props) => {
  const { onClick, avatar } = props;
  const [avatarAddress, setAvatarAddress] = React.useState(avatar[0].address);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarAddress((event.target as HTMLInputElement).value);
  };

  const classes = charSelectDialogStyle();

  return (
    <div className={'CharSelectDialogContainer'}>
      <FormControl component="fieldset">
        <div className={'CharSelectDialogTitle'}>Select Character</div>
        <RadioGroup
          aria-label="avatar"
          name="avatar1"
          value={avatarAddress}
          onChange={handleChange}
          className={classes.radioGroup}
        >
          {avatar.map((x) => (
            <FormControlLabel
              value={x.address}
              control={<Radio />}
              label={x.name}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <Button
      className={classes.button}
        color="primary"
        variant="contained"
        fullWidth
        onClick={() => onClick(avatarAddress)}
      >
        Send
      </Button>
    </div>
  );
};

export default CharSelectDialog;

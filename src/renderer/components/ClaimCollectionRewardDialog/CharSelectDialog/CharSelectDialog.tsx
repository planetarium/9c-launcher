import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import React from "react";

import './CharSelectDialog.scss'

export type Props = {
  onClick: (avatarAddress: string) => void;
  avatar: { address: string; name: string }[];
};

const CharSelectDialog: React.FC<Props> = (props: Props) => {
  const { onClick, avatar } = props;
  const [avatarAddress, setAvatarAddress] = React.useState(avatar[0].address);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarAddress((event.target as HTMLInputElement).value);
  };

  return (
    <div className={'CharSelectDialogContainer'}>
      <FormControl component="fieldset">
        <FormLabel component="legend">Select Character</FormLabel>
        <RadioGroup
          aria-label="avatar"
          name="avatar1"
          value={avatarAddress}
          onChange={handleChange}
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

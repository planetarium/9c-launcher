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
import { getRemain } from "src/v2/utils/monsterCollection/utils";

import "./CharSelectDialog.scss";

export type Props = {
  onClick: (avatarAddress: string) => void;
  avatar: { address: string; name: string; updatedAt: number }[];
  tip: number;
};

const charSelectDialogStyle = makeStyles({
  radioGroup: {
    width: "400px",
    height: "250px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-left",
  },
  radio: {
    "&$checked": {
      color: "#74f4bc",
    },
    color: "#FFFFFF",
  },
  checked: {},
  button: {
    width: "189px",
    height: "48px",
    fontWeight: "bold",
    fontSize: "larger",
    borderRadius: "0",
  },
});

const CharSelectDialog: React.FC<Props> = (props: Props) => {
  const { onClick, tip, avatar } = props;
  const [avatarAddress, setAvatarAddress] = React.useState(avatar[0].address);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarAddress((event.target as HTMLInputElement).value);
  };

  const classes = charSelectDialogStyle();
  console.log(
    avatar.forEach((x) => {
      console.log(`address: ${x.address} updateAt: ${x.updatedAt}`);
    })
  );

  return (
    <div className={"CharSelectDialogContainer"}>
      <FormControl component="fieldset">
        <div className={"CharSelectDialogTitle"}>Select Character</div>
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
              control={
                <Radio
                  classes={{ root: classes.radio, checked: classes.checked }}
                />
              }
              label={`${x.name} #${x.address.substring(
                2,
                6
              )} \n Latest login at: ${getRemain((tip - x.updatedAt) / 5)}`}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <div className={"CharSelectDialogButtonPos"}>
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
    </div>
  );
};

export default CharSelectDialog;

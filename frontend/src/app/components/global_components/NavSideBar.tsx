import { Grid, IconButton, Typography } from "@mui/material";
import Link from "next/link";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIcon from "@mui/icons-material/Phone";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";

type Props = {
  toggleSideBar: () => void;
};

const NavSideBar = ({ toggleSideBar }: Props) => {
  return (
    <Grid container>
      <Grid id="side_bar_header">
        <Grid>
          <SportsEsportsRoundedIcon />
          <Typography component={"p"}>Game Hub</Typography>
        </Grid>
        <IconButton
          id="close_side_bar_btn"
          onClick={() => {
            toggleSideBar();
          }}
        >
          <CloseIcon />
        </IconButton>
      </Grid>
      <Grid id="side_bar_content">
        <Grid>
          <Link
            href="/"
            passHref
            onClick={() => {
              toggleSideBar();
            }}
          >
            <HomeIcon />
            <Typography component="p">Home</Typography>
          </Link>
        </Grid>
        <Grid>
          <Link
            href="/games"
            passHref
            onClick={() => {
              toggleSideBar();
            }}
          >
            <SportsEsportsRoundedIcon />
            <Typography component="p">Games</Typography>
          </Link>
        </Grid>
        <Grid>
          <Link
            href="/forum"
            passHref
            onClick={() => {
              toggleSideBar();
            }}
          >
            <Diversity3Icon />
            <Typography component="p">Forum</Typography>
          </Link>
        </Grid>
        <Grid>
          <Link
            href="#"
            passHref
            onClick={() => {
              toggleSideBar();
            }}
          >
            <PhoneIcon />
            <Typography component="p">Contact Us</Typography>
          </Link>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default NavSideBar;

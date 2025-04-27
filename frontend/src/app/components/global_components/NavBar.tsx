import { Grid, Typography } from "@mui/material";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import dynamic from "next/dynamic";
import Link from "next/link";

const ProfileSection = dynamic(() => import("./ProfileSection"), {
  ssr: !!false,
});
const ToggleSideBarBtn = dynamic(() => import("./ToggleSideBarBtn"), {
  ssr: !!false,
});

const NavBar = () => {
  const atHome = true;
  return (
    <>
      <Grid container id="nav">
        <Link
          href="/"
          className="main_nav_logo_container main_nav_logo_container2"
          passHref
        >
          <SportsEsportsRoundedIcon />
          <Typography component={"p"}>Game Hub</Typography>
        </Link>

        <Grid container id="side_nav_container">
          <ToggleSideBarBtn />
        </Grid>

        <Link href="/" className="main_nav_logo_container" passHref>
          <SportsEsportsRoundedIcon />
          <Typography component={"p"}>Game Hub</Typography>
        </Link>

        <Grid container id="nav_link_container">
          <Grid component="div">
            <Link href="/" passHref>
              <Grid component="div">
                <Typography component="p">Home</Typography>
              </Grid>
            </Link>
          </Grid>
          <Grid component="div">
            <Link href="/games" passHref>
              <Grid component="div">
                <Typography component="p">Games</Typography>
              </Grid>
            </Link>
          </Grid>
          <Grid component="div">
            <Link href="/forum" passHref>
              <Grid component="div">
                <Typography component="p">Forum</Typography>
              </Grid>
            </Link>
          </Grid>
          <Grid component="div">
            <Link href="#" passHref>
              <Grid component="div">
                <Typography component="p">Contact Us</Typography>
              </Grid>
            </Link>
          </Grid>
        </Grid>
        <Grid id="nav_profile_section">
          <ProfileSection />
        </Grid>
      </Grid>
    </>
  );
};

export default NavBar;

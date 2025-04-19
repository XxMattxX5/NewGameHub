import React from "react";
import { Grid, Typography, Button, TextField } from "@mui/material";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import Link from "next/link";

export default function Footer() {
  return (
    <Grid container id="footer_container">
      <Grid id="footer_backtotop_container">
        <Button>Back To Top</Button>
      </Grid>
      <Grid id="footer_content">
        <Grid className="footer_column">
          <Grid id="footer_logo_container">
            <SportsEsportsRoundedIcon />
            <Typography component={"p"}>Game Hub</Typography>
          </Grid>
        </Grid>
        <Grid className="footer_column" id="footer_promotion_column">
          <Grid>
            <Typography component={"p"}>
              Enter your mail to keep up to date on the latest gaming news.
            </Typography>
            <Grid id="footer_promotion_signup_container">
              <TextField
                size="small"
                placeholder="Enter your email"
                fullWidth
              />
              <Button>Sign Up</Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid className="footer_column" id="footer_social_media">
          <Grid id="footer_social_media_container">
            <Typography component={"p"}>Follow Us</Typography>
            <Grid id="footer_social_media_links">
              <Grid id="footer_facebook">
                <Link href="facebook.com">
                  <FacebookIcon />
                </Link>
              </Grid>
              <Grid id="footer_twitter">
                <Link href="twitter.com">
                  <XIcon />
                </Link>
              </Grid>
              <Grid id="footer_instagram">
                <Link href="instagram.com">
                  <InstagramIcon />
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid className="footer_column" id="footer_call">
          <Grid>
            <Typography component={"p"}>Call Us</Typography>
            <Typography component={"p"}>770-777-7777</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

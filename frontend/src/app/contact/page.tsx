import React from "react";
import { Metadata } from "next";
import { Grid, Typography } from "@mui/material";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactForm from "../components/global_components/ContactForm";

export const metadata: Metadata = {
  title: "Game Hub - Contact Us",
  description:
    "Get in touch with the Game Hub team. Whether you have questions, feedback, or need support, we're here to help you with all things gaming.",
};

const page = () => {
  return (
    <Grid id="contact_page_main_container">
      <Grid>
        <Typography component={"h1"}>Contact Us</Typography>
        <Grid id="contact_page_content_container">
          <Grid id="contact_page_contact_info_container">
            <Typography component={"h2"}>Our Contact Information</Typography>
            <Grid className="contact_page_info_box">
              <Typography component={"h3"}>Give Us a Call!</Typography>
              <Grid>
                <LocalPhoneIcon />
                <Typography component={"p"}>770-743-8663</Typography>
              </Grid>
            </Grid>
            <Grid className="contact_page_info_box">
              <Typography component={"h3"}>Send Us an Email!</Typography>
              <Grid>
                <MailOutlineIcon />
                <Typography component={"p"}>
                  matthewhicks8070@gmail.com
                </Typography>
              </Grid>
            </Grid>
            <Grid className="contact_page_info_box">
              <Typography component={"h3"}>Our Location</Typography>
              <Grid>
                <LocationOnIcon />
                <Typography component={"p"}>
                  852 Magnolia Park Drive Atlanta, GA 30303 United States
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid id="contact_page_contact_form_container">
            <ContactForm />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default page;

"use client";
import React, { useState } from "react";
import { Grid, TextField, MenuItem, Button } from "@mui/material";
import { useTheme } from "./ThemeProvider";

const ContactForm = () => {
  const { theme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subject, setSubject] = useState("select");
  const [content, setContent] = useState("");

  const subjectList = [
    { value: "select", label: "Select" },
    { value: "support", label: "Support" },
    { value: "suggestion", label: "Site Suggestion" },
  ];

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
  };
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  return (
    <Grid id="contact_page_form">
      <TextField
        fullWidth
        placeholder="Enter your full name"
        value={fullName}
        onChange={handleFullNameChange}
      ></TextField>
      <TextField
        fullWidth
        placeholder="Enter your email"
        value={email}
        onChange={handleEmailChange}
      ></TextField>
      <TextField
        fullWidth
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
      ></TextField>
      <TextField
        select
        onChange={handleSubjectChange}
        value={subject}
        fullWidth
      >
        {subjectList.map((subj) => (
          <MenuItem key={subj.value} value={subj.value}>
            {subj.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        value={content}
        multiline
        rows={5}
        placeholder="Enter your message"
        onChange={handleContentChange}
      />
      <Button
        sx={{
          backgroundColor: theme === "dark" ? "var(--gray2)" : "#cacaca",
          color: theme === "dark" ? "white" : "inherit",
        }}
      >
        Send Email
      </Button>
    </Grid>
  );
};

export default ContactForm;

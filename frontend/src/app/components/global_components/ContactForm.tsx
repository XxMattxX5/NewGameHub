"use client";
import React, { useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Collapse,
  Alert,
} from "@mui/material";
import { useTheme } from "./ThemeProvider";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "@/app/hooks/useAuth";
import { EmailFormField } from "@/app/types";

const ContactForm = () => {
  const { theme } = useTheme();
  const { csrfToken } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subject, setSubject] = useState("select");
  const [content, setContent] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const [formErrors, setFormErrors] = useState<EmailFormField>({
    full_name: "",
    email: "",
    phone_number: "",
    subject: "",
    content: "",
  });

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

  const sendEmail = () => {
    if (subject === "select") {
      setFormErrors((prev) => ({ ...prev, subject: "Must select subject" }));
      return;
    }
    const headers = {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    };

    setSendingEmail(true);

    fetch("/api/contact/email/", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        subject: subject,
        content: content,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setFullName("");
          setEmail("");
          setPhoneNumber("");
          setSubject("select");
          setContent("");
          alert("Email was sent Successfully");
        } else if (res.status === 400) {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          setFormErrors({
            full_name: data.full_name ? data.full_name[0] : "",
            email: data.email ? data.email[0] : "",
            phone_number: data.phone_number ? data.phone_number[0] : "",
            subject: data.subject ? data.subject[0] : "",
            content: data.content ? data.content[0] : "",
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      })
      .finally(() => {
        setSendingEmail(false);
      });
  };

  return (
    <Grid id="contact_page_form">
      <TextField
        fullWidth
        placeholder="Enter your full name"
        value={fullName}
        onChange={handleFullNameChange}
        className="contact_email_inputs"
      />
      <Collapse in={formErrors.full_name ? true : false}>
        <Alert
          sx={{ marginBottom: "15px" }}
          severity="error"
          onClose={() => setFormErrors((prev) => ({ ...prev, full_name: "" }))}
        >
          {formErrors.full_name}
        </Alert>
      </Collapse>
      <TextField
        fullWidth
        placeholder="Enter your email"
        value={email}
        onChange={handleEmailChange}
        className="contact_email_inputs"
      />
      <Collapse in={formErrors.email ? true : false}>
        <Alert
          sx={{ marginBottom: "15px" }}
          severity="error"
          onClose={() => setFormErrors((prev) => ({ ...prev, email: "" }))}
        >
          {formErrors.email}
        </Alert>
      </Collapse>
      <TextField
        fullWidth
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        className="contact_email_inputs"
      />
      <Collapse in={formErrors.phone_number ? true : false}>
        <Alert
          sx={{ marginBottom: "15px" }}
          severity="error"
          onClose={() =>
            setFormErrors((prev) => ({ ...prev, phone_number: "" }))
          }
        >
          {formErrors.phone_number}
        </Alert>
      </Collapse>
      <TextField
        select
        onChange={handleSubjectChange}
        value={subject}
        fullWidth
        className="contact_email_inputs"
      >
        {subjectList.map((subj) => (
          <MenuItem key={subj.value} value={subj.value}>
            {subj.label}
          </MenuItem>
        ))}
      </TextField>
      <Collapse in={formErrors.subject ? true : false}>
        <Alert
          sx={{ marginBottom: "15px" }}
          severity="error"
          onClose={() => setFormErrors((prev) => ({ ...prev, subject: "" }))}
        >
          {formErrors.subject}
        </Alert>
      </Collapse>
      <TextField
        fullWidth
        value={content}
        multiline
        rows={5}
        placeholder="Enter your message"
        onChange={handleContentChange}
        className="contact_email_inputs"
      />
      <Collapse in={formErrors.content ? true : false}>
        <Alert
          sx={{ marginBottom: "15px" }}
          severity="error"
          onClose={() => setFormErrors((prev) => ({ ...prev, content: "" }))}
        >
          {formErrors.content}
        </Alert>
      </Collapse>
      <Button
        onClick={sendEmail}
        disabled={sendingEmail ? true : false}
        sx={{
          backgroundColor: theme === "dark" ? "var(--gray2)" : "#cacaca",
          color: theme === "dark" ? "white" : "inherit",
        }}
      >
        {sendingEmail ? <LoadingSpinner spinnerSize={25} /> : "Send Email"}
      </Button>
    </Grid>
  );
};

export default ContactForm;

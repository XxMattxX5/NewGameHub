from django import forms
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import re
from django.core.validators import RegexValidator

# Password validation function
def validate_password(password):
    errors = []

    # Check if password is at least 8 characters long
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")

    # Check if password contains at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter.")

    # Check if password contains at least one special character
    if not re.search(r'[!@#$%^&*]', password):
        errors.append("Password must contain at least one special character.")

    if errors:
        raise ValidationError(errors)
    return password

# Form for registering new users and validating their inputs
class UserRegistrationForm(forms.Form):
    username = forms.CharField(max_length=30, required=True)
    full_name = forms.CharField(max_length=150, required=True)
    email = forms.EmailField(required=True)
    password = forms.CharField(widget=forms.PasswordInput, max_length=40, required=True)
    password_confirm = forms.CharField(widget=forms.PasswordInput, max_length=40, required=True)

    def clean_username(self):
        """
        Valides the "username" field from the form

        Ensures that username is not already in use by a different user
        Ensures that the username is at least 3 characters long

        Raises:
            ValidationError: If username is already in use by another user.
            ValidationError: If the username is shorter than 3 characters.
        """
        username = self.cleaned_data.get('username').lower()

        # Ensures that username is not already in use by a different user 
        # and username is at least 3 characters long
        if User.objects.filter(username=username).exists():
            raise ValidationError("Username already exists")
        elif (len(username) < 3):
            raise ValidationError("Username Must be At Least 3 Characters")
        
        return username

    def clean_full_name(self):
        """
        Validates the 'full_name' field from the form.

        Ensures that the full name is at least 3 characters long.
        
        Raises:
            ValidationError: If the name is shorter than 3 characters.
        """
        full_name = self.cleaned_data.get("full_name")

        # Ensure the full name has at least 3 characters
        if (len(full_name) < 3):
            raise ValidationError("Name Must be At Least 3 Characters")
        
        return full_name


    def clean_password(self):
        """
        Validates the 'password' field from the form.

        Ensures password is at least 8 characters long
        Ensures password contains at least 1 capital letter
        Ensures password contains at least 1 special character
        
        Raises:
            ValidationError: If password is shorter then 8 characters.
            ValidationError: If password doesn't have a capital letter.
            ValidationError: If password doesn't have a special character.
        """
        password = self.cleaned_data.get("password")

        # Validate the password using the custom function
        validate_password(password) 

        return password

    def clean_email(self):
        """
        Validates the 'email' field from the form.

        Ensures that email enter by the user is valid
        
        Raises:
            ValidationError: If the email fails the built in django email validation.
        """
        email = self.cleaned_data.get('email', '').strip()

        try:
            validate_email(email)
        except ValidationError:
            raise forms.ValidationError("Enter a valid email address.")
        
        return email

    def clean(self):
        """
        Validates the 'password_confirm' field from the form.

        Ensures that the password_confirm matches the "password" field
        
        Raises:
            ValidationError: If password_confirm doesn't match the password.
        """
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password_confirm = cleaned_data.get('password_confirm')

        # Ensures password_confirm and password fields match
        if password != password_confirm:
            self.add_error('password_confirm', 'Passwords do not match')

        return cleaned_data
    

class ContactForm(forms.Form):
    full_name = forms.CharField(required=True)
    email = forms.EmailField(required=True)
    phone_number = forms.CharField(
        required=True,
        validators=[
            RegexValidator(
                regex=r'^\+?\d{10,15}$',
                message="Enter a valid phone number (10-15 digits, optionally starting with +)."
            )
        ]
    )
    subject = forms.CharField(required=True)
    content = forms.CharField(required=True)
from django import forms
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import re

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

class UserRegistrationForm(forms.Form):
    username = forms.CharField(max_length=30, required=True)
    email = forms.EmailField(required=True)
    password = forms.CharField(widget=forms.PasswordInput, max_length=40, required=True)
    password_confirm = forms.CharField(widget=forms.PasswordInput, max_length=40, required=True)

    def clean_username(self):
        username = self.cleaned_data.get('username').lower()

        if User.objects.filter(username=username).exists():
            raise ValidationError("Username already exists")
        elif (len(username) < 3):
            raise ValidationError("Username Must be At Least 3 Characters")
        
        return username

    def clean_password(self):
        password = self.cleaned_data.get("password")
        validate_password(password)  # Validate the password using the custom function
        return password

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("Email already in use")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password_confirm = cleaned_data.get('password_confirm')

        if password != password_confirm:
            self.add_error('password_confirm', 'Passwords do not match')

        return cleaned_data
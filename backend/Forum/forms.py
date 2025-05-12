from django import forms
from django.core.exceptions import ValidationError
from django.core.files.images import get_image_dimensions
from GameHub.models import Game
from .models import Comment

from PIL import Image
from io import BytesIO
import base64
from django.core.files.base import ContentFile
import uuid
from lxml import html
import re


MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2 MB in bytes
MAX_TITLE_LENGTH = 100
MIN_TITLE_LENGTH = 3



ALLOWED_TAGS = {'p', 'b', 'i', 'ul', 'ol', 'li', 'a', 'img', 'span'}
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'width', 'height'],
    'span': ['style'],
}
ALLOWED_STYLES = {'font-size', 'font-family', 'color', 'text-align'}
STYLE_REGEX = re.compile(r'([\w\-]+)\s*:\s*([^;]+)')

def clean_style(style_str):
    """
    Cleans a CSS style string by filtering out disallowed style properties.

    Args:
        style_str (str): A string of inline CSS styles (e.g., "color: red; font-size: 12px;").

    Returns:
        str: A sanitized string containing only the allowed CSS styles, formatted as "prop: value" pairs 
             separated by semicolons. Returns an empty string if no allowed styles are present.
    """
    cleaned_styles = []
    for match in STYLE_REGEX.finditer(style_str):
        prop, value = match.groups()
        if prop.strip() in ALLOWED_STYLES:
            cleaned_styles.append(f"{prop.strip()}: {value.strip()}")
    return "; ".join(cleaned_styles)

def sanitize_html(input_html):
    """
    Sanitizes an HTML string by removing disallowed tags and attributes, and cleaning inline styles.

    Args:
        input_html (str): The raw HTML string to sanitize.

    Returns:
        str: A sanitized HTML string that contains only allowed tags and attributes, with cleaned inline styles.
             The result excludes the temporary wrapper div used during processing.
    """
    wrapper = html.fragment_fromstring(f"<div>{input_html}</div>", create_parent=False)

    for el in wrapper.iterdescendants():
        if el.tag not in ALLOWED_TAGS:
            el.drop_tag()
            continue

        # Clean attributes safely
        cleaned_attribs = {}
        allowed = ALLOWED_ATTRIBUTES.get(el.tag, [])
        for attr, value in el.attrib.items():
            if attr in allowed:
                if attr == "style":
                    cleaned_style = clean_style(value)
                    if cleaned_style:
                        cleaned_attribs["style"] = cleaned_style
                else:
                    cleaned_attribs[attr] = value
        el.attrib.clear()
        el.attrib.update(cleaned_attribs)

    # Return the sanitized HTML inside the wrapper
    return html.tostring(wrapper, encoding='unicode', method='html')[5:-6]  # Strip <div> wrapper



class PostForm(forms.Form):
    """
    A Django form for creating or validating post submissions, supporting text, base64 images, 
    and optional game references.

    Fields:
        type (ChoiceField): Indicates the type of post, either 'general' or 'game'.
        title (CharField): The title of the post with length restrictions.
        game_id (IntegerField): Optional game reference by ID, must exist in the database if provided.
        image (CharField): An optional base64-encoded image.
        content (CharField): Optional HTML content submitted from a rich text editor.

    Validation:
        - Ensures game_id references an existing Game if provided.
        - Validates base64 image format, size (max 2MB), and dimensions (200x200px–1200x1200px).
        - Sanitizes the HTML content.
        - Requires content of at least 10 characters if image is not provided.
    """
    TYPE_CHOICES = [
        ('general', 'General'),
        ('game', 'Game'),
    ]
    
    type = forms.ChoiceField(choices=TYPE_CHOICES)
    
    # Title field with a minimum length of 3 characters and a maximum length of 100 characters
    title = forms.CharField(
        min_length=MIN_TITLE_LENGTH,
        max_length=MAX_TITLE_LENGTH,
        required=True,
        error_messages={
            'min_length': f'Title must be at least {MIN_TITLE_LENGTH} characters long.',
            'max_length': f'Title cannot exceed {MAX_TITLE_LENGTH} characters.'
        }
    )

    # Game ID field (optional)
    game_id = forms.IntegerField(
        required=False,
        error_messages={
            'invalid': 'Please enter a valid Game ID.',
        }
    )
  
    # Image field, now checking for base64 string
    image = forms.CharField(
        required=False,  # Image is optional now as it's base64
    )
    
    # Content field to receive Tiptap HTML content
    content = forms.CharField(
        required=False,
    )

    def clean_game_id(self):
        """
        Validates the game_id field to ensure the referenced Game exists.

        Returns:
            int: The validated game ID.

        Raises:
            ValidationError: If the game ID does not correspond to any existing Game.
        """
        game_id = self.cleaned_data.get('game_id')
        if game_id and not Game.objects.filter(id=game_id).exists():
            raise ValidationError('Game with this ID does not exist.')
        return game_id
    
    def clean_image(self):
        """
        Validates and decodes a base64-encoded image. Ensures format, size, and dimension constraints.

        Returns:
            ContentFile or str or None: A Django ContentFile if base64 is valid, or the original image value.

        Raises:
            ValidationError: If the image format is invalid, exceeds size, or violates dimension rules.
        """
        image = self.cleaned_data.get('image')

        if image and isinstance(image, str):
            if image.startswith('data:image'):
                try:
                    format, imgstr = image.split(';base64,')
                    ext = format.split('/')[-1]
                    decoded_image = base64.b64decode(imgstr)

                    # Validate size
                    if len(decoded_image) > MAX_IMAGE_SIZE:
                        raise ValidationError('Image file size exceeds 2MB.')

                    # Validate dimensions
                    img = Image.open(BytesIO(decoded_image))
                    width, height = img.size
                    
                    if width < 200 or height < 200:
                        raise ValidationError('Image is too small. Minimum dimensions are 200x200px.')
                    if width > 1200 or height > 1200:
                        raise ValidationError('Image is too large. Maximum dimensions are 1200x1200px.')

                    # Return ContentFile
                    return ContentFile(decoded_image, name=f"{uuid.uuid4()}.{ext}")

                except Exception as e:
                    raise ValidationError(f"Invalid image data: {str(e)}")
            else:
                raise ValidationError("Image is not in valid base64 format.")

        return image  # already a file, or None

    def clean_content(self):
        """
        Sanitizes the HTML content field.

        Returns:
            str: The sanitized HTML content.

        Raises:
            ValidationError: If the sanitization process fails.
        """
        content = self.cleaned_data.get('content')

        if content:
            try:
                # Use the sanitizer to clean the content
                sanitized_content = sanitize_html(content)
                return sanitized_content
            except Exception as e:
                raise ValidationError(f"Error sanitizing content: {str(e)}")
        return content

    def clean(self):
        """
        Performs final validation on the form. Ensures that either valid content or a valid image is present.

        Returns:
            dict: The cleaned and validated form data.
        """
        cleaned_data = super().clean()
        image = cleaned_data.get('image')
        content = cleaned_data.get('content')

        # Skip base64 validation here — already done in clean_image()
        if not image and (not content or len(content.strip()) < 10):
            self.add_error('content', 'Content must be at least 10 characters long if no image is provided.')

        return cleaned_data


class CommentForm(forms.Form):
    """
    A simple form for submitting a comment.

    Fields:
        content (CharField): The body of the comment.

    Validation:
        - Trims the content and ensures it is not blank.
        - Sanitizes the content to remove unsafe HTML.
    """
    content = forms.CharField()

    def clean_content(self):
        """
        Validates and sanitizes the comment content.

        Returns:
            str: The sanitized and validated comment.

        Raises:
            ValidationError: If the content is blank or fails sanitization.
        """
        content = self.cleaned_data['content'].strip()
        if not content:
            raise forms.ValidationError("Comment cannot be blank.")
        content = sanitize_html(content)
        return content
    
class ReplyForm(forms.Form):
    """
    A form for submitting a reply to an existing comment.

    Fields:
        content (CharField): The body of the reply.
        comment_id (IntegerField): ID of the comment being replied to.

    Validation:
        - Ensures content is not blank and is sanitized.
        - Ensures the comment_id references an existing comment.
    """
    content = forms.CharField()
    comment_id = forms.IntegerField()

    def clean_content(self):
        """
        Validates and sanitizes the reply content.

        Returns:
            str: The sanitized reply content.

        Raises:
            ValidationError: If the content is blank or fails sanitization.
        """
        content = self.cleaned_data['content'].strip()
        if not content:
            raise forms.ValidationError("Comment cannot be blank.")
        content = sanitize_html(content)
        return content
    
    def clean_comment_id(self):
        """
        Validates that the comment_id corresponds to an existing comment.

        Returns:
            int: The validated comment ID.

        Raises:
            ValidationError: If no comment with the given ID exists.
        """
        comment_id = self.cleaned_data['comment_id']
        
        if not Comment.objects.filter(id=comment_id).exists():
            raise ValidationError("The specified comment does not exist.")
        return comment_id

    
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
# from html_sanitizer import Sanitizer
from lxml import html
import re


MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2 MB in bytes
MAX_TITLE_LENGTH = 100  # Maximum length for title
MIN_TITLE_LENGTH = 3  # Minimum length for title



ALLOWED_TAGS = {'p', 'b', 'i', 'ul', 'ol', 'li', 'a', 'img', 'span'}
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'width', 'height'],
    'span': ['style'],
}
ALLOWED_STYLES = {'font-size', 'font-family', 'color', 'text-align'}
STYLE_REGEX = re.compile(r'([\w\-]+)\s*:\s*([^;]+)')

def clean_style(style_str):
    cleaned_styles = []
    for match in STYLE_REGEX.finditer(style_str):
        prop, value = match.groups()
        if prop.strip() in ALLOWED_STYLES:
            cleaned_styles.append(f"{prop.strip()}: {value.strip()}")
    return "; ".join(cleaned_styles)

def sanitize_html(input_html):
    # Wrap in <div> to ensure consistent tree structure
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
    TYPE_CHOICES = [
        ('general', 'General'),
        ('game', 'Game'),
    ]
    
    type = forms.ChoiceField(choices=TYPE_CHOICES)
    
    # Title field with a minimum length of 3 characters and a maximum length of 100 characters
    title = forms.CharField(
        min_length=MIN_TITLE_LENGTH,
        max_length=MAX_TITLE_LENGTH,
        required=True,  # Title is required
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
        """Validate if the Game ID exists in the database, only if provided."""
        game_id = self.cleaned_data.get('game_id')
        if game_id and not Game.objects.filter(id=game_id).exists():
            raise ValidationError('Game with this ID does not exist.')
        return game_id
    
    def clean_image(self):
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
        cleaned_data = super().clean()
        image = cleaned_data.get('image')
        content = cleaned_data.get('content')

        # Skip base64 validation here — already done in clean_image()
        if not image and (not content or len(content.strip()) < 10):
            self.add_error('content', 'Content must be at least 10 characters long if no image is provided.')

        return cleaned_data


class CommentForm(forms.Form):
    content = forms.CharField()

    def clean_content(self):
        content = self.cleaned_data['content'].strip()
        if not content:
            raise forms.ValidationError("Comment cannot be blank.")
        content = sanitize_html(content)
        return content
    
class ReplyForm(forms.Form):
    content = forms.CharField()
    comment_id = forms.IntegerField()

    def clean_content(self):
        content = self.cleaned_data['content'].strip()
        if not content:
            raise forms.ValidationError("Comment cannot be blank.")
        content = sanitize_html(content)
        return content
    
    def clean_comment_id(self):
        comment_id = self.cleaned_data['comment_id']
        
        if not Comment.objects.filter(id=comment_id).exists():
            raise ValidationError("The specified comment does not exist.")
        return comment_id

    
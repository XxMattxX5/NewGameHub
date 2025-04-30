from django.core.exceptions import ValidationError
from PIL import Image

def validate_exact_dimensions(image):
    """
    Ensure the image is exactly 120x120 pixels.
    """
    try:
        img = Image.open(image)
        width, height = img.size
    except Exception:
        raise ValidationError("Uploaded file is not a valid image.")

    if width != 120 or height != 120:
        raise ValidationError("Image must be exactly 120x120 pixels.")

def validate_image_size(image):
    """
    Ensure the image size is below the set maximum (e.g., 2MB).
    """
    max_size_mb = 2
    if image.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Image file size must be under {max_size_mb}MB.")
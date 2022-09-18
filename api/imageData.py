from PIL import Image
from PIL.ExifTags import TAGS
def get_image_size(path):
    image = Image.open(path)
    width, height = image.size
    return (width, height)

def get_image_data(path):
    image = Image.open(path)
    try:
        dict = image.getexif()
    except AttributeError:
        return {}
    exif = {TAGS.get(key, key): dict[key] for key in dict}
    return exif

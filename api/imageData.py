from PIL import Image
def get_image_size(path):
    image = Image.open(path)
    width, height = image.size
    return (width, height)
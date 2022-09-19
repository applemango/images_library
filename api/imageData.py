from PIL import Image
from PIL.ExifTags import TAGS
import urllib
from urllib.error import HTTPError
from werkzeug.utils import secure_filename
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

def download(url = "",downloadFolder = "", filename = ""):
    if not url or not downloadFolder:
        return
    url, filename = (url, "{}/{}".format(downloadFolder,filename))
    opener=urllib.request.build_opener()  # type: ignore
    opener.addheaders=[('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36')]
    urllib.request.install_opener(opener)  # type: ignore
    try:
        urllib.request.urlretrieve(url, filename)  # type: ignore
    except:
        return "Error downloading ( 404 )"
    return "Success"
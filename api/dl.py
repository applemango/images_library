import timm
import urllib
from PIL import Image
from timm.data import resolve_data_config
from timm.data.transforms_factory import create_transform
import torch

def init_dl(path:str = "./contents/{}"):
    global model, config, transform, filepath
    filepath = path
    model = timm.create_model('adv_inception_v3', pretrained=True)
    model.eval()
    config = resolve_data_config({}, model=model)
    transform = create_transform(**config)

def get_prob(name):
    img = Image.open(filepath.format(name)).convert("RGB")
    tensor = transform(img).unsqueeze(0)  # type: ignore
    with torch.no_grad():
        out = model(tensor)
    probabilities = torch.nn.functional.softmax(out[0], dim=0)
    with open("imagenet_classes.txt", "r") as f:
        categories = [s.strip() for s in f.readlines()]
    top5_prob, top5_catid = torch.topk(probabilities, 5)
    return categories[top5_catid[0]]
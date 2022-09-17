from multiprocessing.dummy import Array
import os,json
from unicodedata import category
from flask import Flask,jsonify,request
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from flask_jwt_extended import get_current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required,JWTManager \
    ,get_jwt,get_jwt_identity,current_user,create_refresh_token
import random
from flask import send_from_directory
from werkzeug.utils import secure_filename
from sqlalchemy import desc

from imageData import get_image_size


from dl import init_dl, get_prob

basedir = os.path.abspath(os.path.dirname(__file__))
uploads_file_path = os.path.join(basedir, 'contents')
uploads_file_path = "A:\contents"

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])
app = Flask(__name__, instance_relative_config=True)
app.config.from_mapping(
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    ,SQLALCHEMY_TRACK_MODIFICATIONS = False
    ,SECRET_KEY = "secret"
    ,JWT_SECRET_KEY = "secret"
    ,JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=3)
    ,JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    ,JWT_TOKEN_LOCATION = "headers"

    ,JSON_AS_ASCII = False
)
cors = CORS(app, responses={r"/*": {"origins": "*"}})
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)
init_dl(uploads_file_path+"/{}")

class Images(db.Model):  # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(), nullable=False)
    path = db.Column(db.String(), nullable=False)
    extension = db.Column(db.String(255), default="")
    timestamp = db.Column(db.DateTime, index=True, server_default=func.now())
    category = db.Column(db.String(256), default="unknown")
    width = db.Column(db.Integer, default=0)
    height = db.Column(db.Integer, default=0)
    def __repr__(self):
        return "".format()

def get_images(start:int=0,limit:int=10)->Images:
    #return Images.query.order_by(Images.timestamp.decs()).limit(limit).all()[start:]
    #return Images.query.order_by(desc(Images.timestamp)).limit(limit).all()[start:]
    return Images.query.order_by(desc(Images.timestamp)).filter(Images.id >= start, Images.id <= limit).all()
def get_images_search(start:int=0,limit:int=10,query:str='')->Images:
    #return Images.query.filter_by(Images.name.contains(query)).limit(limit).all()[start:]
    return Images.query.filter(Images.name.contains(query) | Images.name.contains(query.replace(" ","_")) | Images.category.contains(query)).limit(limit).all()[start:]
def get_images_tag(start:int=0,limit:int=10,query:str='')->Images:
    #return Images.query.filter_by(category=query).order_by(desc(Images.timestamp)).limit(limit).all()[start:]
    return Images.query.filter(Images.category==query).limit(limit).all()[start:]
def get_images_tag_search(start:int=0,limit:int=10,query:str='',tag:str=''):
    return Images.query.filter(Images.category==tag, Images.name.contains(query) | Images.name.contains(query.replace(" ","_"))).limit(limit).all()[start:]

@app.route("/images/get/list", methods=["GET"])
@cross_origin()
def get_image_list():
    start = request.args.get("start")
    limit = request.args.get("limit")
    start = int(start) if start else 0
    limit = int(limit) if limit else 10
    try: search = request.args.get("search")
    except: search = None
    try: tags = request.args.get("tag")
    except: tags = None
    if search and tags:
        Images = get_images_tag_search(start,limit,search,tags)
    elif search:
        Images = get_images_search(start,limit,search)
    elif tags:
        Images = get_images_tag(start,limit,tags)
    else:
        Images = get_images(start,limit)
    print(len(Images))
    r = []
    for i in Images:
        r.append({
            "id":i.id,"name":i.name
            ,"path":i.path
            ,"extension":i.extension
            ,"timestamp":i.timestamp
            ,"url":"/images/get/path/{}".format(i.path)
            ,"category":i.category
            ,"width":i.width, "height":i.height
            })
    return jsonify({"data":r}),200

@app.route("/images/get/path/<path>", methods=["GET"])
@cross_origin()
def send_image(path):
    return send_from_directory(uploads_file_path,path)

@app.route("/images/get/id/<id>", methods=["GET"])
@cross_origin()
def send_image_id(id):
    try:
        i = int(id)
    except:
        i = 1
    path = Images.query.get(i).path
    return send_from_directory(uploads_file_path,path)

@app.route("/images/get/data/<id>", methods=["GET"])
@cross_origin()
def send_image_data(id):
    try:
        i = int(id)
    except:
        i = 1
    i = Images.query.get(int(id))
    r = {
        "id":i.id,"name":i.name
        ,"path":i.path
        ,"extension":i.extension
        ,"timestamp":i.timestamp
        ,"url":"/images/get/path/{}".format(i.path)
        ,"category":i.category
        ,"width":i.width, "height":i.height
        }
    return jsonify({"data":r})

@app.route('/images/get/category', methods=['GET'])
@cross_origin()
def send_category_data():
    try: search = request.args.get("search")
    except: search = None
    if search:
        images = Images.query.filter(Images.name.contains(search) | Images.name.contains(search.replace(" ","_")) | Images.category.contains(search)).all()
    else:
        images = Images.query.all()
    r = {"All category": len(images)}
    for i in images:
        category = i.category
        if category not in r:
            r[category] = 0
        r[category] += 1
    sr = sorted(r.items(), key=lambda x: x[1])
    sr.reverse()
    return jsonify({"data":sr})



@app.route("/images/post", methods=["POST"])
@cross_origin()
def post_file():
    if "file" not in request.files:
        return jsonify("file not found"), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify("filemame not found"), 400
    if file.filename and file and allowed_file(file.filename):
        random_str = generate_random_str(10)
        filename = secure_filename(random_str+"_"+file.filename)
        file.save(os.path.join(uploads_file_path, filename))
        category = get_prob(filename)
        width, height = get_image_size(os.path.join(uploads_file_path, filename))
        db.session.add(Images(
            name=file.filename
            ,path=filename
            ,category=category
            ,width=width
            ,height=height
        ))
        db.session.commit()
        return jsonify(""),200
    return jsonify(""),400

def generate_random_str(length: int) -> str:
    a,r = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",""
    for i in range(length):r += random.choice(a)
    return r

def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == '__main__':
    #def addDB(data: list[Images]):
    #    for d in data:
    #        db.session.add(d)
    #db.drop_all()
    #db.create_all()
    #db.session.commit()
    app.run(debug=True, host='0.0.0.0', port=5000)
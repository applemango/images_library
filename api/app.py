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

from imageData import get_image_size, get_image_data

from typing import Any

#like -done
#folder -done
#timeline


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

class Folder(db.Model):  # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(), nullable=False)
    color = db.Column(db.String(7))
    item_count = db.Column(db.Integer, default=0)
def get_folder_return_object(folder:Folder)->object:
    return {
        "id":folder.id
        ,"name":folder.name
        ,"color":folder.color
        ,"count":folder.item_count
    }

@app.route('/folder/get/all', methods=['GET'])
@cross_origin()
def get_all_folder():
    try: search = request.args.get("search")
    except: search = None
    try: tags = request.args.get("tag")
    except: tags = None
    try: like = request.args.get("like")
    except: like = None
    try: folder = int(request.args.get("folder"))  # type: ignore
    except: folder = None
    images = get_image_SLQTLF(
        query = search
        ,tag = tags
        ,like = like == 'true'
        ,folder = folder
        )
    r = {}
    for i in images:
        if i.folder_name:
            folder = i.folder_name
            if folder not in r:
                r[folder] = [i.folder_id,0]
            r[folder][1] += 1
    sr = sorted(r.items(), key=lambda x: x[1])
    sr.reverse()
    return jsonify({"data":sr})
    #folders = Folder.query.all()
    #r = []
    #for f in folders:
    #    r.append(get_folder_return_object(f))
    #return jsonify({"data":r}),200
@app.route('/folder/get/all/v1', methods=['GET'])
@cross_origin()
def get_all_folder_v1():
    folders = Folder.query.all()
    r = []
    for f in folders:
        r.append(get_folder_return_object(f))
    return jsonify({"data":r}),200

@app.route('/folder/create/<folder_name>', methods=['POST'])
@cross_origin()
def folder_create(folder_name):
    if not folder_name:
        return jsonify({"error": "you are and idiot (you are js?"})
    color = request.args.get("color")
    if not color:
        color = "#ffffff"
    folder = Folder(
        name=folder_name
        ,color=color
    )
    db.session.add(folder)
    db.session.commit()
    return jsonify({"data":get_folder_return_object(folder)})

@app.route('/folder/delete/<id>', methods=['DELETE'])
@cross_origin()
def delete_folder(id):
    try:
        id = int(id)
    except:
        return jsonify({"error": "you are and idiot (you are js?"})
    folder = Folder.query.get(id)
    if not folder:
        return jsonify({"error": "you are and idiot (you are js?)"})
    images = Images.query.filter_by(folder_id=folder.id).all()
    for i in images:
        i.folder_id = 0
        i.folder_name = ""
        i.folder_color = ""
        db.session.add(i)
    db.session.delete(folder)
    db.session.commit()
    return jsonify("success")

@app.route('/folder/edit/name/<id>/<name>', methods=['POST'])
@cross_origin()
def folder_edit_name(id, name):
    try:
        id = int(id)
    except:
        return jsonify({"error": "you are and idiot (you are js?"})
    folder = Folder.query.get(id)
    if not folder or not name or folder.name == name:
        return jsonify({"error": "you are and idiot (you are js?)"})
    folder.name = name
    db.session.add(folder)
    db.session.commit()
    return jsonify({"data":get_folder_return_object(folder)})

@app.route("/folder/add/<folder_id>/<image_id>", methods=["POST"])
@app.route("/folder/change/<folder_id>/<image_id>", methods=["POST"])
@cross_origin()
def folder_add_image(folder_id, image_id):
    try:
        folder_id = int(folder_id)
        image_id = int(image_id)
    except:
        return jsonify({"error": "you are and idiot (you are js?"})
    folder = Folder.query.get(folder_id)
    image = Images.query.get(image_id)
    if not folder and not image:
        return jsonify({"error": "you are and idiot (you are js?"})
    if image.folder_id:
        before_folder = Folder.query.get(image.folder_id)
        if before_folder:
            before_folder.item_count -= 1
            db.session.add(before_folder)
            db.session.commit()
    folder.item_count += 1
    image.folder_id = folder.id
    image.folder_name = folder.name
    db.session.add(image)
    db.session.add(folder)
    db.session.commit()
    return jsonify({"data": {
        "count": folder.item_count
        ,"folder_id": image.folder_id
        ,"folder_name": image.folder_name
    }})

@app.route("/folder/delete/<image_id>", methods=["POST"])
@cross_origin()
def folder_delete(image_id):
    try:
        image_id = int(image_id)
    except:
        return jsonify({"error": "you are and idiot (you are js?"})
    image = Images.query.get(image_id)
    if not image:
        return jsonify({"error": "you are and idiot (you are js?)"})
    if image.folder_id:
        folder = Folder.query.get(image.folder_id)
        folder.item_count -= 1
        db.session.add(folder)
        db.session.commit()
    image.folder_id = None
    image.folder_name = ""
    db.session.add(image)
    db.session.commit()
    return jsonify("success")


class Images(db.Model):  # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(), nullable=False)
    path = db.Column(db.String(), nullable=False)
    extension = db.Column(db.String(255), default="")
    timestamp = db.Column(db.DateTime, index=True, server_default=func.now())
    category = db.Column(db.String(256), default="unknown")
    width = db.Column(db.Integer, default=0)
    height = db.Column(db.Integer, default=0)
    folder_id = db.Column(db.Integer, db.ForeignKey("folder.id"))
    folder_name = db.Column(db.String())
    folder_color = db.Column(db.String(7))
    like = db.Column(db.Boolean, default=False)
    def __repr__(self):
        return "".format()
def get_image_return_object(image:Images)->object:
    return {
        "id":image.id,"name":image.name
        ,"path":image.path
        ,"extension":image.extension
        ,"timestamp":image.timestamp
        ,"url":"/images/get/path/{}".format(image.path)
        ,"category":image.category
        ,"width":image.width, "height":image.height
        ,"like": image.like
        ,"folder_id":image.folder_id
        ,"folder_name":image.folder_name
        ,"folder_color":image.folder_color
    }

@app.route('/like/get/all', methods=['GET'])
@cross_origin()
def image_get_like():
    try: search = request.args.get("search")
    except: search = None
    try: tags = request.args.get("tag")
    except: tags = None
    try: like = request.args.get("like")
    except: like = None
    try: folder = int(request.args.get("folder"))  # type: ignore
    except: folder = None
    images = get_image_SLQTLF(
        query=search
        ,tag=tags
        ,like=True#like == "true"
        ,folder=folder
    ).all()
    return jsonify({"data":len(images)})

@app.route('/images/like/<id>', methods=['POST'])
@cross_origin()
def image_like(id):
    return image_like_helper(id,True)
@app.route('/images/unlike/<id>', methods=['POST'])
@cross_origin()
def image_unlike(id):
    return image_like_helper(id,False)

def image_like_helper(id,type:bool):
    try:
        id = int(id)
    except:
        return jsonify({"error": "you are and idiot (you are js?"})
    image = Images.query.get(id)
    if not image:
        return jsonify({"error": "you are and idiot (you are js?)"})
    image.like = type
    db.session.add(image)
    db.session.commit()
    return jsonify("success")



def get_images(start:int=0,limit:int=10)->Images:
    return Images.query.order_by(desc(Images.timestamp)).limit(limit).all()[start:]#.filter(Images.id >= start, Images.id <= limit).all()
def get_images_search(start:int=0,limit:int=10,query:str='')->Images:
    return Images.query.order_by(desc(Images.timestamp)).filter(Images.name.contains(query) | Images.name.contains(query.replace(" ","_")) | Images.category.contains(query)).limit(limit).all()[start:]
def get_images_tag(start:int=0,limit:int=10,query:str='')->Images:
    return Images.query.order_by(desc(Images.timestamp)).filter(Images.category==query).limit(limit).all()[start:]
def get_images_tag_search(start:int=0,limit:int=10,query:str='',tag:str=''):
    return Images.query.order_by(desc(Images.timestamp)).filter(Images.category==tag, Images.name.contains(query) | Images.name.contains(query.replace(" ","_"))).limit(limit).all()[start:]
def get_images_like(start:int=0, limit:int=10):
    return Images.query.order_by(Images.timestamp).filter(Images.like == True).limit(limit).all()[start:]

def get_image_SLQTLF(
    start = None
    ,limit = None
    ,query = None
    ,tag = None
    ,like = None
    ,folder = None
    ):
    images = Images.query.order_by(desc(Images.timestamp))
    if query:
        images = images.filter(Images.name.contains(query) | Images.name.contains(query.replace(" ","_")) | Images.category.contains(query))
    if tag:
        images = images.filter(Images.category==tag)
    if like:
        images = images.filter(Images.like == True)
    if folder:
        images = images.filter(Images.folder_id == folder)
    if limit:
        images = images.limit(limit).all()
    if start:
        images = images[start:]
    return images

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
    try: like = request.args.get("like")
    except: like = None
    try: folder = int(request.args.get("folder"))  # type: ignore
    except: folder = None
    images = get_image_SLQTLF(
        start = start
        ,limit = limit
        ,query = search
        ,tag = tags
        ,like = like == 'true'
        ,folder = folder
        )
    #if like == "true":
    #    Images = get_images_like(start, limit)
    #elif search and tags:
    #    Images = get_images_tag_search(start,limit,search,tags)
    #elif search:
    #    Images = get_images_search(start,limit,search)
    #elif tags:
    #    Images = get_images_tag(start,limit,tags)
    #else:
    #    Images = get_images(start,limit)
    #print(len(images))
    r = []
    for i in images:
        r.append(get_image_return_object(i))
        #r.append({
        #    "id":i.id,"name":i.name
        #    ,"path":i.path
        #    ,"extension":i.extension
        #    ,"timestamp":i.timestamp
        #    ,"url":"/images/get/path/{}".format(i.path)
        #    ,"category":i.category
        #    ,"width":i.width, "height":i.height
        #    })
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
    #r = {
    #    "id":i.id,"name":i.name
    #    ,"path":i.path
    #    ,"extension":i.extension
    #    ,"timestamp":i.timestamp
    #    ,"url":"/images/get/path/{}".format(i.path)
    #    ,"category":i.category
    #    ,"width":i.width, "height":i.height
    #    }
    r = get_image_return_object(i)
    return jsonify({"data":r})

@app.route('/images/get/category', methods=['GET'])
@cross_origin()
def send_category_data():
    try: search = request.args.get("search")
    except: search = None
    try: tags = request.args.get("tag")
    except: tags = None
    try: like = request.args.get("like")
    except: like = None
    try: folder = int(request.args.get("folder"))  # type: ignore
    except: folder = None
    images = get_image_SLQTLF(
        query=search
        #,tag=tags タグ数を見るのによく考えたらtagは指定しなくて良かった
        ,like=like == "true"
        ,folder=folder
    ).all()
    #if search:
    #    images = Images.query.filter(Images.name.contains(search) | Images.name.contains(search.replace(" ","_")) | Images.category.contains(search)).all()
    #else:
    #    images = Images.query.all()
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
        #get_image_data(os.path.join(uploads_file_path, filename))
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
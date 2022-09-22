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
from sqlalchemy import and_
from imageData import get_image_size, get_image_data, download
from typing import Any

#like -done
#folder -done
#upload url -done
#user auth (don't need?) -done
#dark mode
#share (image)
#download (image)
#timeline (don't need?)


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
    ,JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=20)
    ,JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    ,JWT_TOKEN_LOCATION = ["headers", "query_string"]
    ,JSON_AS_ASCII = False
)

cors = CORS(app, responses={r"/*": {"origins": "*"}})
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)
init_dl(uploads_file_path+"/{}")
############################################################################################################################################################
############################################################################################################################################################
##########        TOKEN          ###########################################################################################################################
############################################################################################################################################################
############################################################################################################################################################
class User(db.Model):  # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(), nullable=False)
    password = db.Column(db.String())
    def set_password(self, password):
        self.password = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password, password)
class TokenBlocklist(db.Model): # type: ignore
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False)
    user_id = db.Column(db.ForeignKey('user.id'), default=lambda: get_current_user().id, nullable=False)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
@app.route('/register', methods=['POST'])
@cross_origin()
def register():
    username = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["username"]
    password = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["password"]
    if password is None or username is None or password == "" or username == "": return jsonify({"msg": "password or username has not been entered"}), 400
    if len(password) < 5: return jsonify({"msg": "password is too short"}), 400
    if len(username) < 3: return jsonify({"msg": "username is too short"}), 400
    if User.query.filter_by(name=username).first() is not None: return jsonify({"msg": "The username is already in use"}), 409
    user = User(name=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify("create account")
@app.route('/token', methods=['POST'])
@cross_origin()
def create_token():
    username = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["username"]
    password = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["password"]
    user = User.query.filter_by(name=username).first()
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Incorrect password or username"}), 401
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)
    return jsonify(access_token=access_token, refresh_token=refresh_token)
@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
@cross_origin()
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token)
@app.route("/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
@cross_origin()
def modify_token():
    token = get_jwt()
    jti = token["jti"]
    ttype = token["type"]
    now = datetime.now(timezone.utc)
    db.session.add(TokenBlocklist(jti=jti, type=ttype, created_at=now))
    db.session.commit()
    return jsonify(msg=f"{ttype.capitalize()} token successfully revoked")
@jwt.user_identity_loader
def user_identity_lookup(user):
    u = User.query.filter_by(name=user).first()
    if type(user) is int:
        u = User.query.filter_by(id=user).first()
    if u == None:return
    return u.id
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()
@jwt.token_in_blocklist_loader
def token_block(_jwt_header, jwt_data):
    if TokenBlocklist.query.filter_by(jti=jwt_data["jti"]).first():
        return True
    return False
############################################################################################################################################################
############################################################################################################################################################
##########        FOLDER         ###########################################################################################################################
############################################################################################################################################################
############################################################################################################################################################
class Folder(db.Model):  # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(), nullable=False)
    color = db.Column(db.String(7))
    item_count = db.Column(db.Integer, default=0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user_name = db.Column(db.String())
def get_folder_return_object(folder:Folder)->object:
    return {
        "id":folder.id
        ,"name":folder.name
        ,"color":folder.color
        ,"count":folder.item_count
        ,"user_id":folder.user_id
        ,"user_name":folder.user_name
    }

@app.route('/folder/get/all', methods=['GET'])
@cross_origin()
@jwt_required()
def get_all_folder():
    user_id = current_user.id  # type: ignore
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
        ,user_id=user_id
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

@app.route('/folder/get/all/v1', methods=['GET'])
@cross_origin()
@jwt_required()
def get_all_folder_v1():
    user_id = current_user.id  # type: ignore
    folders = Folder.query.filter(Folder.user_id==user_id).all()
    r = []
    for f in folders:
        r.append(get_folder_return_object(f))
    return jsonify({"data":r}),200

@app.route('/folder/create/<folder_name>', methods=['POST'])
@cross_origin()
@jwt_required()
def folder_create(folder_name):
    if not folder_name:
        return jsonify({"error": "if not folder_name:"})
    color = request.args.get("color")
    if not color:
        color = "#ffffff"
    user = User.query.get(current_user.id)  # type: ignore
    folder = Folder(
        name=folder_name
        ,color=color
        ,user_id=user.id
        ,user_name=user.name
    )
    db.session.add(folder)
    db.session.commit()
    return jsonify({"data":get_folder_return_object(folder)})

@app.route('/folder/delete/<id>', methods=['DELETE'])
@cross_origin()
@jwt_required()
def delete_folder(id):
    try:
        id = int(id)
    except:
        return jsonify({"error": "try: id = int(id) except:"})
    folder = Folder.query.get(id)
    user = User.query.get(current_user.id)  # type: ignore
    if not (folder.user_id == user.id):
        return jsonify({"error": "you do not have this folder"})
    if not folder:
        return jsonify({"error": "if not folder:"})
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
@jwt_required()
def folder_edit_name(id, name):
    try:
        id = int(id)
    except:
        return jsonify({"error": "try: id = int(id) except:"})
    folder = Folder.query.get(id)
    if not folder or not name or folder.name == name:
        return jsonify({"error": "if not folder or not name or folder.name == name"})
    user = User.query.get(current_user.id)  # type: ignore
    if not (folder.user_id == user.id):
        return jsonify({"error": "you do not have this folder"})
    images = get_image_SLQTLF(
        folder = folder.id
        ,user_id = user.id
    )
    folder.name = name
    db.session.add(folder)
    for i in images:
        i.folder_name = name
        db.session.add(i)
    db.session.commit()
    return jsonify({"data":get_folder_return_object(folder)})

@app.route("/folder/add/<folder_id>/<image_id>", methods=["POST"])
@app.route("/folder/change/<folder_id>/<image_id>", methods=["POST"])
@cross_origin()
@jwt_required()
def folder_add_image(folder_id, image_id):
    try:
        folder_id = int(folder_id)
        image_id = int(image_id)
    except:
        return jsonify({"error": "try folder_id = ~~ image_id = ~~ except:"})
    folder = Folder.query.get(folder_id)
    image = Images.query.get(image_id)
    user = User.query.get(current_user.id)  # type: ignore
    if not (folder.user_id == user.id) or not (image.user_id == user.id):
        return jsonify({"error": "you do not have this folder or Image"})
    if not folder or not image:
        return jsonify({"error": "if not folder or not image:"})
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
@jwt_required()
def folder_delete(image_id):
    try:
        image_id = int(image_id)
    except:
        return jsonify({"error": "try: id = int(id) except:"})
    image = Images.query.get(image_id)
    if not image:
        return jsonify({"error": "if not image:"})
    user = User.query.get(current_user.id)  # type: ignore
    if not (image.user_id == user.id):
        return jsonify({"error": "you do not have this Image"})
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
############################################################################################################################################################
############################################################################################################################################################
##########        IMAGES         ###########################################################################################################################
############################################################################################################################################################
############################################################################################################################################################
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
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user_name = db.Column(db.String())
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
        ,"user_id":image.user_id
        ,"user_name":image.user_name
    }

@app.route('/like/get/all', methods=['GET'])
@cross_origin()
@jwt_required()
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
        ,like=True
        ,folder=folder
        ,user_id=current_user.id # type: ignore
    ).all()
    return jsonify({"data":len(images)})

@app.route('/images/like/<id>', methods=['POST'])
@cross_origin()
@jwt_required()
def image_like(id):
    return image_like_helper(id,True,current_user.id)  # type: ignore
@app.route('/images/unlike/<id>', methods=['POST'])
@cross_origin()
@jwt_required()
def image_unlike(id):
    return image_like_helper(id,False,current_user.id)  # type: ignore

def image_like_helper(id,type:bool, user_id:int):
    try:
        id = int(id)
    except:
        return jsonify({"error": "try: id = int(id) except:"})
    image = Images.query.get(id)
    if not image:
        return jsonify({"error": "if not image:"})
    if not (image.user_id == user_id):
        return jsonify({"error": "you do not have this image"})
    image.like = type
    db.session.add(image)
    db.session.commit()
    return jsonify("success")

"""
def get_images(start:int=0,limit:int=10)->Images:
    return Images.query.order_by(desc(Images.timestamp)).limit(limit).all()[start:]
def get_images_search(start:int=0,limit:int=10,query:str='')->Images:
    return Images.query.order_by(desc(Images.timestamp)).filter(Images.name.contains(query) | Images.name.contains(query.replace(" ","_")) | Images.category.contains(query)).limit(limit).all()[start:]
def get_images_tag(start:int=0,limit:int=10,query:str='')->Images:
    return Images.query.order_by(desc(Images.timestamp)).filter(Images.category==query).limit(limit).all()[start:]
def get_images_tag_search(start:int=0,limit:int=10,query:str='',tag:str=''):
    return Images.query.order_by(desc(Images.timestamp)).filter(Images.category==tag, Images.name.contains(query) | Images.name.contains(query.replace(" ","_"))).limit(limit).all()[start:]
def get_images_like(start:int=0, limit:int=10):
    return Images.query.order_by(Images.timestamp).filter(Images.like == True).limit(limit).all()[start:]
"""

def get_image_SLQTLF(start = None ,limit = None ,query = None ,tag = None ,like = None ,folder = None, user_id:int = True):
    images = Images.query.order_by(desc(Images.timestamp)) \
        .filter(Images.user_id == user_id) \
        .filter(Images.name.contains(query) | Images.name.contains(query.replace(" ","_")) | Images.category.contains(query) if query else True) \
        .filter(Images.category==tag if tag else True) \
        .filter(Images.like == True if like else True) \
        .filter(Images.folder_id == folder if folder and folder != -1 else True) \
        .filter(and_(Images.folder_id != 0, Images.folder_id != None) if folder == -1 else True)
    if limit: images = images.limit(limit).all()
    if start: images = images[start:]
    return images

@app.route("/images/get/list", methods=["GET"])
@cross_origin()
@jwt_required()
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
        ,user_id = current_user.id  # type: ignore
        )
    r = []
    for i in images:
        r.append(get_image_return_object(i))
    return jsonify({"data":r}),200

#/images/get/path/<path>?token=~
@app.route("/images/get/path/<path>", methods=["GET"])
@cross_origin()
@jwt_required()
def send_image(path):
    image = Images.query.filter(Images.path == path).first()
    if not (image.user_id == current_user.id):  # type: ignore
        return jsonify({"error": "you do not have this image"})
    return send_from_directory(uploads_file_path,path)

@app.route("/images/get/id/<id>", methods=["GET"])
@cross_origin()
@jwt_required()
def send_image_id(id):
    try:
        i = int(id)
    except:
        i = 1
    image = Images.query.get(i)
    if not (image.user_id == current_user.id):  # type: ignore
        return jsonify({"error": "you do not have this image"})
    path = image.path
    return send_from_directory(uploads_file_path,path)

@app.route("/images/get/data/<id>", methods=["GET"])
@cross_origin()
@jwt_required()
def send_image_data(id):
    try:
        i = int(id)
    except:
        i = 1
    i = Images.query.get(int(id))
    if not (i.user_id == current_user.id):  # type: ignore
        return jsonify({"error": "you do not have this image"})
    r = get_image_return_object(i)
    return jsonify({"data":r})

@app.route('/images/get/category', methods=['GET'])
@cross_origin()
@jwt_required()
def send_category_data():
    try: search = request.args.get("search")
    except: search = None
    try: like = request.args.get("like")
    except: like = None
    try: folder = int(request.args.get("folder"))  # type: ignore
    except: folder = None
    images = get_image_SLQTLF(
        query=search
        ,like=like == "true"
        ,folder=folder
        ,user_id = current_user.id  # type: ignore
    ).all()
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
@jwt_required()
def post_file():
    if "file" not in request.files:
        return jsonify("file not found"), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify("file not fined"), 400
    if file.filename and file and allowed_file(file.filename):
        random_str = generate_random_str(10)
        filename = secure_filename(random_str+"_"+file.filename)
        file.save(os.path.join(uploads_file_path, filename))
        category = get_prob(filename)
        width, height = get_image_size(os.path.join(uploads_file_path, filename))
        user = User.query.get(current_user.id) # type: ignore
        #get_image_data(os.path.join(uploads_file_path, filename))
        db.session.add(Images(
            name=file.filename
            ,path=filename
            ,category=category
            ,width=width
            ,height=height
            ,user_id=user.id
            ,user_name=user.name
        ))
        db.session.commit()
        return jsonify(""),200
    return jsonify(""),400

@app.route('/images/post/url', methods=['POST'])
@cross_origin()
@jwt_required()
def post_url():
    url = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["url"]
    random_str = generate_random_str(10)
    filename = secure_filename(random_str+"_"+url)
    x = download(url=url,downloadFolder=uploads_file_path,filename=filename)
    if x == "Success":
        category = get_prob(filename)
        width, height = get_image_size(os.path.join(uploads_file_path, filename))
        user = User.query.get(current_user.id) # type: ignore
        db.session.add(Images(
            name=url
            ,path=filename
            ,category=category
            ,width=width
            ,height=height
            ,user_id=user.id
            ,user_name=user.name
        ))
        db.session.commit()
        return jsonify("Success")
    return jsonify({"error": "download error"})

@app.route('/images/delete/<id>', methods=['DELETE'])
@cross_origin()
@jwt_required()
def delete_image(id):
    try:
        id = int(id)
    except:
        return jsonify({"error": "try: id = int(id) except:"})
    image = Images.query.get(id)
    if not image:
        return jsonify({"error": "if not image:"})
    if not (image.user_id == current_user.id):  # type: ignore
        return jsonify({"error": "you do not have this image"})
    if image.folder_id:
        folder = Folder.query.get(image.folder_id)
        folder.item_count -= 1
        db.session.add(folder)
    db.session.delete(image)
    db.session.commit()
    return jsonify("success")

def generate_random_str(length: int) -> str:
    a,r = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",""
    for i in range(length):r += random.choice(a)
    return r

def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
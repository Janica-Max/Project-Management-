from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)

# ==============================
# CONFIG
# ==============================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(BASE_DIR, "database.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "static", "uploads")
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB max upload

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

db = SQLAlchemy(app)

# ==============================
# DATABASE MODEL
# ==============================
class Sticker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)   # example: Anime/cat.png
    category = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(150), nullable=False)

# Create database tables
with app.app_context():
    db.create_all()

# ==============================
# HELPERS
# ==============================
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def get_categories():
    return ["Anime", "Animals", "Cute", "Couple", "Handmade"]

def list_stickers(category="All"):
    stickers = []
    folders = get_categories()

    if category == "All":
        for folder in folders:
            folder_path = os.path.join(app.config["UPLOAD_FOLDER"], folder)
            if os.path.exists(folder_path):
                for f in os.listdir(folder_path):
                    if allowed_file(f):
                        stickers.append(f"{folder}/{f}")
    else:
        if category not in folders:
            return []
        folder_path = os.path.join(app.config["UPLOAD_FOLDER"], category)
        if os.path.exists(folder_path):
            for f in os.listdir(folder_path):
                if allowed_file(f):
                    stickers.append(f"{category}/{f}")

    stickers.sort()
    return stickers

# ==============================
# ROUTES
# ==============================
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/browser")
def browser():
    category = request.args.get("category", "All")
    page = request.args.get("page", 1, type=int)
    per_page = 8

    all_stickers = list_stickers(category)

    total = len(all_stickers)
    total_pages = max(1, (total + per_page - 1) // per_page)

    start = (page - 1) * per_page
    end = start + per_page
    stickers_page = all_stickers[start:end]

    return render_template(
        "browser.html",
        stickers=stickers_page,
        selected_category=category,
        page=page,
        total_pages=total_pages
    )

@app.route("/get_stickers")
def get_stickers():
    category = request.args.get("category", "All")
    return jsonify({"stickers": list_stickers(category)})

@app.route("/upload", methods=["POST"])
def upload():
    try:
        file = request.files.get("file")
        name = request.form.get("name", "").strip()
        category = request.form.get("category", "").strip()

        if not file or file.filename == "":
            return jsonify({"success": False, "error": "No file selected"}), 400

        if not name:
            return jsonify({"success": False, "error": "Sticker name is required"}), 400

        if category not in get_categories():
            return jsonify({"success": False, "error": "Invalid category"}), 400

        if not allowed_file(file.filename):
            return jsonify({"success": False, "error": "Only PNG, JPG, JPEG, GIF allowed"}), 400

        ext = os.path.splitext(file.filename)[1].lower()
        safe_name = secure_filename(name)

        if not safe_name:
            return jsonify({"success": False, "error": "Invalid sticker name"}), 400

        folder = os.path.join(app.config["UPLOAD_FOLDER"], category)
        os.makedirs(folder, exist_ok=True)

        new_filename = f"{safe_name}{ext}"
        save_path = os.path.join(folder, new_filename)

        # Prevent overwrite if same name already exists
        counter = 1
        while os.path.exists(save_path):
            new_filename = f"{safe_name}_{counter}{ext}"
            save_path = os.path.join(folder, new_filename)
            counter += 1

        # Save file
        file.save(save_path)

        # Save in database
        relative_filename = f"{category}/{new_filename}"

        new_sticker = Sticker(
            filename=relative_filename,
            category=category,
            name=safe_name
        )
        db.session.add(new_sticker)
        db.session.commit()

        return jsonify({
            "success": True,
            "id": new_sticker.id,
            "filename": new_filename,
            "filepath": relative_filename,
            "category": category,
            "name": safe_name
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/delete/<int:id>", methods=["POST"])
def delete_sticker(id):
    sticker = Sticker.query.get_or_404(id)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], sticker.filename)

    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(sticker)
    db.session.commit()

    return redirect(url_for("browser"))

@app.route("/tshirt/<path:sticker_filename>")
def tshirt(sticker_filename):
    return render_template("tshirt.html", design=sticker_filename)

# ==============================
# RUN
# ==============================
if __name__ == "__main__":
    app.run(debug=True)
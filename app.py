from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
import uuid

app = Flask(__name__)

# ================= CONFIG =================

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(BASE_DIR, "database.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "static", "uploads")

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

db = SQLAlchemy(app)

# ================= DATABASE MODEL =================

class Sticker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)

with app.app_context():
    db.create_all()

# ================= ROUTES =================

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/browser")
def browser():
    page = request.args.get("page", 1, type=int)
    per_page = 8

    stickers = Sticker.query.order_by(Sticker.id.desc()).paginate(
        page=page,
        per_page=per_page
    )

    return render_template("browser.html", stickers=stickers)


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return redirect(url_for("browser"))

    file = request.files["file"]

    if file.filename == "":
        return redirect(url_for("browser"))

    filename = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}_{filename}"

    file.save(os.path.join(app.config["UPLOAD_FOLDER"], unique_name))

    new_sticker = Sticker(filename=unique_name)
    db.session.add(new_sticker)
    db.session.commit()

    return redirect(url_for("browser"))


@app.route("/delete/<int:id>", methods=["POST"])
def delete_sticker(id):
    sticker = Sticker.query.get_or_404(id)

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], sticker.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.session.delete(sticker)
    db.session.commit()

    return redirect(url_for("browser"))

# ================= T-SHIRT PAGE =================
@app.route("/tshirt/<sticker_filename>")
def tshirt(sticker_filename):
    return render_template("tshirt.html", design=sticker_filename)

# ================= RUN APP =================
if __name__ == "__main__":
    app.run(debug=True)
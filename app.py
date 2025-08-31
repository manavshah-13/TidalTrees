from flask import Flask, request, jsonify, render_template, redirect, url_for, flash as flash_message
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os
import logging
import flash

# -------------------------
# Setup
# -------------------------
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------
# Database Configuration
# -------------------------
def get_database_url():
    if os.environ.get('DATABASE_URL'):
        return os.environ.get('DATABASE_URL')
    elif os.environ.get('MYSQL_URL'):
        return os.environ.get('MYSQL_URL')
    elif os.environ.get('POSTGRES_URL'):
        return os.environ.get('POSTGRES_URL')
    else:
        db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'app.db')
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        return f'sqlite:///{db_path}'

try:
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', os.urandom(24))
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_url()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
except Exception as e:
    logger.error(f"Config error: {e}")
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

db = SQLAlchemy(app)

# -------------------------
# Login Manager
# -------------------------
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'

# -------------------------
# Models
# -------------------------
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Guardian(db.Model):
    __tablename__ = 'guardians'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    contact = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(255))

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)

class Report(db.Model):
    __tablename__ = 'reports'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    severity = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)

# -------------------------
# User Loader
# -------------------------
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# -------------------------
# Routes: Authentication
# -------------------------
@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        try:
            username = request.form.get('username')
            password = request.form.get('password')
            
            if User.query.filter_by(username=username).first():
                flash_message('Username already exists')
                return redirect(url_for('register'))
            
            user = User(username=username)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            
            flash_message('Registration successful! Please login.')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash_message(f'Error: {e}')
            return redirect(url_for('register'))
            
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/protected')
@login_required
def protected():
    return f'Hello, {current_user.username}!'

# -------------------------
# Routes: APIs
# -------------------------
@app.route('/api/join', methods=['POST'])
def join_guardian():
    data = request.get_json()
    if not data or 'name' not in data or 'contact' not in data:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    try:
        guardian = Guardian(name=data['name'], contact=data['contact'], location=data.get('location'))
        db.session.add(guardian)
        db.session.commit()
        return jsonify({"status": "success", "message": "Guardian added"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/contact', methods=['POST'])
def handle_contact():
    data = request.get_json()
    required_fields = ['firstName', 'lastName', 'email', 'subject', 'message']
    if not data or not all(field in data for field in required_fields):
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    try:
        full_name = f"{data['firstName']} {data['lastName']}"
        msg = ContactMessage(name=full_name, email=data['email'], subject=data['subject'], message=data['message'])
        db.session.add(msg)
        db.session.commit()
        return jsonify({"status": "success", "message": "Message received"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/report', methods=['POST'])
def submit_report():
    data = request.get_json()
    required_fields = ['title', 'location', 'severity', 'description']
    if not data or not all(field in data for field in required_fields):
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    try:
        report = Report(
            title=data['title'],
            location=data['location'],
            severity=data['severity'],
            description=data['description']
        )
        db.session.add(report)
        db.session.commit()
        return jsonify({"status": "success", "message": "Report submitted"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# -------------------------
# Routes: Pages
# -------------------------
@app.route('/community')
@login_required
def community():
    return render_template('community.html')

@app.route('/reporting')
@login_required
def reporting():
    return render_template('reporting.html')

@app.route('/ai-validation')
@login_required
def ai_validation():
    return render_template('ai-validation.html')

@app.route('/leaderboard')
@login_required
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/contact')
@login_required
def contact():
    return render_template('contact.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('index.html')

# -------------------------
# Error Handlers
# -------------------------
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500

# -------------------------
# Run App
# -------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        logger.info("Database initialized")

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
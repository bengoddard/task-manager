from sqlalchemy.orm import validates
from marshmallow import Schema, fields, validate
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import date

from config import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    habits = db.relationship('Habit', back_populates='user', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
        }

    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed.')

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(
            password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(
            self._password_hash, password.encode('utf-8'))

    def __repr__(self):
        return f'<User {self.username}>'


class Habit(db.Model):
    __tablename__ = 'habits'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    notes = db.Column(db.String, nullable=False)
    frequency = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', back_populates="habits")
    logs = db.relationship("Log", back_populates="habit", cascade="all, delete-orphan")

    @validates('notes')
    def validate_instructions(self, key, notes):
        if not notes:
            raise ValueError("Notes must be present.")
        if len(notes) < 5:
            raise ValueError("Notes must be at least 5 characters long.")
        return notes


class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, default=date.today)
    status = db.Column(db.Boolean, nullable=False, default=False)

    habit_id = db.Column(db.Integer(), db.ForeignKey('habits.id'), nullable=False)
    habit = db.relationship("Habit", back_populates="logs")

    __table_args__ = (
        db.UniqueConstraint("habit_id", "date", name="uix_habit_date"),
    )


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True)
    password = fields.Str(load_only=True, required=True)

    habits = fields.List(fields.Nested(lambda: HabitSchema(exclude=("user",))))


class HabitSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    notes = fields.Str(
        required=True,
        validate=validate.Length(min=5, error="Notes must be at least 5 characters long.")
    )
    frequency = fields.Str(required=True)
    user_id = fields.Int()
    user = fields.Nested(UserSchema(exclude=("habits",)))


class LogSchema(Schema):
    id = fields.Int(dump_only=True)
    date = fields.Date(required=True)
    status = fields.Boolean(required=True)
    habit_id = fields.Int(required=True)

    habit = fields.Nested("HabitSchema", only=("id", "title"), dump_only=True)
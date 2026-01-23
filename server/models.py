from sqlalchemy.orm import validates
from marshmallow import Schema, fields, validate
from sqlalchemy.ext.hybrid import hybrid_property

from config import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String)

    habits = db.relationship('Habit', back_populates='user')

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
    description = db.Column(db.String, nullable=False)
    time = db.Column(db.Integer)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'))
    user = db.relationship('User', back_populates="habits")

    @validates('description')
    def validate_instructions(self, key, description):
        if not description:
            raise ValueError("Description must be present.")
        if len(description) < 50:
            raise ValueError("Description must be at least 50 characters long.")
        return description

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True)
    password = fields.Str(load_only=True, required=True)

    habits = fields.List(fields.Nested(lambda: HabitSchema(exclude=("user",))))


class HabitSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str(
        required=True,
        validate=validate.Length(min=50, error="Description must be at least 50 characters long.")
    )
    time = fields.Int()
    user_id = fields.Int()
    user = fields.Nested(UserSchema(exclude=("habits",)))
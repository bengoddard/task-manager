from sqlalchemy.orm import validates
from marshmallow import Schema, fields, validate

from config import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    bio = db.Column(db.String)

    tasks = db.relationship('Task', back_populates='user')

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "bio": self.bio
        }

    def __repr__(self):
        return f'<User {self.username}>'


class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    minutes_to_complete = db.Column(db.Integer)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'))
    user = db.relationship('User', back_populates="tasks")

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
    bio = fields.Str()

    tasks = fields.List(fields.Nested(lambda: TaskSchema(exclude=("user",))))


class TaskSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str(
        required=True,
        validate=validate.Length(min=50, error="Description must be at least 50 characters long.")
    )
    minutes_to_complete = fields.Int()
    user_id = fields.Int()
    user = fields.Nested(UserSchema(exclude=("tasks",)))
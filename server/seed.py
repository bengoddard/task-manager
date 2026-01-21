#!/usr/bin/env python3

from random import randint, choice as rc

from faker import Faker

from app import app
from models import db, Task, User

fake = Faker()

with app.app_context():

    print("Deleting all records...")
    Task.query.delete()
    User.query.delete()

    fake = Faker()

    print("Creating users...")

    users = []
    usernames = []

    for i in range(20):
        username = fake.first_name()
        while username in usernames:
            username = fake.first_name()
        usernames.append(username)

        user = User(
            username=username,
            bio=fake.paragraph(nb_sentences=3),
        )

        user.password_hash = user.username + 'password'

        users.append(user)

    db.session.add_all(users)

    print("Creating notes...")
    tasks = []
    for i in range(100):
        description = fake.paragraph(nb_sentences=8)
        time = fake.number.int({ min: 10, max: 100 })
        task = Task(
            title=fake.sentence(),
            description=description,
            time=time,
            user=rc(users)
        )

        task.user = rc(users)

        tasks.append(task)

    db.session.add_all(tasks)
    db.session.commit()
    print("Complete.")

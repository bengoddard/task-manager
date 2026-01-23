#!/usr/bin/env python3

from random import randint, choice as rc

from faker import Faker

from app import app
from models import db, Habit, User

fake = Faker()

with app.app_context():

    print("Deleting all records...")
    Habit.query.delete()
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
        )

        user.password_hash = user.username + 'password'

        users.append(user)

    db.session.add_all(users)

    print("Creating habits...")
    habits = []
    habit_titles = [
        "Morning Meditation", "Daily Journaling", "Exercise Routine",
        "Read 30 Minutes", "No Social Media Before Bed"
    ]
    for user in users:
        for _ in range(4):
            notes = fake.paragraph(nb_sentences=8)
            time = fake.random_int(min=5, max=60)
            habit = Habit(
                title=rc(habit_titles),
                notes=notes,
                time=time,
                user=rc(users)
            )

            habit.user = rc(users)

            habits.append(habit)

    db.session.add_all(habits)
    db.session.commit()
    print("Complete.")

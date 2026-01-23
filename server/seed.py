#!/usr/bin/env python3

from datetime import date, timedelta
import random

from config import app, db
from models import User, Habit, Log


def clear_data():
    Log.query.delete()
    Habit.query.delete()
    User.query.delete()
    db.session.commit()


def seed_users():
    users = []

    u1 = User(username="ben")
    u1.password_hash = "password123"
    users.append(u1)

    u2 = User(username="andy")
    u2.password_hash = "password123"
    users.append(u2)

    u3 = User(username="guest")
    u3.password_hash = "password123"
    users.append(u3)

    db.session.add_all(users)
    db.session.commit()
    return users


def seed_habits(users):
    habits = [
        Habit(
            title="Drink Water",
            notes="8 cups a day.",
            frequency="daily",
            user_id=users[0].id,
        ),
        Habit(
            title="Walk",
            notes="At least 20 minutes.",
            frequency="daily",
            user_id=users[0].id,
        ),
        Habit(
            title="Read",
            notes="Read 10 pages.",
            frequency="daily",
            user_id=users[1].id,
        ),
        Habit(
            title="Gym",
            notes="Strength training session.",
            frequency="weekly",
            user_id=users[1].id,
        ),
        Habit(
            title="Meal Prep",
            notes="Prep lunches for the week.",
            frequency="weekly",
            user_id=users[2].id,
        ),
    ]

    db.session.add_all(habits)
    db.session.commit()
    return habits


def seed_logs(habits, days_back=10):
    logs = []
    today = date.today()

    for habit in habits:
        for i in range(days_back):
            d = today - timedelta(days=i)

            if habit.frequency == "daily":
                status = random.random() < 0.7
            else:
                status = random.random() < 0.4

            logs.append(Log(date=d, status=status, habit_id=habit.id))

    db.session.add_all(logs)
    db.session.commit()
    return logs


if __name__ == "__main__":
    with app.app_context():
        print("Clearing existing data...")
        clear_data()

        print("Seeding users...")
        users = seed_users()

        print("Seeding habits...")
        habits = seed_habits(users)

        print("Seeding logs...")
        logs = seed_logs(habits, days_back=14)

        print("Done.")
        print(f"Users: {len(users)} | Habits: {len(habits)} | Logs: {len(logs)}")

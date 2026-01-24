from flask import request, make_response, jsonify
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from config import app, db, api, jwt
from models import User, Habit, UserSchema, HabitSchema, Log, LogSchema
from flask_jwt_extended import create_access_token, get_jwt_identity, verify_jwt_in_request
from flask_cors import CORS
from datetime import date, timedelta

def compute_streak(habit_id):
    streak = 0
    d = date.today()
    while True:
        log = Log.query.filter_by(habit_id=habit_id, date=d).first()
        if log and log.status is True:
            streak += 1
            d = d - timedelta(days=1)
        else:
            break
    return streak

CORS(app, resources={r"/*": {"origins": "http://localhost:4000"}}, supports_credentials=True)
@app.before_request
def check_if_logged_in():
    if request.method == "OPTIONS":
        return make_response("", 200)
    open_access_list = ['signup', 'login']
    if request.endpoint in open_access_list:
        return
    try:
        verify_jwt_in_request()
    except Exception:
        return make_response(jsonify({'error': 'Missing or invalid token'}), 401)

class Signup(Resource):
    def post(self):
        request_json = request.get_json()

        username = request_json.get('username')
        password = request_json.get('password')

        try:
            user = User(
            username=username,
        )
            user.password_hash = password
            db.session.add(user)
            db.session.commit()
            access_token = create_access_token(identity=(user.id))
            return make_response(jsonify(token=access_token, user=UserSchema().dump(user)), 201)
        except IntegrityError:
            return {'error': '422 Unprocessable Entity'}, 422

class WhoAmI(Resource):
    def get(self):
        user_id = get_jwt_identity()
        if user_id:
            user = User.query.filter(User.id == user_id).first()
            return UserSchema().dump(user), 200
        return {"error": "Unauthorized"}, 401

class Login(Resource):
    def post(self):

        username = request.get_json()['username']
        password = request.get_json()['password']

        user = User.query.filter(User.username == username).first()

        if user and user.authenticate(password):
            token = create_access_token(identity=str(user.id))
            return make_response(jsonify(token=token, user=UserSchema().dump(user)), 200)

        return {'error': '401 Unauthorized'}, 401

class HabitIndex(Resource):
    def get(self):
        user_id = get_jwt_identity()
        if user_id:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)

            pagination = Habit.query.filter_by(user_id=user_id).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
            return {
                "total": pagination.total,
                "pages": pagination.pages,
                "current_page": pagination.page,
                "next_page": pagination.next_num,
                "prev_page": pagination.prev_num,
                "habits": HabitSchema(many=True).dump(pagination.items)
            }, 200
        return {'error': '401 Unauthorized'}, 401

    def post(self):
        request_json = request.get_json()
        user_id = get_jwt_identity()
        if user_id:
            try:
                habit = Habit(
                    title=request_json.get('title'),
                    notes=request_json.get('notes'),
                    frequency=request_json.get('frequency'),
                    user_id=user_id
                )
                db.session.add(habit)
                db.session.commit()
                return HabitSchema().dump(habit), 201

            except (IntegrityError, ValueError) as e:
                db.session.rollback()
                return {"error": str(e)}, 422
        return {'error': '401 Unauthorized'}, 401

class HabitByID(Resource):
    def patch(self, id):
        user_id = get_jwt_identity()
        habit = Habit.query.filter_by(id=id, user_id=user_id).first()
        if not habit:
            return {"error": "Habit not found"}, 404

        request_json = request.get_json()
        try:
            for attr in request_json:
                setattr(habit, attr, request_json[attr])
            db.session.commit()
            return HabitSchema().dump(habit), 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 422

    def delete(self, id):
        user_id = get_jwt_identity()
        habit = Habit.query.filter_by(id=id, user_id=user_id).first()
        if not habit:
            return {"error": "Habit not found"}, 404

        db.session.delete(habit)
        db.session.commit()
        return {}, 204

class HabitCheckin(Resource):
    def post(self, id):
        user_id = int(get_jwt_identity())
        habit = Habit.query.filter_by(id=id, user_id=user_id).first()
        if not habit:
            return {"errors": ["Habit not found"]}, 404

        data = request.get_json() or {}
        log_date = data.get("date")
        status = data.get("status")

        if status is None:
            return {"errors": ["status is required (true/false)"]}, 422

        if not log_date:
            log_date = date.today()
        else:
            log_date = date.fromisoformat(log_date)

        log = Log.query.filter_by(habit_id=habit.id, date=log_date).first()
        if log:
            log.status = bool(status)
        else:
            log = Log(date=log_date, status=bool(status), habit_id=habit.id)
            db.session.add(log)

        db.session.commit()

        return LogSchema().dump(log), 200

class Today(Resource):
    def get(self):
        user_id = int(get_jwt_identity())
        habits = Habit.query.filter_by(user_id=user_id).all()
        today = date.today()

        result = []
        for h in habits:
            log = Log.query.filter_by(habit_id=h.id, date=today).first()
            completed = bool(log.status) if log else False
            result.append({
                "id": h.id,
                "title": h.title,
                "notes": h.notes,
                "frequency": h.frequency,
                "completed_today": completed,
                "streak": compute_streak(h.id),
            })

        return {"date": today.isoformat(), "habits": result}, 200

class Progress(Resource):
    def get(self):
        user_id = int(get_jwt_identity())

        range_param = request.args.get("range", "week")
        if range_param not in ["week", "month"]:
            return {"errors": ["range must be 'week' or 'month'"]}, 422

        days = 7 if range_param == "week" else 30
        end = date.today()
        start = end - timedelta(days=days - 1)

        habits = Habit.query.filter_by(user_id=user_id).all()

        per_habit = []
        total_possible = 0
        total_done = 0

        for h in habits:
            logs = (
                Log.query
                .filter(Log.habit_id == h.id)
                .filter(Log.date >= start)
                .filter(Log.date <= end)
                .all()
            )
            log_map = {lg.date: lg.status for lg in logs}
            history = []
            done_count = 0

            for i in range(days):
                d = start + timedelta(days=i)
                status = bool(log_map.get(d, False))
                if status:
                    done_count += 1
                history.append({"date": d.isoformat(), "status": status})

            completion_rate = (done_count / days) if days else 0

            streak = compute_streak(h.id)

            per_habit.append({
                "id": h.id,
                "title": h.title,
                "completion_rate": completion_rate,
                "streak": streak,
                "history": history
            })

            total_possible += days
            total_done += done_count

        overall_rate = (total_done / total_possible) if total_possible else 0

        return {
            "range": range_param,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "completion_rate": overall_rate,
            "habits": per_habit
        }, 200


api.add_resource(Signup, '/signup', endpoint='signup')
api.add_resource(WhoAmI, '/me', endpoint='me')
api.add_resource(Login, '/login', endpoint='login')
api.add_resource(HabitIndex, '/habits', endpoint='habits')
api.add_resource(HabitByID, '/habits/<int:id>', endpoint='habit_by_id')
api.add_resource(HabitCheckin, "/habits/<int:id>/checkin")
api.add_resource(Today, "/today")
api.add_resource(Progress, "/progress", endpoint="progress")



if __name__ == '__main__':
    app.run(port=5555, debug=True)
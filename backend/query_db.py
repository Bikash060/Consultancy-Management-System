import os
import sys

from app import create_app
from app.extensions import db
from app.models.settings import Country, University, Course

app = create_app()

with app.app_context():
    countries = Country.query.all()
    print("Countries:", [(c.id, c.name) for c in countries])
    unis = University.query.all()
    print("Universities:", [(u.id, u.name) for u in unis])
    courses = Course.query.all()
    print("Courses:", [(c.id, c.name) for c in courses])

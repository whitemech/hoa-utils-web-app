#!/usr/bin/python3
# -*- coding: utf-8 -*-
# Copyright (C) 2020 WhiteMech
#
# This application is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation; either version 3 of the
# License, or (at your option) any later version.
#
# This application is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
import base64
import inspect
import json
import os
import subprocess
from dataclasses import dataclass
from functools import wraps
from pathlib import Path
from platform import python_version

import hoa
from dotenv import load_dotenv
from flask import Flask
from flask import __version__ as flask_version
from flask import request
from flask.json import jsonify
from flask_cors import CORS
from hoa.parsers import HOAParser
from lark import LarkError

CURRENT_DIRECTORY = os.path.dirname(inspect.getfile(inspect.currentframe()))
ROOT_SERVER_DIRECTORY = str(Path(CURRENT_DIRECTORY).parent)
DOTENV_FILE = os.path.join(ROOT_SERVER_DIRECTORY, ".env")
load_dotenv(DOTENV_FILE)
TIMEOUT = 5


@dataclass(frozen=True)
class Configuration:
    """
    An helper class that lets the app to seamlessly
    read configuration from code and from OS environment.
    """

    FLASK_STATIC_FOLDER: str = None
    FLASK_RUN_HOST: str = "0.0.0.0"
    FLASK_RUN_PORT: int = 5000

    def __getattribute__(self, varname):
        """Get varname from os.environ, else None"""
        value = os.environ.get(varname, None)
        try:
            default = super(Configuration, self).__getattribute__(varname)
        except AttributeError:
            default = None
        return value if value else default


configuration = Configuration()
app = Flask(
    __name__, static_folder=configuration.FLASK_STATIC_FOLDER, static_url_path="/"
)
CORS(app)


def assert_(condition, message: str = ""):
    """Custom assert function to replace Python's built-in."""
    if not condition:
        raise AssertionError(message)


def run_cli(cmd, *args, **kwargs) -> subprocess.Popen:
    """Run a CLI command."""
    app.logger.info(f"Running command: {cmd}")
    return subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs
    )


# TODO increase when ready
def cachecontrol(max_age=1):
    def decorate_f(f):
        @wraps(f)
        def wrapped_f(*args, **kwargs):
            response = f(*args, **kwargs)
            if (type(response) is Flask.response_class) and (
                response.status_code == 200
            ):
                response.cache_control.max_age = max_age
            return response

        return wrapped_f

    return decorate_f


def warn(res, msg):
    if "note" in res:
        res["note"].append(msg)
    else:
        res["note"] = [msg]


@app.route("/api/")
def healthcheck():
    return {}, 200


# Return a Json list of triplets [[tool,version,url],...].
@app.route("/api/versions")
@cachecontrol()
def versions():
    app.logger.info("Request /api/versions")
    return jsonify(
        [
            (
                "hoa-utils",
                hoa.__version__,
                "https://github.com/whitemech/hoa-utils.git",
            ),
            ("Python", python_version(), "https://www.python.org/"),
            ("Flask", flask_version, "http://flask.pocoo.org/"),
        ]
    )


@app.route("/api/validate/", methods=["POST"])
@cachecontrol()
def validate():
    try:
        data = request.get_json()
        app.logger.info(f"Request /api/validate: {data}")
        hoa_content = base64.b64decode(data["content"]).decode("utf-8")
        parser = HOAParser()
        parser(hoa_content)
        result, code = {"success": True, "message": "OK"}, 200
    except LarkError as e:
        result, code = {"success": False, "message": str(e)}, 200
    except AssertionError as e:
        result, code = {"success": False, "error": str(e)}, 400
    except Exception as e:
        result, code = {"success": False, "error": f"Generic error: {e}"}, 400

    return jsonify(result), code


def index():
    app.logger.debug(app.static_folder)
    return app.send_static_file("index.html")


if configuration.FLASK_STATIC_FOLDER:
    index = app.route("/")(index)


if __name__ == "__main__":
    app.run(
        host=configuration.FLASK_RUN_HOST,
        port=configuration.FLASK_RUN_PORT,
        debug=False,
    )

# Copyright 2024 BlueCat Networks Inc.

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

"""Routes and back-end implementation of workflow."""
import json
import os

from flask import g, send_from_directory, request

# pylint: disable=import-error
from bluecat.gateway.decorators import (
    api_exc_handler,
    page_exc_handler,
    require_permission,
)
from bluecat.gateway.errors import (
    BadRequestError,
    FieldError,
)  # pylint: disable=import-error
from bluecat.util import no_cache  # pylint: disable=import-error

from .base import bp


def validate_input(value):
    """
    Validates the passed input value and raises exception if it's are emtpy

    :param value: The passed input value
    """
    if not value:
        raise BadRequestError(
            f"{value} is not specified",
            details=FieldError(value, f"Please insert value for {value}."),
        )


@bp.route("/get_configurations")
@no_cache
@api_exc_handler(default_message="Failed to get configurations.")
@require_permission("configuration_details")
def get_configurations():
    """Get configuration details.

    :return: Returns configurations data as a JSON response
    """
    rdata = g.user.bam_api.v2.http_get(
        "/configurations",
        params={"orderBy": "desc(name)", "limit": "99"},
    )
    configurations = rdata["data"]
    return configurations


@bp.route("/update_configuration", methods=["PUT"])
@api_exc_handler(default_message="Failed to update configuration.")
@require_permission("configuration_details")
def update_configuration():
    """Update a configuration.

    :return: Returns update status as a JSON response
    """
    configuration: dict = json.loads(request.form["configuration"])
    configuration.pop("_links")
    entity_id = configuration["id"]

    print(configuration)
    validate_input(configuration["id"])
    validate_input(configuration["name"])

    g.user.bam_api.v2.http_put(f"/configurations/{entity_id}", json=configuration)
    return {"message": "Updated configuration successfully."}


@bp.route("/add_configuration", methods=["POST"])
@api_exc_handler(default_message="Failed to add configuration.")
@require_permission("configuration_details")
def add_configuration():
    """Add configuration.

    :return: Returns add configuration status as a JSON response
    """
    name = request.form["name"]
    description = request.form["description"]
    validate_input(name)
    g.user.bam_api.v2.http_post(
        "/configurations", json={"name": name, "description": description}
    )
    return {"message": f"Created configuration {name}."}


@bp.route("/delete_configuration/<id>", methods=["DELETE"])
@api_exc_handler(default_message="Failed to delete configuration.")
@require_permission("configuration_details")
def delete_configuration(id):  # pylint: disable=redefined-builtin
    """Delete a configuration.

    :return: Returns delete configuration status as a JSON response
    """
    g.user.bam_api.v2.http_delete(
        f"/configurations/{id}",
    )
    return {"message": "Deleted configuration successfully."}


@bp.route("/")
@no_cache
@page_exc_handler(default_message='Failed to load page "Configuration details".')
@require_permission("configuration_details")
def configuration_details():
    """
    Renders the configuration_details page
    :return: configuration_details page HTML.
    """
    return send_from_directory(
        os.path.dirname(os.path.abspath(str(__file__))),
        "html/configurationDetails/index.html",
    )

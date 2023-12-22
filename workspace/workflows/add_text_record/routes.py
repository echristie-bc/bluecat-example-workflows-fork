# Copyright 2023 BlueCat Networks Inc.

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
"""Routes and back-end implementation of workflow ``add_text_record``."""
import os

from flask import g, request, send_from_directory

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


def validate_form(zone_id, zone_name):
    """
    Validates the passed in value and raises exception if values are emtpy

    :param zone_id: The passed in zone ID
    :param zone_name: The passed zone name
    """
    if not zone_id:
        raise BadRequestError(
            "Zone is not specified",
            details=FieldError("zone", "Please select a zone."),
        )

    if not zone_name:
        raise BadRequestError(
            "Zone is not specified",
            details=FieldError("zone", "Please select a zone."),
        )


@bp.route("/")
@page_exc_handler(default_message='Failed to load page "Add text record".')
@require_permission("add_text_record")
def page():
    """
    Render page "Add text record".

    :return: Response with page HTML.
    """
    return send_from_directory(
        os.path.dirname(os.path.abspath(str(__file__))), "html/addTextRecord/index.html"
    )


@bp.route("/configurations")
@api_exc_handler(default_message="Failed to get configurations available on BAM.")
@require_permission("add_text_record")
def api_get_configurations():
    """
    Get configurations for the dropDown in the Add Text Record page
    """
    rdata = g.user.bam_api.v2.http_get(
        "/configurations",
        params={"fields": "id,name", "orderBy": "desc(name)", "limit": "9999"},
    )
    configurations = rdata["data"]
    return {"configurations": configurations}


@bp.route("/views", methods=["POST"])
@api_exc_handler(default_message="Failed to get views available on BAM.")
@require_permission("add_text_record")
def api_get_views():
    """
    Get views under the selected configuration in the Add Text Record page
    """
    configuration_id = request.form["configuration"]

    rdata = g.user.bam_api.v2.http_get(
        f"/configurations/{configuration_id}/views",
        params={"fields": "id,name", "orderBy": "desc(name)", "limit": "9999"},
    )
    views = rdata["data"]
    return {"views": views}


@bp.route("/zones", methods=["POST"])
@api_exc_handler(default_message="Failed to get zones available on BAM.")
@require_permission("add_text_record")
def api_get_zones():
    """
    Get zones under the selected view in the Add Text Record page
    """
    view_id = request.form["view"]
    rdata = g.user.bam_api.v2.http_get(
        f"/views/{view_id}/zones",
        params={
            "fields": "id,name",
            "orderBy": "desc(name)",
            "limit": "9999",
            "filter": "type:eq('Zone')",
        },
    )
    zones = rdata["data"]
    return {"zones": zones}


@bp.route("/", methods=["POST"])
@no_cache
@api_exc_handler(default_message="Failed to add text record.")
@require_permission("add_text_record")
def api_post_add_text_record():
    """
    Add a text record based on the provided parameters.
    The inputs are validated and an error response may be returned.
    """

    # Validate form data
    validate_form(
        request.form["zone_id"],
        request.form["zone_name"],
    )

    headers = {}
    if request.form["name"]:
        absolute_name = request.form["name"] + "." + request.form["zone_name"]
    else:
        absolute_name = None
        headers = {"x-bcn-same-as-zone": "true"}

    zone_id = request.form["zone_id"]
    body = {
        "type": "TXTRecord",
        "name": request.form["name"] if request.form["name"] else None,
        "text": request.form["text"] if request.form["text"] else None,
        "absoluteName": absolute_name,
    }

    # Attempt to add the text record
    text_record = g.user.bam_api.v2.http_post(
        f"/zones/{zone_id}/resourceRecords",
        params={"fields": "id,absoluteName", "orderBy": "desc(name)", "limit": "9999"},
        headers=headers,
        json=body,
    )

    return {
        "message": f"Successfully added Text Record {text_record['absoluteName']}. "
        f"Added with Object ID: {text_record['id']} successfully."
    }

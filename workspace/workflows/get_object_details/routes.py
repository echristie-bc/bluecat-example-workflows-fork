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
"""Routes and back-end implementation of page ``get_object_details``."""
import os

from flask import send_from_directory, g, request

# pylint: disable=import-error
from bluecat.gateway.decorators import (
    api_exc_handler,
    require_permission,
    page_exc_handler,
)
from bluecat.util import no_cache  # pylint: disable=import-error

from .base import bp


@bp.route("/")
@page_exc_handler(default_message='Failed to load page "Get object details".')
@require_permission("get_object_details")
def page():
    """
    Render page "Get object details".

    :return: Response with page HTML.
    """
    return send_from_directory(
        os.path.dirname(os.path.abspath(str(__file__))),
        "html/getObjectDetails/index.html",
    )


@bp.route("/object", methods=["GET"])
@no_cache
@api_exc_handler(default_message="Failed to retrieve object details from BAM.")
@require_permission("get_object_details")
def get_object_details():
    """
    Get object name and type by ID.
    """
    object_id = request.args["objectId"]
    rdata = g.user.bam_api.v2.http_get(f"/?filter=id:{object_id}")["data"]
    if rdata:
        data = {
            "name": rdata[0]["name"],
            "type": rdata[0]["type"],
        }
    else:
        data = None
    return {"data": data}

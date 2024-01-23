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

BASE_DIR := $(shell pwd)
export BASE_DIR

run-prep:
	mkdir -p logs
	-[ ! -f workspace/config.json ] \
		&& cp workspace/config.json.sample workspace/config.json
	-[ ! -f workspace/permissions.json ] \
		&& cp workspace/permissions.json.sample workspace/permissions.json

run: run-prep
	docker run --rm -d \
		-p 8001:8000 \
		-p 44301:44300 \
		-v "$(BASE_DIR)/workspace":/bluecat_gateway \
		-v "$(BASE_DIR)/logs":/logs \
	 	-u "$(shell id -u)" \
		--name example-workflows \
		quay.io/bluecat/gateway:23.2.2

stop:
	docker stop example-workflows

ui-req:
	make -f projects/add_text_record/Makefile ui-req
	make -f projects/get_object_details/Makefile ui-req
	make -f projects/configuration_details/Makefile ui-req
	make -f projects/manage_text_record/Makefile ui-req

ui-build:
	make -f projects/add_text_record/Makefile ui-build
	make -f projects/get_object_details/Makefile ui-build
	make -f projects/configuration_details/Makefile ui-build
	make -f projects/manage_text_record/Makefile ui-build


image-build:
	docker build --tag quay.io/bluecat/gateway_example_workflows_ci:23.2.0 .

build: ui-build image-build

clean:
	make -f projects/add_text_record/Makefile clean
	make -f projects/get_object_details/Makefile clean
	make -f projects/configuration_details/Makefile clean
	make -f projects/manage_text_record/Makefile clean

purge:
	make -f projects/add_text_record/Makefile purge
	make -f projects/get_object_details/Makefile purge
	make -f projects/configuration_details/Makefile purge

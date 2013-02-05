name=after
root=/usr/local
etc=${root}/etc
var=${root}/var
run=${var}/run

default:
	# Install local modules
	npm install
install-model:
	# Install basic model in couchdb
	./bin/main apps install models/app.js
	
install:
	# install lib and cli global
	sudo npm install -g
	# create database in couchdb using config.json data
	./tasks/install/db/create
	# create jobs folder
	cp -R jobs ${etc}/${name}
	# worker logs folder
	mkdir ${var}/${name}
	# worker process pids
	mkdir ${run}/${name}
	make install-model

update:
	# install lib and cli global
	npm install
	sudo npm install -g
	make install-model

uninstall:
	# Unistall modules to run jake tasks
	sudo npm uninstall ${name} -g
	# remove database created by installation
	./tasks/uninstall/db/destroy
	# remove jobs folder
	rm -rf ${etc}/${name}
	# remove worker logs folder
	rm -rf ${var}/${name}
	# remove worker process pids
	rm -rf ${run}/${name}
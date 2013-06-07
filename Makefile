name=after
root=/usr/local
etc=${root}/etc
var=${root}/var
run=${var}/run

default:
	# Install local modules
	npm install
	
clean:
	rm -rf node_modules
	rm -rf jobs/node_modules
	rm -rf app/node_modules
	
build-jobs:
	# Build default folder
	npm install  ./jobs --prefix ./jobs
	
create-folders:
	cp -R jobs ${etc}/${name}
	# worker logs folder
	mkdir ${var}/${name}
	# worker process pids
	mkdir ${run}/${name}
	
remove-folders:
	# remove jobs folder
	rm -rf ${etc}/${name}
	# remove worker logs folder
	rm -rf ${var}/${name}
	# remove worker process pids
	rm -rf ${run}/${name}

install-app:
	#sudo npm install grunt-cli -g
	# Install basic app in couchdb
	cd app
	npm install
	cd ..
	./tasks/install/db/push
	
update:
	# install lib and cli global
	make default
	# Upload the and web ui model to datastore 
	make install-app
	# install lib and cli global
	sudo npm install . -g
	
install:
	# Install default jobs deps
	make build-jobs
	# Create runinig directories
	make create-folders
	# create database in couchdb using config.json data
	./tasks/install/db/create
	make update

uninstall:
	# Unistall modules to run jake tasks
	sudo npm uninstall ${name} -g
	# remove database created by installation
	./tasks/uninstall/db/destroy
	make remove-folders
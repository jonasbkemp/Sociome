FROM ubuntu:16.04

RUN apt-get update -y

RUN apt-get install -y postgresql postgresql-contrib libpq-dev wget vim ed curl libcurl3-dev

USER postgres

RUN /etc/init.d/postgresql start &&\
    psql --command "CREATE USER root WITH SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD 'root';" &&\
    createdb root

USER root

RUN apt-get install -y software-properties-common apt-transport-https

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9 &&\
	add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/' && \
	apt-get update && \
	apt-get install -y r-base nodejs npm git && \
	ln -s /usr/bin/nodejs /usr/bin/node

ADD backend/R-scripts/InstallPackages.r /

RUN Rscript /InstallPackages.r

EXPOSE 8080
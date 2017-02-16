FROM ubuntu:16.04

MAINTAINER matthew.le@mssm.edu

RUN apt-get update -y

RUN apt-get install -y postgresql postgresql-contrib libpq-dev ed curl libcurl3-dev wget

# Create the root database
USER postgres
RUN /etc/init.d/postgresql start &&\
    psql --command "CREATE USER root WITH SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD 'root';" &&\
    createdb root

USER root

# Install dependencies
RUN apt-get install -y software-properties-common apt-transport-https && \
 	apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9 && \
	add-apt-repository 'deb [arch=amd64,i386] https://cran.rstudio.com/bin/linux/ubuntu xenial/' && \
	curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
	apt-get update && \
	apt-get install -y r-base nodejs

# Install necessary R packages
ADD backend/R-scripts/InstallPackages.r /
RUN Rscript /InstallPackages.r

# Add the working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

# Install Node.js dependencies
RUN npm install && npm run build

EXPOSE 80

CMD /etc/init.d/postgresql start && ./create_db.sh && PORT=80 npm start
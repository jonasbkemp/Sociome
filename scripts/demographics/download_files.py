#!/usr/bin/env python

from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import pdb
from dateutil import parser
import glob
import os

def downloadAll():
	gauth = GoogleAuth()
	gauth.LocalWebserverAuth()

	drive = GoogleDrive(gauth)

	if not(os.path.isdir('./data')):
		os.mkdir('data')

	# We should probably use smarter queries to locate the directory, 
	# but I keep getting invalid query errors...
	SOCIOME_FOLDER_ID = '0B0V0zio83s9WaUZoWHlyb042VEE'

	# Get every file in the Sociome/Data/Policy folder.
	file_list = drive.ListFile({'q' : "'%s' in parents" % SOCIOME_FOLDER_ID}).GetList()

	file_list.sort(key=lambda file: parser.parse(file['modifiedDate']))

	for file1 in file_list:
		if file1['title'] == 'EducationData.csv':
			print('Downloading %s...' % file1['title'])
			file1.GetContentFile('data/' + file1['title'], mimetype='text/csv')
 		if file1['title'] == 'PopDemographicsData.csv.fake_extension':
			print('Downloading %s...' % file1['title'])
 			newFilename = os.path.splitext(file1['title'])[0] # remove the fake extension
 			file1.GetContentFile('data/' + newFilename, mimetype='text/csv')

if __name__ == '__main__':
	downloadAll()



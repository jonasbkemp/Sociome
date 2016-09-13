#!/usr/bin/env python

from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import pdb
from dateutil import parser
import openpyxl as xl
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
	SOCIOME_FOLDER_ID = '0B0V0zio83s9WY3ktS3lhalRvYlk'

	# Get every file in the Sociome/Data/Policy folder.
	file_list = drive.ListFile({'q' : "'%s' in parents" % SOCIOME_FOLDER_ID}).GetList()

	file_list.sort(key=lambda file: parser.parse(file['modifiedDate']))

	for file1 in file_list:
		print('Downloading %s...' % file1['title'])
		if file1.get('exportLinks') and file1.get('exportLinks')['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']:
			file1.GetContentFile('data/' + file1['title'], mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
		else:
			file1.GetContentFile('data/' + file1['title'], mimetype='application/vnd.google-apps.spreadsheet')


if __name__ == '__main__':
	downloadAll()



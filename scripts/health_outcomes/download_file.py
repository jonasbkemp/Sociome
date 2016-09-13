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
	SOCIOME_FOLDER_ID = '0B0V0zio83s9WZlR3Y3BmU1FpMms'

	# Get every file in the Sociome/Data/Policy folder.
	file_list = drive.ListFile({'q' : "'%s' in parents" % SOCIOME_FOLDER_ID}).GetList()

	file_list.sort(key=lambda file: parser.parse(file['modifiedDate']))

	for file1 in file_list:

		if file1['title'] == '2016CHR_CSV_Trend_Data.csv':
			file1.GetContentFile('data/' + file1['title'], mimetype='text/csv')


if __name__ == '__main__':
	downloadAll()

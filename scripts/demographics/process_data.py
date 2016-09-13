#!/usr/bin/env python

import process_education
import process_population
import sys
import glob
import download_files

if len(glob.glob('data/*.csv')) != 2:
	download_files.downloadAll()

outStream = open('script.txt', 'w')
process_population.main(outStream)
process_education.main(outStream)

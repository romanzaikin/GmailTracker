#!/usr/bin/python
import cgi
import MySQLdb
import os
import httpagentparser

from geoip import geolite2
from datetime import datetime


i = datetime.now()

form = cgi.FieldStorage()
uuid = MySQLdb.escape_string(form.getvalue("code"))

user_agent = os.environ["HTTP_USER_AGENT"]
ip = os.environ["REMOTE_ADDR"]

try:
	geo = geolite2.lookup(ip)
	country = geo.country
except:
	country = ""

if uuid :
	db = MySQLdb.connect("localhost","root","toor","gmail")
	cursor = db.cursor()

	if "GoogleImageProxy" not in user_agent:
	        object = httpagentparser.detect(user_agent)
			
			# Protect against SQLi via User agent ;)
        	if object["bot"] == False:
	                os_version      = MySQLdb.escape_string(object["platform"]["version"])
	                os_name         = MySQLdb.escape_string(object["platform"]["name"])
        	        browser_version = MySQLdb.escape_string(object["browser"]["version"])
	                browser         = MySQLdb.escape_string(object["browser"]["name"])
			
			sql = 'INSERT INTO meta(`code_id`,`os`,`os_version`,`browser`,`browser_version`,`ip`,`geo_location`,`open_time`) SELECT  id ,"{0}","{1}","{2}","{3}","{4}","{5}","{6}" FROM track WHERE uuid="{7}"'.format(os_name, os_version,browser, browser_version, ip, country, str(i.strftime('%Y/%m/%d %H:%M:%S')), uuid)

			cursor.execute(sql)
			db.commit()
	
	# Get first open date
	cursor.execute('SELECT * FROM track WHERE uuid="%s" AND FirstOpen is NULL' % (uuid))
	
	if cursor.fetchall():
		cursor.execute('UPDATE track SET FirstOpen="%s" WHERE uuid="%s"' % (str(i.strftime('%Y/%m/%d %H:%M:%S')) ,uuid))

	cursor.execute('UPDATE track SET verify=verify+1 WHERE uuid="%s"' % (uuid))
	db.commit()
	db.close()

print "Accept-Ranges: bytes"
print "Content-Type: image/png \r\n"
print file("assets/images/pixel.png").read()

#!/usr/bin/python
import cgi
import MySQLdb
import json


form = cgi.FieldStorage();

title = MySQLdb.escape_string(form.getvalue('_'))
uuid = MySQLdb.escape_string(form.getvalue('__'))
email = MySQLdb.escape_string(form.getvalue('___'))

db = MySQLdb.connect("localhost","root","toor","gmail")
cursor = db.cursor()

print "Content-type: text/html \r\n"

if uuid and title:
	cursor.execute("INSERT INTO track (`title`,`uuid`,`verify`,`email`) VALUES ('{0}','{1}',0,'{2}')".format(title, uuid, email))
	db.commit()

elif title:
	cursor.execute('SELECT uuid FROM track WHERE email="{0}" and title="{1}"'.format(email, title)
	results = cursor.fetchall()
	print json.dumps(results)

else:
	dataObject = []
	meta_text = ""
			
	cursor.execute('SELECT title,verify,uuid,FirstOpen FROM track WHERE email="{0}"'.format(email))
	results = cursor.fetchall()
	
	for result in results:
		dataObject.append(list(result))
		cursor.execute('SELECT meta.* FROM meta,track WHERE meta.code_id=track.id AND track.uuid = "{0}"'.format(result[2]))
		meta_data = cursor.fetchall()

		for meta in meta_data:
			meta_text += "recipient info:  OS:{0} {1}  Browser:{2} {3}  Location:{4}  IP:{5}  AT:{6}&#013;".format(meta[1],meta[2],meta[3],meta[4],meta[6],meta[5],meta[7])
		
		dataObject[len(dataObject)-1].append(meta_text)
	print json.dumps(dataObject)

db.close()

#!/usr/bin/python
import cgi
import MySQLdb


form = cgi.FieldStorage()
link = MySQLdb.escape_string(form.getvalue("link"))
uuid = MySQLdb.escape_string(form.getvalue("__"))

if uuid :
	db = MySQLdb.connect("localhost","root","toor","gmail")
	cursor = db.cursor()
	
	cursor.execute('SELECT * FROM link WHERE uuid="{0}" AND link="{1}"'.format(uuid,link))
	results = cursor.fetchone()
	if results:	
		sql='UPDATE link SET counter=counter+1 WHERE uuid="{0}"'.format(uuid)
	else:
		sql='INSERT INTO link(`uuid`,`link`,`counter`) VALUES ("{0}","{1}",0)'.format(uuid,link)

	cursor.execute(sql)
	db.commit()
	db.close()

print 'Content-Type: text/html \r\n'
print '<META HTTP-EQUIV=refresh CONTENT="0;URL={0}">'.format(link)

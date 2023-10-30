from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import config
import jwt
import datetime
from functools import wraps
import psycopg2
import wsgiserver
import mysql.connector
import cx_Oracle
import pyodbc

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiaG9tZXJvLmxlbW9zIiwiZXhwIjoxNjY4NjE5MzU1fQ.pGxGIgoWql1HZ3er6nON_KU4TI_awVjJorhREHd3sao'

@app.route('/login/<username>')
def login(username):
    con = psycopg2.connect(f'host={config.hostPG} dbname={config.dbPG} user={config.userPG} password={config.passwordPG}')
    cur = con.cursor()
    select_query = f"""SELECT * FROM table;"""         
    cur.execute(select_query)
    result = cur.fetchone()[0]
    cur.close()
    con.close()
    if result:
        token = jwt.encode({'user' : username, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(hours=3)}, app.config['SECRET_KEY'])
        return jsonify({'token' : token})
    return make_response('Could not verify!', 401, {'WWW-Authenticate' : 'Basic realm="Login Required'})

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.args.get('token')
        if not token:
            return jsonify({'message' : 'Token is missing!'}), 403
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
        except:
            return jsonify({'message' : 'Token is invalid!'}), 403
        return f(*args, **kwargs)
    return decorated

#------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

@app.route('/api/pg/<pg>', methods=['GET'])
#@token_required
def pg_connection(pg):
    con = psycopg2.connect(f'host={config.host_pg} dbname={config.db_pg} user={config.user_pg} password={config.password_pg}')
    cur = con.cursor()
    select_query = f"""SELECT * FROM table;"""         
    cur.execute(select_query)
    field_names = [i[0] for i in cur.description]
    results = []
    for row in cur.fetchall():
        results.append(dict(zip(field_names, row)))
    cur.close()
    con.close()
    return results

@app.route('/api/oracle/<oracle>', methods=['GET'])
#@token_required
def oracle_connection(oracle_param):
    con = cx_Oracle.connect(config.oracle_connection)
    cur = con.cursor()
    select_query = f"""SELECT * FROM table;"""         
    cur.execute(select_query)
    field_names = [i[0] for i in cur.description]
    results = []
    for row in cur.fetchall():
        results.append(dict(zip(field_names, row)))
    cur.close()
    con.close()
    return results

@app.route('/api/mysql/<mysql_param>', methods=['GET'])
#@token_required
def mysql_connection(mysql_param):
    con = mysql.connector.connect(host=config.host_mysql, database=config.dbPG_mysql, user=config.userPG_mysql, password=config.passwordPG_mysql)
    cur = con.cursor()
    select_query = f"""SELECT * FROM table;"""         
    cur.execute(select_query)
    field_names = [i[0] for i in cur.description]
    results = []
    for row in cur.fetchall():
        results.append(dict(zip(field_names, row)))
    cur.close()
    con.close()
    return results

@app.route('/api/sqlserver/<sqlserver>', methods=['GET'])
#@token_required
def sqlserver_connection(sqlserver_param):
    con = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER={config.host_sqlserver};DATABASE={config.db_sqlserver};UID={config.user_sqlserver};PWD={config.password_sqlserver}')
    cur = con.cursor()
    select_query = f"""SELECT * FROM table;"""         
    cur.execute(select_query)
    field_names = [i[0] for i in cur.description]
    results = []
    for row in cur.fetchall():
        results.append(dict(zip(field_names, row)))
    cur.close()
    con.close()
    return results

if __name__ == '__main__':
    #Debug/Development
    #app.run(port=5500,host='localhost',debug=True, ssl_context=('cert.pem', 'server.key'))
    #app.run(port=5500,host='localhost',debug=True)
    #Production
    http_server = wsgiserver.WSGIServer(app, host=f'{config.host_pg}', port= 5500)
    http_server.start()

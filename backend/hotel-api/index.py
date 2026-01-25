import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления этажами, номерами и бронированиями отеля'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Path, X-Floor-Id, X-Room-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    path_header = headers.get('X-Path', '')
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if path_header == 'floors':
            if method == 'GET':
                cur.execute('SELECT * FROM floors ORDER BY floor_number')
                floors = cur.fetchall()
                return success_response([dict(f) for f in floors])
            
            elif method == 'POST':
                data = json.loads(event.get('body', '{}'))
                floor_number = data.get('floor_number')
                plan_image_url = data.get('plan_image_url')
                
                cur.execute(
                    'INSERT INTO floors (floor_number, plan_image_url) VALUES (%s, %s) RETURNING *',
                    (floor_number, plan_image_url)
                )
                conn.commit()
                floor = cur.fetchone()
                return success_response(dict(floor))
            
            elif method == 'PUT':
                data = json.loads(event.get('body', '{}'))
                floor_id = data.get('id')
                plan_image_url = data.get('plan_image_url')
                
                cur.execute(
                    'UPDATE floors SET plan_image_url = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *',
                    (plan_image_url, floor_id)
                )
                conn.commit()
                floor = cur.fetchone()
                return success_response(dict(floor))
            
            elif method == 'DELETE':
                floor_id = headers.get('X-Floor-Id')
                cur.execute('DELETE FROM rooms WHERE floor_id = %s', (floor_id,))
                cur.execute('DELETE FROM floors WHERE id = %s', (floor_id,))
                conn.commit()
                return success_response({'message': 'Floor deleted'})
        
        elif path_header == 'floors/duplicate':
            if method == 'POST':
                data = json.loads(event.get('body', '{}'))
                floor_id = data.get('floor_id')
                new_floor_number = data.get('new_floor_number')
                
                cur.execute('SELECT * FROM floors WHERE id = %s', (floor_id,))
                original_floor = cur.fetchone()
                
                if not original_floor:
                    return error_response('Floor not found', 404)
                
                cur.execute(
                    'INSERT INTO floors (floor_number, plan_image_url) VALUES (%s, %s) RETURNING *',
                    (new_floor_number, original_floor['plan_image_url'])
                )
                new_floor = cur.fetchone()
                
                cur.execute('SELECT * FROM rooms WHERE floor_id = %s', (floor_id,))
                rooms = cur.fetchall()
                
                for room in rooms:
                    cur.execute(
                        '''INSERT INTO rooms (floor_id, room_number, category, price, position_x, position_y, status)
                           VALUES (%s, %s, %s, %s, %s, %s, %s)''',
                        (new_floor['id'], room['room_number'], room['category'], room['price'], 
                         room['position_x'], room['position_y'], room['status'])
                    )
                
                conn.commit()
                return success_response(dict(new_floor))
        
        elif path_header == 'rooms':
            if method == 'GET':
                floor_id = headers.get('X-Floor-Id')
                if floor_id:
                    cur.execute('SELECT * FROM rooms WHERE floor_id = %s ORDER BY room_number', (floor_id,))
                else:
                    cur.execute('SELECT * FROM rooms ORDER BY floor_id, room_number')
                rooms = cur.fetchall()
                rooms_list = []
                for r in rooms:
                    room_dict = dict(r)
                    if room_dict.get('polygon'):
                        room_dict['polygon'] = json.loads(room_dict['polygon'])
                    if room_dict.get('media'):
                        if isinstance(room_dict['media'], str):
                            room_dict['media'] = json.loads(room_dict['media'])
                    else:
                        room_dict['media'] = []
                    rooms_list.append(room_dict)
                return success_response(rooms_list)
            
            elif method == 'POST':
                data = json.loads(event.get('body', '{}'))
                polygon_json = json.dumps(data.get('polygon')) if data.get('polygon') else None
                try:
                    cur.execute(
                        '''INSERT INTO rooms (floor_id, room_number, category, price, position_x, position_y, 
                           width, height, polygon, status)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *''',
                        (data['floor_id'], data['room_number'], data['category'], 
                         data['price'], data['position_x'], data['position_y'],
                         data.get('width'), data.get('height'), polygon_json,
                         data.get('status', 'available'))
                    )
                    conn.commit()
                    room = cur.fetchone()
                    room_dict = dict(room)
                    if room_dict.get('polygon'):
                        room_dict['polygon'] = json.loads(room_dict['polygon'])
                    if room_dict.get('media'):
                        if isinstance(room_dict['media'], str):
                            room_dict['media'] = json.loads(room_dict['media'])
                    else:
                        room_dict['media'] = []
                    return success_response(room_dict)
                except Exception as e:
                    conn.rollback()
                    error_msg = str(e)
                    if 'rooms_floor_id_room_number_key' in error_msg or 'duplicate key' in error_msg.lower():
                        return error_response(f"Номер {data['room_number']} уже существует на этом этаже", 409)
                    return error_response(f"Ошибка создания номера: {error_msg}", 500)
            
            elif method == 'PUT':
                data = json.loads(event.get('body', '{}'))
                room_id = data.get('id')
                polygon_json = json.dumps(data.get('polygon')) if data.get('polygon') else None
                media_json = json.dumps(data.get('media')) if data.get('media') else None
                cur.execute(
                    '''UPDATE rooms SET room_number = %s, category = %s, price = %s, 
                       position_x = %s, position_y = %s, width = %s, height = %s, polygon = %s,
                       status = %s, media = %s, updated_at = CURRENT_TIMESTAMP 
                       WHERE id = %s RETURNING *''',
                    (data['room_number'], data['category'], data['price'], 
                     data['position_x'], data['position_y'], data.get('width'), data.get('height'),
                     polygon_json, data['status'], media_json, room_id)
                )
                conn.commit()
                room = cur.fetchone()
                room_dict = dict(room)
                if room_dict.get('polygon'):
                    room_dict['polygon'] = json.loads(room_dict['polygon'])
                if room_dict.get('media'):
                    if isinstance(room_dict['media'], str):
                        room_dict['media'] = json.loads(room_dict['media'])
                else:
                    room_dict['media'] = []
                return success_response(room_dict)
            
            elif method == 'DELETE':
                room_id = headers.get('X-Room-Id')
                cur.execute('DELETE FROM rooms WHERE id = %s', (room_id,))
                conn.commit()
                return success_response({'message': 'Room deleted'})
        
        elif path_header == 'bookings':
            if method == 'GET':
                cur.execute('''
                    SELECT b.*, r.room_number, r.category, f.floor_number 
                    FROM bookings b
                    JOIN rooms r ON b.room_id = r.id
                    JOIN floors f ON r.floor_id = f.id
                    ORDER BY b.created_at DESC
                ''')
                bookings = cur.fetchall()
                return success_response([dict(b) for b in bookings])
            
            elif method == 'POST':
                data = json.loads(event.get('body', '{}'))
                cur.execute(
                    '''INSERT INTO bookings (room_id, guest_name, guest_email, guest_phone, 
                       check_in, check_out, total_price, status)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *''',
                    (data['room_id'], data['guest_name'], data['guest_email'], 
                     data.get('guest_phone'), data['check_in'], data['check_out'], 
                     data['total_price'], data.get('status', 'pending'))
                )
                conn.commit()
                booking = cur.fetchone()
                return success_response(dict(booking))
        
        return error_response('Invalid path: ' + path_header, 404)
    
    except Exception as e:
        conn.rollback()
        return error_response(str(e), 500)
    
    finally:
        cur.close()
        conn.close()

def success_response(data):
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data, default=str),
        'isBase64Encoded': False
    }

def error_response(message, status=400):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }
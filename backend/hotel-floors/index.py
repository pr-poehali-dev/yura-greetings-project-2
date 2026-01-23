import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения схем этажей и номеров отеля'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            raise Exception('DATABASE_URL not configured')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute('''
            SELECT 
                id, floor_number, plan_image_url
            FROM t_p94662493_yura_greetings_proje.floors
            ORDER BY floor_number
        ''')
        
        floors_data = cur.fetchall()
        floors = []
        
        for floor_row in floors_data:
            floor_id, floor_number, plan_image_url = floor_row
            
            cur.execute('''
                SELECT 
                    id, room_number, category, price, 
                    position_x, position_y, status, 
                    width, height, polygon
                FROM t_p94662493_yura_greetings_proje.rooms
                WHERE floor_id = %s
                ORDER BY room_number
            ''', (floor_id,))
            
            rooms_data = cur.fetchall()
            rooms = []
            
            for room_row in rooms_data:
                room_id, room_number, category, price, pos_x, pos_y, status, width, height, polygon = room_row
                
                room_obj = {
                    'id': room_id,
                    'number': room_number,
                    'category': category,
                    'price': float(price),
                    'position_x': float(pos_x),
                    'position_y': float(pos_y),
                    'status': status,
                    'width': width,
                    'height': height,
                    'polygon': json.loads(polygon) if polygon else None
                }
                rooms.append(room_obj)
            
            floors.append({
                'id': floor_id,
                'floor_number': floor_number,
                'plan_image_url': plan_image_url,
                'rooms': rooms
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'floors': floors}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

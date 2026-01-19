import json
import os
import base64
import boto3
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для загрузки изображений в S3 хранилище'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return error_response('Method not allowed', 405)
    
    try:
        data = json.loads(event.get('body', '{}'))
        base64_data = data.get('file')
        filename = data.get('filename', f'floor-{datetime.now().timestamp()}.png')
        
        if not base64_data:
            return error_response('No file provided', 400)
        
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]
        
        file_content = base64.b64decode(base64_data)
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        key = f'hotel/floors/{filename}'
        
        s3.put_object(
            Bucket='files',
            Key=key,
            Body=file_content,
            ContentType='image/png'
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'url': cdn_url}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return error_response(str(e), 500)

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

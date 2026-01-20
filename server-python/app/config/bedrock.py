import os
import boto3
from botocore.config import Config

AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
MODEL_ID = 'us.anthropic.claude-sonnet-4-5-20250929-v1:0'

# Configure retry strategy
retry_config = Config(
    region_name=AWS_REGION,
    retries={
        'max_attempts': 3,
        'mode': 'adaptive'
    }
)

# Create Bedrock Runtime client
bedrock_client = boto3.client(
    service_name='bedrock-runtime',
    region_name=AWS_REGION,
    config=retry_config
)

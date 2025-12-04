"""
Configuration file for Python TikTok Live Backend
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask Server Configuration
FLASK_HOST = os.getenv('FLASK_HOST', '127.0.0.1')
FLASK_PORT = int(os.getenv('FLASK_PORT', '5000'))
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# Node.js WebSocket Configuration
NODEJS_WS_URL = os.getenv('NODEJS_WS_URL', 'ws://localhost:3000')
NODEJS_WS_TOKEN = os.getenv('NODEJS_WS_TOKEN', '')  # Optional auth token

# TikTok Configuration
TIKTOK_PROCESS_INITIAL_DATA = os.getenv('TIKTOK_PROCESS_INITIAL_DATA', 'False').lower() == 'true'
TIKTOK_ENABLE_EXTENDED_GIFT_INFO = os.getenv('TIKTOK_ENABLE_EXTENDED_GIFT_INFO', 'True').lower() == 'true'

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# Reconnection Configuration
WS_RECONNECT_INTERVAL = int(os.getenv('WS_RECONNECT_INTERVAL', '5'))  # seconds
WS_MAX_RECONNECT_ATTEMPTS = int(os.getenv('WS_MAX_RECONNECT_ATTEMPTS', '10'))


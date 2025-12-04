"""
Flask HTTP Server for Python TikTok Live Backend
Provides API endpoints to control TikTok Live connection
"""
import asyncio
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from tiktok_service import TikTokLiveService
from websocket_client import WebSocketClient
from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG, LOG_LEVEL, LOG_FORMAT

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize services
tiktok_service = TikTokLiveService()
ws_client = WebSocketClient()

# Event loop for async operations
loop = None


def get_or_create_event_loop():
    """
    Get or create event loop for async operations
    """
    global loop
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop


# Set up event callback to forward TikTok events to WebSocket
def forward_tiktok_event(event_data):
    """
    Forward TikTok Live events to Node.js via WebSocket
    """
    try:
        ws_client.send_event(event_data)
    except Exception as e:
        logger.error(f"Error forwarding event: {e}")


tiktok_service.set_event_callback(forward_tiktok_event)


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "service": "Python TikTok Live Backend",
        "version": "1.0.0"
    }), 200


@app.route('/status', methods=['GET'])
def get_status():
    """
    Get current connection status
    """
    try:
        tiktok_status = tiktok_service.get_status()
        ws_status = ws_client.get_status()
        
        return jsonify({
            "success": True,
            "data": {
                "isConnected": tiktok_status["isConnected"],
                "username": tiktok_status["username"],
                "roomId": tiktok_status["roomId"],
                "viewerCount": tiktok_status["viewerCount"],
                "websocketConnected": ws_status["isConnected"],
                "websocketQueueSize": ws_status["queueSize"]
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        return jsonify({
            "success": False,
            "message": f"Error getting status: {str(e)}"
        }), 500


@app.route('/connect', methods=['POST'])
def connect_tiktok():
    """
    Connect to TikTok Live stream
    
    Request body:
    {
        "username": "tiktok_username",
        "sessionId": "optional_session_cookie"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'username' not in data:
            return jsonify({
                "success": False,
                "message": "Username is required"
            }), 400
        
        username = data['username']
        session_id = data.get('sessionId', None)
        
        # Check if already connected
        if tiktok_service.is_connected:
            return jsonify({
                "success": False,
                "message": "Already connected to a live stream. Disconnect first."
            }), 400
        
        # Connect to TikTok Live (synchronous now)
        result = tiktok_service.connect(username, session_id)
        
        logger.info(f"✅ Connected to TikTok Live: @{username}")
        
        return jsonify({
            "success": True,
            "message": "Connected to TikTok Live successfully",
            "data": result
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error connecting to TikTok Live: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route('/disconnect', methods=['POST'])
def disconnect_tiktok():
    """
    Disconnect from TikTok Live stream
    """
    try:
        if not tiktok_service.is_connected:
            return jsonify({
                "success": False,
                "message": "Not connected to any live stream"
            }), 400
        
        tiktok_service.disconnect()
        
        logger.info("🔌 Disconnected from TikTok Live")
        
        return jsonify({
            "success": True,
            "message": "Disconnected from TikTok Live"
        }), 200
        
    except Exception as e:
        logger.error(f"Error disconnecting: {e}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


def start_services():
    """
    Start background services (WebSocket client)
    """
    logger.info("🚀 Starting background services...")
    
    # Start WebSocket client
    try:
        ws_client.connect()
        logger.info("✅ WebSocket client started")
    except Exception as e:
        logger.error(f"❌ Failed to start WebSocket client: {e}")


def stop_services():
    """
    Stop background services
    """
    logger.info("🛑 Stopping background services...")
    
    # Disconnect TikTok if connected
    if tiktok_service.is_connected:
        tiktok_service.disconnect()
    
    # Disconnect WebSocket
    ws_client.disconnect()
    
    logger.info("✅ Services stopped")


if __name__ == '__main__':
    try:
        # Start background services
        start_services()
        
        # Start Flask server
        logger.info(f"🚀 Starting Flask server on {FLASK_HOST}:{FLASK_PORT}")
        app.run(
            host=FLASK_HOST,
            port=FLASK_PORT,
            debug=FLASK_DEBUG,
            threaded=True  # Enable threading for concurrent requests
        )
    except KeyboardInterrupt:
        logger.info("\n⚠️ Received shutdown signal")
    finally:
        # Cleanup on exit
        stop_services()
        logger.info("👋 Python TikTok Live Backend stopped")


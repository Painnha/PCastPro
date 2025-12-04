"""
WebSocket Client to connect to Node.js backend
Forwards TikTok Live events to Node.js WebSocket server
"""
import json
import logging
import time
import threading
from queue import Queue
from typing import Optional, Dict, Any
import websocket
from config import NODEJS_WS_URL, WS_RECONNECT_INTERVAL, WS_MAX_RECONNECT_ATTEMPTS

# Configure logging
logger = logging.getLogger(__name__)


class WebSocketClient:
    """
    WebSocket client to connect to Node.js backend and forward events
    """
    
    def __init__(self, ws_url: str = NODEJS_WS_URL):
        self.ws_url = ws_url
        self.ws: Optional[websocket.WebSocketApp] = None
        self.is_connected = False
        self.is_running = False
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = WS_MAX_RECONNECT_ATTEMPTS
        self.reconnect_interval = WS_RECONNECT_INTERVAL
        
        # Message queue for thread-safe sending
        self.message_queue: Queue = Queue()
        
        # Thread for running WebSocket
        self.ws_thread: Optional[threading.Thread] = None
        self.queue_thread: Optional[threading.Thread] = None
        
    def connect(self):
        """
        Start WebSocket connection to Node.js backend
        """
        if self.is_running:
            logger.warning("WebSocket client is already running")
            return
        
        self.is_running = True
        
        # Start WebSocket in separate thread
        self.ws_thread = threading.Thread(target=self._run_websocket, daemon=True)
        self.ws_thread.start()
        
        # Start queue processor thread
        self.queue_thread = threading.Thread(target=self._process_queue, daemon=True)
        self.queue_thread.start()
        
        logger.info(f"🔌 WebSocket client started, connecting to {self.ws_url}")
    
    def disconnect(self):
        """
        Disconnect from WebSocket
        """
        self.is_running = False
        
        if self.ws:
            try:
                self.ws.close()
            except Exception as e:
                logger.error(f"Error closing WebSocket: {e}")
        
        self.is_connected = False
        logger.info("🔌 WebSocket client disconnected")
    
    def send_event(self, event_data: Dict[str, Any]):
        """
        Send event to Node.js backend (thread-safe)
        
        Args:
            event_data: Event data dictionary to send
        """
        try:
            # Add to queue for thread-safe sending
            self.message_queue.put(event_data)
        except Exception as e:
            logger.error(f"Error queueing message: {e}")
    
    def _process_queue(self):
        """
        Process message queue and send to WebSocket
        """
        while self.is_running:
            try:
                # Get message from queue (blocking with timeout)
                event_data = self.message_queue.get(timeout=1)
                
                # Only send if connected
                if self.is_connected and self.ws:
                    try:
                        message = json.dumps(event_data)
                        self.ws.send(message)
                        logger.debug(f"📤 Sent event: {event_data.get('type', 'unknown')}")
                    except Exception as e:
                        logger.error(f"Error sending message: {e}")
                        # Put message back in queue to retry
                        self.message_queue.put(event_data)
                        time.sleep(1)
                else:
                    # Not connected, put message back and wait
                    self.message_queue.put(event_data)
                    time.sleep(1)
                    
            except Exception:
                # Queue timeout or other error
                continue
    
    def _run_websocket(self):
        """
        Run WebSocket connection with auto-reconnect
        """
        while self.is_running:
            try:
                # Create WebSocket app
                self.ws = websocket.WebSocketApp(
                    self.ws_url,
                    on_open=self._on_open,
                    on_message=self._on_message,
                    on_error=self._on_error,
                    on_close=self._on_close
                )
                
                # Run WebSocket (blocking)
                self.ws.run_forever()
                
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
            
            # Handle reconnection
            if self.is_running:
                self.reconnect_attempts += 1
                
                if self.reconnect_attempts <= self.max_reconnect_attempts:
                    logger.info(f"🔄 Reconnecting in {self.reconnect_interval}s (attempt {self.reconnect_attempts}/{self.max_reconnect_attempts})...")
                    time.sleep(self.reconnect_interval)
                else:
                    logger.error(f"❌ Max reconnection attempts ({self.max_reconnect_attempts}) reached. Stopping.")
                    self.is_running = False
                    break
    
    def _on_open(self, ws):
        """
        Called when WebSocket connection is established
        """
        self.is_connected = True
        self.reconnect_attempts = 0
        logger.info("✅ WebSocket connected to Node.js backend")
    
    def _on_message(self, ws, message):
        """
        Called when a message is received from Node.js
        """
        try:
            data = json.loads(message)
            logger.debug(f"📥 Received from Node.js: {data.get('type', 'unknown')}")
        except Exception as e:
            logger.error(f"Error parsing message: {e}")
    
    def _on_error(self, ws, error):
        """
        Called when WebSocket error occurs
        """
        logger.error(f"❌ WebSocket error: {error}")
        self.is_connected = False
    
    def _on_close(self, ws, close_status_code, close_msg):
        """
        Called when WebSocket connection is closed
        """
        self.is_connected = False
        logger.info(f"🔌 WebSocket closed (code: {close_status_code}, msg: {close_msg})")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get WebSocket connection status
        
        Returns:
            Dictionary with status information
        """
        return {
            "isConnected": self.is_connected,
            "isRunning": self.is_running,
            "reconnectAttempts": self.reconnect_attempts,
            "queueSize": self.message_queue.qsize()
        }


"""
TikTok Live Service
Handles connection to TikTok Live streams and processes events
Based on official TikTokLive documentation: https://github.com/isaackogan/TikTokLive
"""
import logging
import threading
from datetime import datetime
from typing import Callable, Optional, Dict, Any

from TikTokLive import TikTokLiveClient
from TikTokLive.types.events import (
    ConnectEvent,
    DisconnectEvent,
    CommentEvent,
    GiftEvent,
    JoinEvent,
    FollowEvent,
    ShareEvent,
    LikeEvent
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TikTokLiveService:
    """
    Service class to handle TikTok Live connections and events
    """
    
    def __init__(self):
        self.client: Optional[TikTokLiveClient] = None
        self.is_connected: bool = False
        self.username: str = ''
        self.room_id: str = ''
        self.viewer_count: int = 0
        self.client_thread: Optional[threading.Thread] = None
        
        # Callback for forwarding events
        self.event_callback: Optional[Callable[[Dict[str, Any]], None]] = None
        
    def set_event_callback(self, callback: Callable[[Dict[str, Any]], None]):
        """
        Set callback function to forward events
        """
        self.event_callback = callback
        
    def _send_event(self, event_data: Dict[str, Any]):
        """
        Send event to callback if available
        """
        if self.event_callback:
            try:
                self.event_callback(event_data)
            except Exception as e:
                logger.error(f"Error in event callback: {e}")
    
    def connect(self, username: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Connect to TikTok Live stream
        
        Args:
            username: TikTok username or unique_id
            session_id: Optional session cookie for authentication
            
        Returns:
            Dictionary with connection result
        """
        if self.is_connected:
            raise Exception("Already connected to a live stream")
        
        try:
            # Clean username (remove @ if present)
            self.username = username.lstrip('@')
            
            logger.info(f"🌐 Creating TikTok Live client for @{self.username}")
            
            # Create client with extended gift info enabled
            self.client = TikTokLiveClient(
                unique_id=f"@{self.username}",
                **({} if not session_id else {"web_proxy_cookies": {"sessionid": session_id.strip()}})
            )
            
            # Register event handlers BEFORE running
            self._register_event_handlers()
            
            # Run client in separate daemon thread
            def run_client():
                try:
                    logger.info(f"🚀 Starting TikTok Live client...")
                    self.client.run()
                except Exception as e:
                    logger.error(f"❌ Client error: {e}")
                    self.is_connected = False
                    self._send_event({
                        "type": "tiktok-error",
                        "data": {"error": str(e)}
                    })
            
            self.client_thread = threading.Thread(target=run_client, daemon=True)
            self.client_thread.start()
            
            # Wait a bit for connection to establish
            import time
            time.sleep(2)
            
            self.is_connected = True
            
            logger.info(f"✅ Connected to TikTok Live: @{self.username}")
            
            return {
                "success": True,
                "username": self.username,
                "roomId": self.room_id,
                "isConnected": True
            }
            
        except Exception as e:
            logger.error(f"❌ Error connecting to TikTok Live: {e}")
            self.is_connected = False
            self.client = None
            raise Exception(f"Failed to connect to TikTok Live: {str(e)}")
    
    def disconnect(self):
        """
        Disconnect from TikTok Live stream
        """
        if not self.is_connected or not self.client:
            return
        
        try:
            if self.client:
                try:
                    self.client.disconnect()
                except Exception as e:
                    logger.warning(f"Disconnect warning: {e}")
            
            self.is_connected = False
            self.username = ''
            self.room_id = ''
            self.viewer_count = 0
            
            # Send disconnected event
            self._send_event({
                "type": "tiktok-disconnected",
                "data": {}
            })
            
            logger.info("🔌 Disconnected from TikTok Live")
            
        except Exception as e:
            logger.error(f"Error disconnecting: {e}")
    
    def _register_event_handlers(self):
        """
        Register event handlers for TikTok Live client
        Uses class-based decorators as per official documentation
        """
        if not self.client:
            return
        
        # Connection established
        @self.client.on(ConnectEvent)
        async def on_connect(event: ConnectEvent):
            """Handle connection event"""
            try:
                self.room_id = str(event.room_id)
                logger.info(f"🟢 Connected to room: {self.room_id}")
                
                # Send connected event
                self._send_event({
                    "type": "tiktok-connected",
                    "data": {
                        "username": self.username,
                        "viewerCount": self.viewer_count
                    }
                })
            except Exception as e:
                logger.error(f"Error in on_connect: {e}")
        
        # Disconnection
        @self.client.on(DisconnectEvent)
        async def on_disconnect(event: DisconnectEvent):
            """Handle disconnect event"""
            try:
                logger.info("🔴 Disconnected from TikTok Live")
                self.is_connected = False
                
                # Send disconnected event
                self._send_event({
                    "type": "tiktok-disconnected",
                    "data": {
                        "reason": "Stream ended or connection lost"
                    }
                })
            except Exception as e:
                logger.error(f"Error in on_disconnect: {e}")
        
        # Comments
        @self.client.on(CommentEvent)
        async def on_comment(event: CommentEvent):
            """Handle comment event"""
            try:
                comment_data = {
                    "type": "tiktok-comment",
                    "data": {
                        "username": event.user.unique_id,
                        "nickname": event.user.nickname,
                        "text": event.comment,
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "profilePictureUrl": "",
                        "userId": str(event.user.user_id),
                        "isGift": False,
                        "giftName": "",
                        "giftCount": 0
                    }
                }
                
                logger.info(f"💬 @{event.user.unique_id}: {event.comment}")
                self._send_event(comment_data)
                
            except Exception as e:
                logger.error(f"Error processing comment: {e}")
        
        # Gifts - FIXED according to documentation
        @self.client.on(GiftEvent)
        async def on_gift(event: GiftEvent):
            """
            Handle gift event
            According to docs: Check streakable and streaking to determine if gift is complete
            """
            try:
                # Get gift info
                gift_name = event.gift.name if hasattr(event.gift, 'name') else 'Gift'
                gift_count = event.gift.repeat_count if hasattr(event.gift, 'repeat_count') else 1
                
                # Check if gift is complete (docs: streakable and not streaking)
                should_process = False
                
                if hasattr(event.gift, 'streakable'):
                    # If streakable, only process when not streaking (streak ended)
                    if event.gift.streakable and not event.streaking:
                        should_process = True
                        logger.info(f"🎁 @{event.user.unique_id} sent {gift_count}x \"{gift_name}\" (streak complete)")
                    # If not streakable, process immediately
                    elif not event.gift.streakable:
                        should_process = True
                        logger.info(f"🎁 @{event.user.unique_id} sent \"{gift_name}\" (non-streakable)")
                else:
                    # Fallback: if no streakable attribute, check repeat_end
                    if hasattr(event.gift, 'is_repeating'):
                        if event.gift.is_repeating == 1:
                            should_process = True
                            logger.info(f"🎁 @{event.user.unique_id} sent {gift_count}x \"{gift_name}\" (repeat end)")
                    else:
                        # No streaming info, process immediately
                        should_process = True
                        logger.info(f"🎁 @{event.user.unique_id} sent \"{gift_name}\"")
                
                if should_process:
                    gift_data = {
                        "type": "tiktok-comment",
                        "data": {
                            "username": event.user.unique_id,
                            "nickname": event.user.nickname,
                            "text": f"🎁 Tặng {gift_name} x{gift_count}",
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "profilePictureUrl": "",
                            "userId": str(event.user.user_id),
                            "isGift": True,
                            "giftName": gift_name,
                            "giftCount": gift_count,
                            "giftId": event.gift.id if hasattr(event.gift, 'id') else 0
                        }
                    }
                    
                    self._send_event(gift_data)
                
            except Exception as e:
                logger.error(f"Error processing gift: {e}", exc_info=True)
        
        # Viewer count updates - using string-based event name
        @self.client.on("viewer_count_update")
        async def on_viewer_count_update(event):
            """Handle viewer count update"""
            try:
                viewer_count = getattr(event, 'viewer_count', 0)
                if viewer_count > 0:
                    self.viewer_count = viewer_count
                    
                    viewer_data = {
                        "type": "tiktok-viewers",
                        "data": {
                            "viewerCount": viewer_count
                        }
                    }
                    
                    logger.debug(f"👁️ Viewer count: {viewer_count}")
                    self._send_event(viewer_data)
                    
            except Exception as e:
                logger.error(f"Error processing viewer count: {e}")
        
        # Alternative viewer count event
        @self.client.on("room_user_seq")
        async def on_room_user_seq(event):
            """Handle room user sequence (alternative viewer count)"""
            try:
                viewer_count = getattr(event, 'viewer_count', 0)
                if viewer_count > 0:
                    self.viewer_count = viewer_count
                    
                    viewer_data = {
                        "type": "tiktok-viewers",
                        "data": {
                            "viewerCount": viewer_count
                        }
                    }
                    
                    logger.debug(f"👁️ Viewer count (alt): {viewer_count}")
                    self._send_event(viewer_data)
                    
            except Exception as e:
                logger.error(f"Error processing room user seq: {e}")
        
        # Follows
        @self.client.on(FollowEvent)
        async def on_follow(event: FollowEvent):
            """Handle follow event"""
            try:
                logger.info(f"➕ @{event.user.unique_id} followed the host")
            except Exception as e:
                logger.error(f"Error processing follow: {e}")
        
        # Shares
        @self.client.on(ShareEvent)
        async def on_share(event: ShareEvent):
            """Handle share event"""
            try:
                logger.info(f"🔗 @{event.user.unique_id} shared the live")
            except Exception as e:
                logger.error(f"Error processing share: {e}")
        
        # Likes
        @self.client.on(LikeEvent)
        async def on_like(event: LikeEvent):
            """Handle like event"""
            try:
                like_count = getattr(event, 'count', 1)
                logger.debug(f"❤️ @{event.user.unique_id} sent {like_count} likes")
            except Exception as e:
                logger.error(f"Error processing like: {e}")
        
        # Join events
        @self.client.on(JoinEvent)
        async def on_join(event: JoinEvent):
            """Handle join event"""
            try:
                logger.debug(f"👋 @{event.user.unique_id} joined the live")
            except Exception as e:
                logger.error(f"Error processing join: {e}")
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current connection status
        
        Returns:
            Dictionary with status information
        """
        return {
            "isConnected": self.is_connected,
            "username": self.username,
            "roomId": self.room_id,
            "viewerCount": self.viewer_count
        }

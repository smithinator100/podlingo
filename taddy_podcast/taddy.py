import logging
import os
import json
from pathlib import Path
from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport
from typing import Optional, Dict, Any

# Configure logging to only show errors
logging.basicConfig(level=logging.ERROR)

class TaddyConfig:
    """Handles configuration and client setup for the Taddy API."""
    
    def __init__(self, api_key: Optional[str] = None, user_id: str = "2103", graphql_url: str = "https://api.taddy.org"):
        self.api_key = api_key or os.getenv('TADDY_API_KEY')
        self.user_id = user_id or os.getenv('TADDY_USER_ID', "2103")
        self.graphql_url = graphql_url or os.getenv('TADDY_GRAPHQL_URL', "https://api.taddy.org")
        
        if not self.api_key:
            raise ValueError("TADDY_API_KEY environment variable is not set")
        
        self.client = self._setup_client()
    
    def _setup_client(self) -> Client:
        """Set up the GraphQL client with proper transport configuration."""
        transport = RequestsHTTPTransport(
            url=self.graphql_url,
            headers={
                "Content-Type": "application/json",
                "X-USER-ID": self.user_id,
                "X-API-KEY": self.api_key
            },
            verify=True,
            retries=3,
        )
        return Client(transport=transport, fetch_schema_from_transport=True)

class TranscriptManager:
    """Handles saving and managing podcast transcripts."""
    
    def __init__(self):
        self.transcripts_dir = Path('podcasts')
    
    def save_transcript(self, podcast_name: str, episode_name: str, transcript_data: list) -> Path:
        """Save transcript data to a JSON file in the podcasts directory."""
        # Create a safe filename from the episode name
        safe_filename = "".join(c for c in episode_name if c.isalnum() or c in (' ', '-', '_')).strip()
        safe_filename = safe_filename.replace(' ', '_')
        
        # Create the podcast directory path
        podcast_dir = self.transcripts_dir / podcast_name
        podcast_dir.mkdir(parents=True, exist_ok=True)
        
        # Create the full file path
        file_path = podcast_dir / f"{safe_filename}.json"
        
        # Save the transcript data
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(transcript_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved transcript to: {file_path}")
        return file_path

class PodcastManager:
    """Handles podcast series data retrieval and management."""
    
    def __init__(self, config: TaddyConfig, transcript_manager: TranscriptManager):
        self.config = config
        self.transcript_manager = transcript_manager
    
    def get_podcast_series(self, podcast_name: str) -> Optional[Dict[str, Any]]:
        """Fetch podcast series details including episodes and transcripts."""
        query = gql("""
        query GetPodcastSeries($name: String!) {
          getPodcastSeries(name: $name) {
            uuid
            name
            episodes {
              uuid
              name
              description
              audioUrl
              taddyTranscribeStatus
              transcriptWithSpeakersAndTimecodes {
                id
                text
                speaker
                startTimecode
                endTimecode
              }
            }
          }
        }
        """)
        
        print(f"Searching for '{podcast_name}' podcast...")
        result = self.config.client.execute(query, variable_values={"name": podcast_name})
        
        podcast = result.get('getPodcastSeries')
        if podcast:
            podcast_name = podcast.get('name', podcast_name)
            print("\n🎙️  Podcast Details")
            print("=" * 50)
            print(f"🔑 UUID: {podcast.get('uuid')}")

            # Print episodes and save transcripts
            if podcast.get('episodes'):
                print("\n📚 Episodes")
                print("=" * 50)
                for episode in podcast['episodes']:
                    print(f"\n🎧 Episode: {episode.get('name')}")
                    if episode.get('description'):
                        print(f"📝 Description: {episode['description'][:100]}...")
                    if episode.get('audioUrl'):
                        print(f"🔊 Audio URL: {episode['audioUrl']}")
                    
                    # Save transcript if available
                    if episode.get('transcriptWithSpeakersAndTimecodes'):
                        self.transcript_manager.save_transcript(
                            podcast_name,
                            episode.get('name'),
                            episode['transcriptWithSpeakersAndTimecodes']
                        )
                    
                    print("-" * 30)
            return podcast
        else:
            print(f"\n❌ No podcast found with name '{podcast_name}'")
            return None

class PodcastSearch:
    """Handles podcast search functionality using the Taddy API."""
    
    def __init__(self, config: TaddyConfig):
        self.config = config
    
    def search_podcasts(self, search_term: str) -> Optional[Dict[str, Any]]:
        """Search for podcasts using the provided search term."""
        query = gql("""
        query SearchPodcasts($term: String!) {
          search(term: $term, filterForTypes: PODCASTSERIES) {
            searchId
            podcastSeries {
              uuid
              name
              description
            }
          }
        }
        """)
        
        print(f"Searching for podcasts matching '{search_term}'...")
        result = self.config.client.execute(query, variable_values={"term": search_term})
        
        search_results = result.get('search', {})
        if search_results and search_results.get('podcastSeries'):
            print("\n🔍 Search Results")
            print("=" * 50)
            for podcast in search_results['podcastSeries']:
                print(f"\n🎙️  {podcast.get('name')}")
                print(f"🔑 UUID: {podcast.get('uuid')}")
                if podcast.get('description'):
                    print(f"📝 Description: {podcast['description'][:100]}...")
                print("-" * 30)
            return search_results
        else:
            print(f"\n❌ No podcasts found matching '{search_term}'")
            return None

class TaddyAPI:
    """Main interface for interacting with the Taddy API."""
    
    def __init__(self, api_key: Optional[str] = None, user_id: str = "2103", graphql_url: str = "https://api.taddy.org"):
        self.config = TaddyConfig(api_key, user_id, graphql_url)
        self.transcript_manager = TranscriptManager()
        self.podcast_manager = PodcastManager(self.config, self.transcript_manager)
        self.podcast_searcher = PodcastSearch(self.config)
    
    def get_podcast_series(self, podcast_name: str) -> Optional[Dict[str, Any]]:
        """Fetch podcast series details including episodes and transcripts."""
        return self.podcast_manager.get_podcast_series(podcast_name)
    
    def search_podcasts(self, search_term: str) -> Optional[Dict[str, Any]]:
        """Search for podcasts using the provided search term."""
        return self.podcast_searcher.search_podcasts(search_term) 
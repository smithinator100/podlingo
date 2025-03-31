from .taddy import TaddyConfig
from gql import gql
from typing import Optional, Dict, Any

# GraphQL query for searching podcasts
PODCAST_SEARCH_QUERY = gql("""
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

def search_podcasts(search_term: str) -> Optional[Dict[str, Any]]:
    # Initialize Taddy configuration
    config = TaddyConfig()
    
    # Execute the query
    result = config.client.execute(PODCAST_SEARCH_QUERY, variable_values={"term": search_term})
    
    # Extract and return the search results
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

if __name__ == "__main__":
    # Example usage
    results = search_podcasts("Park Predators") 
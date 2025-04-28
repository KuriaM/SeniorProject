import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000'; 
const SPOTIFY_TOKEN = 'YOUR_SPOTIFY_ACCESS_TOKEN'; 
const USER_ID = 'YOUR_SPOTIFY_USER_ID'; 

// HomeScreen Component
const HomeScreen = ({ navigation }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState([]);
  const sidebarAnim = useState(new Animated.Value(-250))[0];

  const filterButtons = ['All', 'Music', 'Podcasts', 'Audiobooks'];
  const initialPlaylists = [
    { id: '1', name: 'Liked Songs', image: 'https://via.placeholder.com/50/9C27B0' },
    { id: '2', name: 'Daily Mix 1', image: 'https://via.placeholder.com/50/2196F3' },
    { id: '3', name: 'Chill Hits', image: 'https://via.placeholder.com/50/FFEB3B' },
  ];
  const actionButtons = [
    { id: 'artists', title: 'Top Artists', type: 'ArtistsPlaylist', image: 'https://via.placeholder.com/50/E91E63' },
    { id: 'songs', title: 'Top Songs', type: 'SongsPlaylist', image: 'https://via.placeholder.com/50/FF9800' },
    { id: 'albums', title: 'Top Albums', type: 'AlbumsPlaylist', image: 'https://via.placeholder.com/50/4CAF50' },
    { id: 'genres', title: 'Top Genres', type: 'GenresPlaylist', image: 'https://via.placeholder.com/50/3F51B5' },
  ];

  const toggleSidebar = () => {
    const newVisible = !sidebarVisible;
    setSidebarVisible(newVisible);
    Animated.timing(sidebarAnim, {
      toValue: newVisible ? 0 : -250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    if (sidebarVisible) {
      setSidebarVisible(false);
      Animated.timing(sidebarAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleActionPress = (type, title, image) => {
    const newPlaylist = { id: Date.now().toString(), name: `My ${title} Playlist`, type, image };
    if (!addedPlaylists.some(p => p.type === type)) {
      setAddedPlaylists([...addedPlaylists, newPlaylist]);
    }
    navigation.navigate(type);
  };

  const renderPlaylist = ({ item }) => (
    <TouchableOpacity
      style={styles.homePlaylistItem}
      onPress={() => item.type && navigation.navigate(item.type)}
    >
      <Image source={{ uri: item.image }} style={styles.homePlaylistItemImage} />
      <Text style={styles.homePlaylistText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFilterButton = ({ item }) => (
    <View style={styles.homeFilterButton}>
      <Text style={styles.homeFilterButtonText}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.homeContainer}>
      <View style={styles.homeHeaderContainer}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.homeAccountIcon}>
          <Text style={styles.homeIconText}>👤</Text>
        </TouchableOpacity>
        <FlatList
          data={filterButtons}
          renderItem={renderFilterButton}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.homeFilterList}
        />
      </View>

      {sidebarVisible && (
        <TouchableOpacity style={styles.homeOverlay} onPress={closeSidebar} activeOpacity={1} />
      )}
      <Animated.View style={[styles.homeSidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <TouchableOpacity style={styles.homeSidebarItem} onPress={() => navigation.navigate('ProfileMenu')}>
          <Text style={styles.homeSidebarText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeSidebarItem}>
          <Text style={styles.homeSidebarText}>Settings ⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeSidebarItem}>
          <Text style={styles.homeSidebarText}>Log Out</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView>
        <Text style={styles.homeSectionTitle}>Your Playlists</Text>
        <FlatList
          data={[...initialPlaylists, ...addedPlaylists]}
          renderItem={renderPlaylist}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.homePlaylistList}
        />
        <Text style={styles.homeSectionTitle}>Based on Your Listening</Text>
        <View style={styles.homeActionContainer}>
          {actionButtons.map((button) => (
            <TouchableOpacity
              key={button.id}
              style={styles.homeActionButton}
              onPress={() => handleActionPress(button.type, button.title.split(' ')[1], button.image)}
            >
              <Text style={styles.homeButtonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ArtistsPlaylistScreen Component
const ArtistsPlaylistScreen = () => {
  const [artists, setArtists] = useState([]);
  const [sortVisible, setSortVisible] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);

  useEffect(() => {
    fetchTopArtists();
  }, []);

  const fetchTopArtists = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/top-artists`, {
        params: { time_range: 'short_term', token: SPOTIFY_TOKEN },
      });
      setArtists(response.data.items);
    } catch (error) {
      console.error('Error fetching top artists:', error);
    }
  };

  const createPlaylist = async () => {
    try {
      const trackIds = artists.map((artist) => artist.id); // Simplified
      await axios.post(`${BASE_URL}/create-playlist`, {
        token: SPOTIFY_TOKEN,
        user_id: USER_ID,
        playlist_name: 'Top Artists Playlist',
        track_ids: trackIds,
      });
      alert('Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  const shuffleArtists = () => {
    const shuffledArtists = [...artists].sort(() => Math.random() - 0.5);
    setArtists(shuffledArtists);
    setShuffleActive(!shuffleActive);
  };

  const sortByName = () => {
    const sorted = [...artists].sort((a, b) => a.name.localeCompare(b.name));
    setArtists(sorted);
    setSortVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItemContainer}>
      <Image
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/50' }}
        style={styles.listItemImage}
      />
      <View style={styles.listItemTextContainer}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSubtitle}>{item.genres[0] || 'Unknown'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.listContainer}>
      <TextInput
        style={styles.listSearchBar}
        placeholder="Find in playlist"
        placeholderTextColor="#b3b3b3"
        editable={false}
      />
      <Image source={{ uri: 'https://via.placeholder.com/150/E91E63' }} style={styles.listPlaylistImage} />
      <Text style={styles.listHeader}>Your Artists Playlist</Text>
      <Text style={styles.listDescription}>This contains your most-listened-to artists.</Text>
      <View style={styles.listButtonContainer}>
        <TouchableOpacity
          style={[styles.listShuffleButton, shuffleActive && styles.listShuffleButtonActive]}
          onPress={shuffleArtists}
        >
          <Text style={styles.listButtonText}>Shuffle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listPlayButton} onPress={createPlaylist}>
          <Text style={styles.listButtonText}>Create Playlist</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.listSortButton} onPress={() => setSortVisible(!sortVisible)}>
        <Text style={styles.listSortButtonText}>Sort</Text>
      </TouchableOpacity>
      {sortVisible && (
        <View style={styles.listSortMenu}>
          <TouchableOpacity style={styles.listSortOption} onPress={sortByName}>
            <Text style={styles.listSortOptionText}>Sort by Name</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={artists}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

// SongsPlaylistScreen Component
const SongsPlaylistScreen = () => {
  const [songs, setSongs] = useState([]);
  const [sortVisible, setSortVisible] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);

  useEffect(() => {
    fetchTopSongs();
  }, []);

  const fetchTopSongs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/top-songs`, {
        params: { time_range: 'short_term', token: SPOTIFY_TOKEN },
      });
      setSongs(response.data.items);
    } catch (error) {
      console.error('Error fetching top songs:', error);
    }
  };

  const createPlaylist = async () => {
    try {
      const trackIds = songs.map((song) => song.id);
      await axios.post(`${BASE_URL}/create-playlist`, {
        token: SPOTIFY_TOKEN,
        user_id: USER_ID,
        playlist_name: 'Top Songs Playlist',
        track_ids: trackIds,
      });
      alert('Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  const shuffleSongs = () => {
    const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
    setSongs(shuffledSongs);
    setShuffleActive(!shuffleActive);
  };

  const sortByName = () => {
    const sorted = [...songs].sort((a, b) => a.name.localeCompare(b.name));
    setSongs(sorted);
    setSortVisible(false);
  };

  const sortByArtist = () => {
    const sorted = [...songs].sort((a, b) => a.artists[0].name.localeCompare(b.artists[0].name));
    setSongs(sorted);
    setSortVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItemContainer}>
      <Image
        source={{ uri: item.album.images[0]?.url || 'https://via.placeholder.com/50' }}
        style={styles.listItemImage}
      />
      <View style={styles.listItemTextContainer}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSubtitle}>{item.artists[0].name}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.listContainer}>
      <TextInput
        style={styles.listSearchBar}
        placeholder="Find in playlist"
        placeholderTextColor="#b3b3b3"
        editable={false}
      />
      <Image source={{ uri: 'https://via.placeholder.com/150/FF9800' }} style={styles.listPlaylistImage} />
      <Text style={styles.listHeader}>Your Songs Playlist</Text>
      <Text style={styles.listDescription}>This contains your most-listened-to songs.</Text>
      <View style={styles.listButtonContainer}>
        <TouchableOpacity
          style={[styles.listShuffleButton, shuffleActive && styles.listShuffleButtonActive]}
          onPress={shuffleSongs}
        >
          <Text style={styles.listButtonText}>Shuffle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listPlayButton} onPress={createPlaylist}>
          <Text style={styles.listButtonText}>Create Playlist</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.listSortButton} onPress={() => setSortVisible(!sortVisible)}>
        <Text style={styles.listSortButtonText}>Sort</Text>
      </TouchableOpacity>
      {sortVisible && (
        <View style={styles.listSortMenu}>
          <TouchableOpacity style={styles.listSortOption} onPress={sortByName}>
            <Text style={styles.listSortOptionText}>Sort by Name</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listSortOption} onPress={sortByArtist}>
            <Text style={styles.listSortOptionText}>Sort by Artist</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

// AlbumsPlaylistScreen Component
const AlbumsPlaylistScreen = () => {
  const [albums, setAlbums] = useState([]);
  const [sortVisible, setSortVisible] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);

  useEffect(() => {
    fetchTopSongs();
  }, []);

  const fetchTopSongs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/top-songs`, {
        params: { time_range: 'short_term', token: SPOTIFY_TOKEN },
      });
      const albumsMap = new Map();
      response.data.items.forEach((song) => {
        const album = song.album;
        albumsMap.set(album.id, album);
      });
      setAlbums(Array.from(albumsMap.values()));
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const createPlaylist = async () => {
    try {
      const trackIds = albums.map((album) => album.id); // Simplified
      await axios.post(`${BASE_URL}/create-playlist`, {
        token: SPOTIFY_TOKEN,
        user_id: USER_ID,
        playlist_name: 'Top Albums Playlist',
        track_ids: trackIds,
      });
      alert('Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  const shuffleAlbums = () => {
    const shuffledAlbums = [...albums].sort(() => Math.random() - 0.5);
    setAlbums(shuffledAlbums);
    setShuffleActive(!shuffleActive);
  };

  const sortByName = () => {
    const sorted = [...albums].sort((a, b) => a.name.localeCompare(b.name));
    setAlbums(sorted);
    setSortVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItemContainer}>
      <Image
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/50' }}
        style={styles.listItemImage}
      />
      <View style={styles.listItemTextContainer}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSubtitle}>{item.artists[0].name}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.listContainer}>
      <TextInput
        style={styles.listSearchBar}
        placeholder="Find in playlist"
        placeholderTextColor="#b3b3b3"
        editable={false}
      />
      <Image source={{ uri: 'https://via.placeholder.com/150/4CAF50' }} style={styles.listPlaylistImage} />
      <Text style={styles.listHeader}>Your Albums Playlist</Text>
      <Text style={styles.listDescription}>This contains your most-listened-to albums.</Text>
      <View style={styles.listButtonContainer}>
        <TouchableOpacity
          style={[styles.listShuffleButton, shuffleActive && styles.listShuffleButtonActive]}
          onPress={shuffleAlbums}
        >
          <Text style={styles.listButtonText}>Shuffle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listPlayButton} onPress={createPlaylist}>
          <Text style={styles.listButtonText}>Create Playlist</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.listSortButton} onPress={() => setSortVisible(!sortVisible)}>
        <Text style={styles.listSortButtonText}>Sort</Text>
      </TouchableOpacity>
      {sortVisible && (
        <View style={styles.listSortMenu}>
          <TouchableOpacity style={styles.listSortOption} onPress={sortByName}>
            <Text style={styles.listSortOptionText}>Sort by Name</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={albums}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

// GenresPlaylistScreen Component
const GenresPlaylistScreen = ({ navigation }) => {
  const [genres, setGenres] = useState([]);
  const [sortVisible, setSortVisible] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/top-artists`, {
        params: { time_range: 'short_term', token: SPOTIFY_TOKEN },
      });
      const genresSet = new Set();
      response.data.items.forEach((artist) => {
        artist.genres.forEach((genre) => genresSet.add(genre));
      });
      setGenres(Array.from(genresSet).map((genre, index) => ({ id: `${index}`, name: genre })));
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const createPlaylist = async () => {
    try {
      const trackIds = []; // Simplified
      await axios.post(`${BASE_URL}/create-playlist`, {
        token: SPOTIFY_TOKEN,
        user_id: USER_ID,
        playlist_name: 'Top Genres Playlist',
        track_ids: trackIds,
      });
      alert('Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  const shuffleGenres = () => {
    const shuffledGenres = [...genres].sort(() => Math.random() - 0.5);
    setGenres(shuffledGenres);
    setShuffleActive(!shuffleActive);
  };

  const sortByName = () => {
    const sorted = [...genres].sort((a, b) => a.name.localeCompare(b.name));
    setGenres(sorted);
    setSortVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItemContainer}
      onPress={() => navigation.navigate('GenreRecommendations', { genre: item.name })}
    >
      <View style={styles.listItemTextContainer}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.listContainer}>
      <TextInput
        style={styles.listSearchBar}
        placeholder="Find in playlist"
        placeholderTextColor="#b3b3b3"
        editable={false}
      />
      <Image source={{ uri: 'https://via.placeholder.com/150/3F51B5' }} style={styles.listPlaylistImage} />
      <Text style={styles.listHeader}>Your Genres Playlist</Text>
      <Text style={styles.listDescription}>This contains your most-listened-to genres.</Text>
      <View style={styles.listButtonContainer}>
        <TouchableOpacity
          style={[styles.listShuffleButton, shuffleActive && styles.listShuffleButtonActive]}
          onPress={shuffleGenres}
        >
          <Text style={styles.listButtonText}>Shuffle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listPlayButton} onPress={createPlaylist}>
          <Text style={styles.listButtonText}>Create Playlist</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.listSortButton} onPress={() => setSortVisible(!sortVisible)}>
        <Text style={styles.listSortButtonText}>Sort</Text>
      </TouchableOpacity>
      {sortVisible && (
        <View style={styles.listSortMenu}>
          <TouchableOpacity style={styles.listSortOption} onPress={sortByName}>
            <Text style={styles.listSortOptionText}>Sort by Name</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={genres}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

// GenreRecommendationsScreen Component
const GenreRecommendationsScreen = ({ route }) => {
  const [recommendations, setRecommendations] = useState([]);
  const genre = route.params.genre;

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/recommendations', {
        headers: {
          Authorization: `Bearer ${SPOTIFY_TOKEN}`,
        },
        params: {
          seed_genres: genre,
          limit: 20,
        },
      });
      setRecommendations(response.data.tracks);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const createPlaylist = async () => {
    try {
      const trackIds = recommendations.map((track) => track.id);
      await axios.post(`${BASE_URL}/create-playlist`, {
        token: SPOTIFY_TOKEN,
        user_id: USER_ID,
        playlist_name: `${genre} Recommendations`,
        track_ids: trackIds,
      });
      alert('Playlist created successfully!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItemContainer}>
      <Image
        source={{ uri: item.album.images[0]?.url || 'https://via.placeholder.com/50' }}
        style={styles.listItemImage}
      />
      <View style={styles.listItemTextContainer}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSubtitle}>{item.artists[0].name}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.listContainer}>
      <Text style={styles.listHeader}>{genre} Recommendations</Text>
      <TouchableOpacity style={styles.listPlayButton} onPress={createPlaylist}>
        <Text style={styles.listButtonText}>Create Playlist</Text>
      </TouchableOpacity>
      <FlatList
        data={recommendations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

// ProfileMenuScreen Component
const ProfileMenuScreen = () => {
  return (
    <View style={styles.listContainer}>
      <Text style={styles.listHeader}>Profile Menu</Text>
      <Text style={styles.listDescription}>Manage your account settings here.</Text>
    </View>
  );
};

// Navigation Setup
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#121212' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ArtistsPlaylist" component={ArtistsPlaylistScreen} />
        <Stack.Screen name="SongsPlaylist" component={SongsPlaylistScreen} />
        <Stack.Screen name="AlbumsPlaylist" component={AlbumsPlaylistScreen} />
        <Stack.Screen name="GenresPlaylist" component={GenresPlaylistScreen} />
        <Stack.Screen name="GenreRecommendations" component={GenreRecommendationsScreen} />
        <Stack.Screen name="ProfileMenu" component={ProfileMenuScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  // HomeScreen Styles
  homeContainer: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  homeHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 10,
  },
  homeAccountIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 20,
    marginRight: 10,
  },
  homeIconText: {
    fontSize: 20,
  },
  homeFilterList: {
    flexGrow: 0,
  },
  homeFilterButton: {
    backgroundColor: '#282828',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  homeFilterButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  homeSidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#000',
    padding: 20,
    zIndex: 10,
  },
  homeSidebarItem: {
    paddingVertical: 15,
  },
  homeSidebarText: {
    color: '#fff',
    fontSize: 16,
  },
  homeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  },
  homeSectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  homePlaylistList: {
    marginBottom: 20,
  },
  homePlaylistItem: {
    backgroundColor: '#282828',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    width: 150,
    flexDirection: 'row',
    alignItems: 'center',
  },
  homePlaylistItemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  homePlaylistText: {
    color: '#fff',
    flex: 1,
  },
  homeActionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  homeActionButton: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 25,
    width: '48%',
    marginBottom: 10,
  },
  homeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Playlist Screen Styles (Artists, Songs, Albums, Genres)
  listContainer: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  listSearchBar: {
    backgroundColor: '#282828',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  listPlaylistImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 15,
  },
  listHeader: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  listDescription: {
    color: '#b3b3b3',
    fontSize: 14,
    marginBottom: 15,
  },
  listButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  listShuffleButton: {
    backgroundColor: '#282828',
    padding: 10,
    borderRadius: 25,
  },
  listShuffleButtonActive: {
    backgroundColor: '#1DB954',
  },
  listPlayButton: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 25,
  },
  listButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listSortButton: {
    backgroundColor: '#282828',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  listSortButtonText: {
    color: '#fff',
  },
  listSortMenu: {
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 10,
    position: 'absolute',
    top: 330,
    left: 20,
    zIndex: 10,
  },
  listSortOption: {
    paddingVertical: 5,
  },
  listSortOptionText: {
    color: '#fff',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  listItemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItemSubtitle: {
    color: '#b3b3b3',
    fontSize: 14,
  },
});

/**
 * Navigation types for React Navigation
 */

import type { Poem } from './index';

export type RootStackParamList = {
  MainTabs: undefined;
  PoemDetail: { poem: Poem };
  VideoPlayer: { poem: Poem };
  MusicPlayer: { poem: Poem };
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  PoemDetail: { poem: Poem };
};

export type ExploreStackParamList = {
  ExploreScreen: undefined;
  PoemDetail: { poem: Poem };
};

export type FavoritesStackParamList = {
  FavoritesScreen: undefined;
  PoemDetail: { poem: Poem };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
  About: undefined;
};

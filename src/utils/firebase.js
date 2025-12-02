import { initializeApp, getApps, getApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

// Placeholder config - User needs to replace this with their actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC3TZIlcnGx-cAk7lnjoHk2D6CvWqEFHjM",
    authDomain: "lyriclab-6b468.firebaseapp.com",
    projectId: "lyriclab-6b468",
    storageBucket: "lyriclab-6b468.firebasestorage.app",
    messagingSenderId: "288206059813",
    appId: "1:288206059813:web:d58f2a00ffe184634c42cc"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };

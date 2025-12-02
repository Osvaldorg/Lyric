import { useState, useEffect } from 'react';
import { Alert, LayoutAnimation } from 'react-native';
import { Audio } from 'expo-av';

export function useAudioPlayback() {
    const [sound, setSound] = useState();
    const [currentPlayingId, setCurrentPlayingId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [playbackDuration, setPlaybackDuration] = useState(0);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis);
            setPlaybackDuration(status.durationMillis);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPlaybackPosition(0);
            }
        }
    };

    async function playRecording(item) {
        try {
            if (sound) {
                await sound.unloadAsync();
            }

            if (currentPlayingId === item.id && isPlaying) {
                setIsPlaying(false);
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: item.uri },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCurrentPlayingId(item.id);
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing sound', error);
            Alert.alert('Error', 'No se pudo reproducir el audio.');
        }
    }

    const handleSeek = async (value) => {
        if (sound) {
            await sound.setPositionAsync(value);
        }
    };

    const handleTogglePlay = async (item) => {
        if (currentPlayingId === item.id) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        } else {
            await playRecording(item);
        }
    };

    return {
        playRecording,
        handleSeek,
        handleTogglePlay,
        currentPlayingId,
        isPlaying,
        playbackPosition,
        playbackDuration
    };
}

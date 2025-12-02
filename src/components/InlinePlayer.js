import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Play, Pause, Trash2 } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';

export default function InlinePlayer({ uri, duration, onDelete }) {
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [durationMillis, setDurationMillis] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const loadSound = async () => {
        setIsLoading(true);
        try {
            const { sound: newSound, status } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            setDurationMillis(status.durationMillis);
            setIsPlaying(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDurationMillis(status.durationMillis);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
            }
        }
    };

    const togglePlay = async () => {
        if (!sound) {
            await loadSound();
        } else {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        }
    };

    const onSeek = async (value) => {
        if (sound) {
            await sound.setPositionAsync(value);
        }
    };

    const formatTime = (millis) => {
        if (!millis) return '00:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View className="bg-muted dark:bg-muted-dark rounded-xl p-3 my-2 flex-row items-center border border-border dark:border-border-dark">
            <TouchableOpacity
                onPress={togglePlay}
                disabled={isLoading}
                className="bg-primary dark:bg-primary-dark p-2 rounded-full mr-3"
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : isPlaying ? (
                    <Pause size={16} color="white" fill="white" />
                ) : (
                    <Play size={16} color="white" fill="white" />
                )}
            </TouchableOpacity>

            <View className="flex-1">
                <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-black dark:text-white font-mono">{formatTime(position)}</Text>
                    <Text className="text-xs text-muted-foreground dark:text-gray-400 font-mono">{duration || formatTime(durationMillis)}</Text>
                </View>
                <Slider
                    style={{ width: '100%', height: 20 }}
                    minimumValue={0}
                    maximumValue={durationMillis || 1}
                    value={position}
                    minimumTrackTintColor="#8b5cf6"
                    maximumTrackTintColor="#555"
                    thumbTintColor="#8b5cf6"
                    onSlidingComplete={onSeek}
                />
            </View>

            <TouchableOpacity onPress={onDelete} className="ml-3 p-2">
                <Trash2 size={18} className="text-muted-foreground dark:text-gray-400" color="#888" />
            </TouchableOpacity>
        </View>
    );
}

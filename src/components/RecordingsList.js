import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Play, Pause, Trash2 } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

export default function RecordingsList({
    recordings,
    onPlay,
    onDelete,
    currentPlayingId,
    isPlaying,
    playbackPosition,
    playbackDuration,
    onSeek
}) {

    const formatTime = (millis) => {
        if (!millis) return '00:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + ', ' +
            date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <View className="flex-1 px-4 pt-4">
            <FlatList
                data={recordings}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isCurrent = currentPlayingId === item.id;

                    return (
                        <View className="bg-card dark:bg-card-dark p-4 rounded-xl mb-3 border border-border dark:border-border-dark">
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center flex-1">
                                    <TouchableOpacity
                                        onPress={() => onPlay(item)}
                                        className="bg-muted dark:bg-muted-dark p-3 rounded-full mr-4"
                                    >
                                        {isCurrent && isPlaying ? (
                                            <Pause size={20} className="text-primary dark:text-primary-dark" color="#8b5cf6" fill="#8b5cf6" />
                                        ) : (
                                            <Play size={20} className="text-primary dark:text-primary-dark" color="#8b5cf6" fill="#8b5cf6" />
                                        )}
                                    </TouchableOpacity>
                                    <View>
                                        <Text className="font-bold text-lg text-black dark:text-white mb-1">
                                            {item.date ? formatDate(item.date) : item.name}
                                        </Text>
                                        <View className="flex-row items-center">
                                            <Text className="text-sm font-mono text-muted-foreground dark:text-gray-400">
                                                {isCurrent ? formatTime(playbackPosition) : '00:00'}
                                            </Text>
                                            <Text className="text-sm font-mono text-muted-foreground dark:text-gray-500 mx-1">/</Text>
                                            <Text className="text-sm font-mono text-muted-foreground dark:text-gray-500">
                                                {isCurrent && playbackDuration > 0 ? formatTime(playbackDuration) : item.duration || '00:00'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => onDelete(item.id)} className="p-2">
                                    <Trash2 size={18} className="text-destructive" color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            {/* Slider Section - Only visible when playing */}
                            {isCurrent && (
                                <View className="mt-2">
                                    <Slider
                                        style={{ width: '100%', height: 40 }}
                                        minimumValue={0}
                                        maximumValue={playbackDuration > 0 ? playbackDuration : 1}
                                        value={playbackPosition}
                                        minimumTrackTintColor="#ef4444"
                                        maximumTrackTintColor="#555"
                                        thumbTintColor="#ef4444"
                                        onSlidingComplete={onSeek}
                                    />
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-10">
                        <Text className="text-muted-foreground dark:text-gray-400">No hay grabaciones aún.</Text>
                    </View>
                }
            />
        </View>
    );
}

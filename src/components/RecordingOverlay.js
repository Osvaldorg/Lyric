import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Mic, Square } from 'lucide-react-native';

export default function RecordingOverlay({ visible, onStop, duration, metering }) {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible && metering !== undefined) {
            // Normalize metering (usually -160 to 0 dB) to a scale factor (1 to 1.5)
            // Assuming metering comes in as roughly -60 to 0 for useful range
            const minDb = -60;
            const maxDb = 0;
            let level = Math.max(minDb, Math.min(maxDb, metering));

            // Map -60..0 to 0..1
            const normalized = (level - minDb) / (maxDb - minDb);

            // Map 0..1 to 1..1.5 scale
            const scale = 1 + (normalized * 0.5);

            Animated.timing(pulse, {
                toValue: scale,
                duration: 100,
                useNativeDriver: true,
            }).start();
        } else if (!visible) {
            pulse.setValue(1);
        }
    }, [visible, metering]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View className="flex-1 bg-black/80 items-center justify-center">
                <View className="bg-card dark:bg-card-dark p-8 rounded-3xl items-center w-3/4 max-w-sm border border-border dark:border-border-dark">

                    <Text className="text-black text-xl font-bold mb-8">Grabando...</Text>

                    <Text className="text-black text-5xl font-mono font-bold mb-8 tracking-widest">
                        {formatTime(duration)}
                    </Text>

                    <Animated.View style={{ transform: [{ scale: pulse }] }} className="mb-10">
                        <View className="w-32 h-32 rounded-full bg-red-500/20 items-center justify-center">
                            <View className="w-20 h-20 rounded-full bg-red-500 items-center justify-center shadow-lg shadow-red-500/50">
                                <Mic size={40} color="white" />
                            </View>
                        </View>
                    </Animated.View>

                    <TouchableOpacity
                        onPress={onStop}
                        className="bg-white px-8 py-4 rounded-full flex-row items-center"
                    >
                        <Square size={20} color="black" fill="black" className="mr-2" />
                        <Text className="text-black font-bold text-lg">DETENER</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

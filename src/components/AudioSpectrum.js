import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const BAR_COUNT = 20;

export default function AudioSpectrum({ metering, color = '#fbbf24' }) {
    // Create animated values for each bar
    const bars = useRef(new Array(BAR_COUNT).fill(0).map(() => new Animated.Value(5))).current;

    useEffect(() => {
        // Normalize metering (-160 to 0) to a 0-1 scale
        // Typical speech is around -40 to -10
        const normalized = Math.max(0, (metering + 60) / 60);

        const animations = bars.map((bar, index) => {
            // Create a "wave" effect or random variation based on metering
            // Center bars are higher
            const centerOffset = Math.abs(index - BAR_COUNT / 2);
            const scaleFactor = 1 - (centerOffset / (BAR_COUNT / 2)) * 0.5;

            // Add some randomness
            const random = Math.random() * 0.5 + 0.5;

            const targetHeight = 10 + (normalized * 50 * scaleFactor * random);

            return Animated.timing(bar, {
                toValue: targetHeight,
                duration: 100,
                useNativeDriver: false,
            });
        });

        Animated.parallel(animations).start();
    }, [metering]);

    return (
        <View style={styles.container}>
            {bars.map((height, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.bar,
                        {
                            height: height,
                            backgroundColor: color,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        gap: 4,
    },
    bar: {
        width: 4,
        borderRadius: 2,
    },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, ScrollView, Text, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Keyboard, LayoutAnimation, UIManager } from 'react-native';
import { Mic, Type, Check, X } from 'lucide-react-native';
import InlinePlayer from './InlinePlayer';
import AudioSpectrum from './AudioSpectrum';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function LyricEditor({
    title,
    onTitleChange,
    content,
    onChange,
    lastModified,
    onStartRecording,
    onStopRecording,
    isRecording,
    recordingDuration,
    metering,
    onCursorChange
}) {
    const [inputMode, setInputMode] = useState('NONE');
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // Focus Management
    const inputRefs = useRef({});
    const flatListRef = useRef(null);
    const [focusTarget, setFocusTarget] = useState(null);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setKeyboardVisible(true);
            if (inputMode !== 'KEYBOARD' && inputMode !== 'RECORDING' && inputMode !== 'FONT') {
                setInputMode('KEYBOARD');
            }
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setKeyboardVisible(false);
            if (inputMode === 'KEYBOARD') {
                setInputMode('NONE');
            }
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [inputMode]);

    // Apply focus when target changes
    useEffect(() => {
        if (focusTarget) {
            const { id, index } = focusTarget;
            const input = inputRefs.current[id];
            if (input) {
                input.focus();
            }
            setFocusTarget(null);
        }
    }, [focusTarget]);

    const handleTextChange = (text, id) => {
        const newContent = content.map(block => {
            if (block.id === id) {
                return { ...block, content: text };
            }
            return block;
        });
        onChange(newContent);
    };

    const handleDeleteBlock = (id) => {
        const newContent = content.filter(block => block.id !== id);
        onChange(newContent);
    };

    const handleBackspace = (id, selection) => {
        if (selection.start !== 0) return;

        const index = content.findIndex(b => b.id === id);
        if (index <= 0) return;

        const currentBlock = content[index];
        const prevBlock = content[index - 1];

        if (currentBlock.content.length === 0) {
            const newContent = [...content];
            newContent.splice(index, 1);
            onChange(newContent);

            if (prevBlock.type === 'text') {
                setFocusTarget({ id: prevBlock.id, index: prevBlock.content.length });
            } else {
                if (index > 1 && content[index - 2].type === 'text') {
                    setFocusTarget({ id: content[index - 2].id, index: content[index - 2].content.length });
                }
            }
        } else {
            if (prevBlock.type === 'audio') {
                const newContent = content.filter(b => b.id !== prevBlock.id);
                onChange(newContent);
            } else if (prevBlock.type === 'text') {
                const newContent = [...content];
                const mergeIndex = prevBlock.content.length;

                newContent[index - 1] = {
                    ...prevBlock,
                    content: prevBlock.content + currentBlock.content
                };
                newContent.splice(index, 1);
                onChange(newContent);

                setFocusTarget({ id: prevBlock.id, index: mergeIndex });
            }
        }
    };

    const handleToggleRecording = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (isRecording) {
            onStopRecording();
            setInputMode('NONE');
        } else {
            Keyboard.dismiss();
            setInputMode('RECORDING');
            onStartRecording();
        }
    };

    const handleToggleFont = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        Keyboard.dismiss();
        setInputMode(inputMode === 'FONT' ? 'NONE' : 'FONT');
    };

    const handleClosePanel = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (isRecording) onStopRecording();
        Keyboard.dismiss();
        setInputMode('NONE');
    };

    const scrollToBlock = (index) => {
        if (flatListRef.current) {
            // Scroll to the item with a slight delay to allow keyboard to show
            setTimeout(() => {
                flatListRef.current.scrollToIndex({
                    index,
                    viewPosition: 0.5, // Center the item
                    animated: true
                });
            }, 300); // Increased delay to ensure keyboard is fully up
        }
    };

    const renderItem = ({ item, index }) => {
        if (item.type === 'audio') {
            return (
                <InlinePlayer
                    uri={item.uri}
                    duration={item.duration}
                    onDelete={() => handleDeleteBlock(item.id)}
                />
            );
        }

        return (
            <TextInput
                ref={ref => inputRefs.current[item.id] = ref}
                className="text-lg text-black dark:text-white leading-relaxed mb-2"
                multiline
                placeholder={index === 0 ? "Empiece a escribir..." : ""}
                placeholderTextColor="#52525b"
                value={item.content}
                onChangeText={(text) => handleTextChange(text, item.id)}
                scrollEnabled={false}
                onFocus={() => {
                    if (inputMode !== 'KEYBOARD') {
                        setInputMode('KEYBOARD');
                    }
                    scrollToBlock(index);
                }}
                onSelectionChange={(e) => {
                    if (onCursorChange) {
                        onCursorChange({ blockId: item.id, index: e.nativeEvent.selection.start });
                    }
                }}
                onKeyPress={(e) => {
                    if (e.nativeEvent.key === 'Backspace') {
                        if (item.content.length === 0) {
                            handleBackspace(item.id, { start: 0 });
                        }
                    }
                }}
            />
        );
    };

    const dateStr = lastModified ? new Date(lastModified).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString();
    const charCount = Array.isArray(content)
        ? content.reduce((acc, block) => acc + (block.type === 'text' ? (block.content?.length || 0) : 0), 0)
        : 0;

    return (
        <View className="flex-1 bg-background dark:bg-background-dark">
            {/* Toolbar - Moved to Top */}
            {(keyboardVisible || inputMode === 'RECORDING' || inputMode === 'FONT') && (
                <View className="bg-card dark:bg-card-dark border-b border-border dark:border-border-dark px-4 py-2 flex-row justify-between items-center shadow-sm z-10">
                    <View className="flex-row space-x-4">
                        <TouchableOpacity
                            onPress={handleToggleRecording}
                            className={`p-2 rounded-lg ${inputMode === 'RECORDING' ? 'bg-primary/20' : ''}`}
                        >
                            <Mic size={24} color={inputMode === 'RECORDING' ? '#fbbf24' : '#888'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleToggleFont}
                            className={`p-2 rounded-lg ${inputMode === 'FONT' ? 'bg-primary/20' : ''}`}
                        >
                            <Type size={24} color={inputMode === 'FONT' ? '#8b5cf6' : '#888'} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleClosePanel}>
                        {inputMode === 'KEYBOARD' ? (
                            <X size={24} color="#888" />
                        ) : (
                            <Check size={24} color="#888" />
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                ref={flatListRef}
                data={Array.isArray(content) ? content : []}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={{ flex: 1 }}
                ListHeaderComponent={
                    <View className="px-4 pt-4">
                        <TextInput
                            className="text-4xl font-bold text-black dark:text-white mb-2"
                            placeholder="Título"
                            placeholderTextColor="#52525b"
                            value={title}
                            onChangeText={onTitleChange}
                            multiline={false}
                        />
                        <View className="flex-row items-center mb-6 space-x-2">
                            <Text className="text-xs text-muted-foreground dark:text-gray-500">
                                {dateStr} | {charCount} caracteres
                            </Text>
                        </View>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
                onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                }}
            />

            {/* Custom Input Panels */}
            {inputMode === 'RECORDING' && (
                <View className="h-64 bg-black items-center justify-center w-full">
                    <View className="bg-muted/20 px-4 py-2 rounded-full mb-4 flex-row items-center">
                        <Mic size={16} color="#fbbf24" className="mr-2" />
                        <Text className="text-white font-mono">
                            {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                        </Text>
                    </View>
                    <AudioSpectrum metering={metering} />
                    <Text className="text-gray-500 mt-4 text-xs">Grabando...</Text>
                </View>
            )}

            {inputMode === 'FONT' && (
                <View className="h-64 bg-card dark:bg-card-dark items-center justify-center w-full">
                    <Text className="text-muted-foreground">Opciones de fuente (Próximamente)</Text>
                </View>
            )}
        </View>
    );
}

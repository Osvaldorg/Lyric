import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, Platform, UIManager, KeyboardAvoidingView, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
    Image as ImageIcon, Eye, EyeOff, Trash2,
    FileText, Mic, BookOpen
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import LyricEditor from '../components/LyricEditor';
import RecordingsList from '../components/RecordingsList';
import ProjectNotes from '../components/ProjectNotes';
import RecordingOverlay from '../components/RecordingOverlay';
import ProjectHeader from '../components/ProjectHeader';
import { ProjectProvider, useProject } from '../context/ProjectContext';
import { deleteProject } from '../utils/storage';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

// Configuration
const KEYBOARD_OFFSET = Platform.OS === 'ios' ? 100 : 0;

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const Tab = createMaterialTopTabNavigator();

function LyricsTab({
    onStartInlineRecording,
    onStopRecording,
    isRecording,
    recordingDuration,
    metering,
    onCursorChange
}) {
    const { projectData, updateProject } = useProject();
    return (
        <View className="flex-1">
            <LyricEditor
                title={projectData.title}
                onTitleChange={(t) => updateProject({ title: t })}
                content={projectData.lyrics}
                lastModified={projectData.lastModified}
                onChange={(content) => updateProject({ lyrics: content })}
                onStartRecording={onStartInlineRecording}
                onStopRecording={onStopRecording}
                isRecording={isRecording}
                recordingDuration={recordingDuration}
                metering={metering}
                onCursorChange={onCursorChange}
            />
        </View>
    );
}

function RecordingsTab({ onPlayRecording, currentPlayingId, isPlaying, playbackPosition, playbackDuration, onSeek }) {
    const { projectData, updateProject } = useProject();

    const handleDelete = (id) => {
        const newRecordings = projectData.recordings.filter(r => r.id !== id);
        updateProject({ recordings: newRecordings });
    };

    return (
        <RecordingsList
            recordings={projectData.recordings}
            onPlay={onPlayRecording}
            onDelete={handleDelete}
            currentPlayingId={currentPlayingId}
            isPlaying={isPlaying}
            playbackPosition={playbackPosition}
            playbackDuration={playbackDuration}
            onSeek={onSeek}
        />
    );
}

function NotesTab() {
    const { projectData, updateProject } = useProject();

    return (
        <ProjectNotes
            status={projectData.status}
            setStatus={(s) => updateProject({ status: s })}
            genre={projectData.genre}
            setGenre={(g) => updateProject({ genre: g })}
            mood={projectData.mood}
            setMood={(m) => updateProject({ mood: m })}
            notes={projectData.notes}
            setNotes={(n) => updateProject({ notes: n })}
            createdAt={projectData.createdAt}
            lastModified={projectData.lastModified}
            lyrics={projectData.lyrics}
            recordings={projectData.recordings}
        />
    );
}

function ProjectEditorContent() {
    const navigation = useNavigation();
    const { projectData, updateProject, save, isLoaded } = useProject();
    const [showMenu, setShowMenu] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(null);
    const [kavKey, setKavKey] = useState(0); // Key to force re-render of KeyboardAvoidingView

    // Custom Hooks
    const {
        startRecording,
        stopRecording,
        isRecording,
        isInlineRecording,
        recordingDuration,
        metering
    } = useAudioRecording(projectData, updateProject, cursorPosition);

    const {
        handleTogglePlay,
        handleSeek,
        currentPlayingId,
        isPlaying,
        playbackPosition,
        playbackDuration
    } = useAudioPlayback();

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
            if (e.data.action.type === 'GO_BACK') {
                e.preventDefault();
                await save();
                navigation.dispatch(e.data.action);
            }
        });
        return unsubscribe;
    }, [navigation, save]);

    useEffect(() => {
        const appStateSubscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                // Force re-render when app comes to foreground to fix layout issues
                setKavKey(prev => prev + 1);
            }
        });

        return () => {
            appStateSubscription.remove();
        };
    }, []);

    const toggleStatus = () => {
        const statuses = ['Idea', 'En Progreso', 'Finalizado'];
        const currentIndex = statuses.indexOf(projectData.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        updateProject({ status: statuses[nextIndex] });
    };

    const handleMenuOption = async (option) => {
        setShowMenu(false);
        switch (option) {
            case 'image':
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    base64: true,
                });
                if (!result.canceled) console.log('Image selected');
                break;
            case 'toggleRecord':
                updateProject({ hideRecordButton: !projectData.hideRecordButton });
                break;
            case 'delete':
                Alert.alert(
                    "Eliminar Proyecto",
                    "¿Estás seguro? Esta acción no se puede deshacer.",
                    [{ text: "Cancelar", style: "cancel" },
                    {
                        text: "Eliminar", style: "destructive", onPress: async () => {
                            await deleteProject(projectData.id);
                            navigation.navigate('Home');
                        }
                    }]
                );
                break;
        }
    };

    if (!isLoaded) return <View className="flex-1 bg-background dark:bg-background-dark" />;

    return (
        <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={['top']}>
            {/* Header - Outside KeyboardAvoidingView to stay fixed */}
            <ProjectHeader
                title={projectData.title}
                status={projectData.status}
                onToggleStatus={toggleStatus}
                onShowMenu={() => setShowMenu(true)}
            />

            <KeyboardAvoidingView
                key={kavKey}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={KEYBOARD_OFFSET}
                className="flex-1"
            >
                {/* Tabs */}
                <Tab.Navigator
                    tabBarPosition="bottom"
                    screenOptions={{
                        tabBarStyle: {
                            backgroundColor: '#fff',
                            borderTopWidth: 1,
                            borderTopColor: '#e5e7eb',
                            elevation: 0,
                            shadowOpacity: 0,
                        },
                        tabBarIndicatorStyle: { backgroundColor: '#8b5cf6', height: 3, top: 0 },
                        tabBarLabelStyle: { textTransform: 'none', fontWeight: '600', fontSize: 12, marginTop: 0 },
                        tabBarActiveTintColor: '#8b5cf6',
                        tabBarInactiveTintColor: '#888',
                        tabBarIconStyle: { marginBottom: -4 },
                        tabBarShowIcon: true,
                    }}
                    sceneContainerStyle={{ backgroundColor: 'transparent' }}
                >
                    <Tab.Screen
                        name="Letra"
                        children={() => (
                            <LyricsTab
                                onStartInlineRecording={() => startRecording(true)}
                                onStopRecording={stopRecording}
                                isRecording={isRecording && isInlineRecording}
                                recordingDuration={recordingDuration}
                                metering={metering}
                                onCursorChange={setCursorPosition}
                            />
                        )}
                        options={{ tabBarIcon: ({ color }) => <FileText size={18} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Grabaciones"
                        children={() => (
                            <RecordingsTab
                                onPlayRecording={handleTogglePlay}
                                currentPlayingId={currentPlayingId}
                                isPlaying={isPlaying}
                                playbackPosition={playbackPosition}
                                playbackDuration={playbackDuration}
                                onSeek={handleSeek}
                            />
                        )}
                        options={{ tabBarIcon: ({ color }) => <Mic size={18} color={color} /> }}
                    />
                    <Tab.Screen
                        name="Notas"
                        component={NotesTab}
                        options={{ tabBarIcon: ({ color }) => <BookOpen size={18} color={color} /> }}
                    />
                </Tab.Navigator>
            </KeyboardAvoidingView>

            {/* FAB (Global Recording) - Only show if NOT recording inline */}
            {!projectData.hideRecordButton && !isInlineRecording && (
                <TouchableOpacity
                    onPress={() => startRecording(false)}
                    className="absolute bottom-20 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg bg-primary dark:bg-primary-dark"
                    style={{ elevation: 5 }}
                >
                    <Mic size={24} color="white" />
                </TouchableOpacity>
            )}

            {/* Recording Overlay - Only show if NOT inline recording */}
            <RecordingOverlay
                visible={isRecording && !isInlineRecording}
                onStop={stopRecording}
                duration={recordingDuration}
                metering={metering}
            />

            {/* Menu Modal */}
            <Modal visible={showMenu} transparent={true} animationType="fade" onRequestClose={() => setShowMenu(false)}>
                <TouchableOpacity className="flex-1 bg-black/20" activeOpacity={1} onPress={() => setShowMenu(false)}>
                    <View className="absolute top-24 right-4 bg-card dark:bg-card-dark rounded-xl shadow-xl p-2 w-64 border border-border dark:border-border-dark">
                        <TouchableOpacity onPress={() => handleMenuOption('image')} className="flex-row items-center p-3">
                            <ImageIcon size={16} className="text-black dark:text-white mr-3" color="#888" />
                            <Text className="text-black dark:text-white">Agregar imagen</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleMenuOption('toggleRecord')} className="flex-row items-center p-3">
                            {projectData.hideRecordButton ? <Eye size={16} className="text-black dark:text-white mr-3" color="#888" /> : <EyeOff size={16} className="text-black dark:text-white mr-3" color="#888" />}
                            <Text className="text-black dark:text-white">{projectData.hideRecordButton ? 'Mostrar' : 'Ocultar'} botón de grabación</Text>
                        </TouchableOpacity>
                        <View className="h-[1px] bg-border dark:bg-border-dark my-1" />
                        <TouchableOpacity onPress={() => handleMenuOption('delete')} className="flex-row items-center p-3">
                            <Trash2 size={16} className="text-destructive mr-3" color="#ef4444" />
                            <Text className="text-destructive">Eliminar proyecto</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

export default function ProjectEditorScreen() {
    const route = useRoute();
    const { projectId, isNew } = route.params || {};
    return (
        <ProjectProvider projectId={projectId} isNew={isNew}>
            <ProjectEditorContent />
        </ProjectProvider>
    );
}

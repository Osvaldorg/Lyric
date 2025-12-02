import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Calendar, Clock, Image as ImageIcon } from 'lucide-react-native';
import { getProjects } from '../utils/storage';

export default function ProjectListScreen() {
    const navigation = useNavigation();
    const [projects, setProjects] = useState([]);

    useFocusEffect(
        React.useCallback(() => {
            loadProjects();
        }, [])
    );

    const loadProjects = async () => {
        const data = await getProjects();
        setProjects(data.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
    };

    const handleCreateProject = () => {
        const newId = Date.now().toString();
        navigation.navigate('Editor', { projectId: newId, isNew: true });
    };

    const handleOpenProject = (project) => {
        navigation.navigate('Editor', { projectId: project.id, projectTitle: project.title });
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'finalizado':
                return 'bg-green-500/20 border-green-500/50 text-green-500';
            case 'idea':
                return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500';
            default: // En Progreso
                return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
        }
    };

    const renderItem = ({ item }) => {
        const statusStyle = getStatusColor(item.status);
        const statusText = item.status || 'En Progreso';

        let snippet = 'Sin contenido';
        if (Array.isArray(item.lyrics)) {
            const firstTextBlock = item.lyrics.find(b => b.type === 'text' && b.content && b.content.trim().length > 0);
            if (firstTextBlock) {
                snippet = firstTextBlock.content.split('\n')[0];
            }
        } else if (typeof item.lyrics === 'string' && item.lyrics.length > 0) {
            snippet = item.lyrics.split('\n')[0];
        } else if (item.notes) {
            snippet = item.notes.split('\n')[0];
        }

        return (
            <TouchableOpacity
                onPress={() => handleOpenProject(item)}
                className="bg-card dark:bg-card-dark rounded-xl p-3 mb-3 border border-border dark:border-border-dark flex-row"
            >
                {/* Thumbnail */}
                <View className="w-20 h-20 rounded-lg bg-muted dark:bg-muted-dark items-center justify-center mr-3 overflow-hidden">
                    <ImageIcon size={24} className="text-muted-foreground" color="#666" />
                </View>

                {/* Content */}
                <View className="flex-1 justify-between">
                    {/* Header */}
                    <View className="flex-row justify-between items-start">
                        <View className="flex-row items-center flex-1 mr-2">
                            <Text className="font-bold text-base text-black dark:text-white" numberOfLines={1}>
                                {item.title}
                            </Text>
                        </View>

                        <View className={`px-2 py-0.5 rounded border ${statusStyle.split(' ')[0]} ${statusStyle.split(' ')[1]}`}>
                            <Text className={`text-[10px] font-medium ${statusStyle.split(' ')[2]}`}>
                                {statusText}
                            </Text>
                        </View>
                    </View>

                    {/* Snippet */}
                    <Text className="text-sm text-muted-foreground dark:text-gray-400 mt-1" numberOfLines={1}>
                        {snippet}
                    </Text>

                    {/* Footer Metadata */}
                    <View className="flex-row items-center mt-2 space-x-4">
                        <View className="flex-row items-center">
                            <Calendar size={12} className="text-muted-foreground mr-1" color="#888" />
                            <Text className="text-xs text-muted-foreground dark:text-gray-500">
                                {formatDate(item.id ? parseInt(item.id) : null)}
                            </Text>
                        </View>
                        <View className="flex-row items-center ml-3">
                            <Clock size={12} className="text-muted-foreground mr-1" color="#888" />
                            <Text className="text-xs text-muted-foreground dark:text-gray-500">
                                {formatDate(item.lastModified)}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
            <View className="p-4 border-b border-border dark:border-border-dark flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-primary dark:text-primary-dark">Mis Canciones</Text>
                <TouchableOpacity onPress={handleCreateProject} className="bg-primary dark:bg-primary-dark p-2 rounded-full">
                    <Plus color="white" size={24} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <Text className="text-muted-foreground dark:text-gray-400">No tienes proyectos aún.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Tag, FileText } from 'lucide-react-native';

export default function ProjectNotes({
    status, setStatus,
    genre, setGenre,
    mood, setMood,
    notes, setNotes,
    createdAt, lastModified,
    lyrics, recordings
}) {

    const genres = ['Pop', 'Rock', 'Balada', 'Folk', 'Latino', 'Reggaeton', 'Indie', 'Acústico', 'Electrónico', 'Jazz', 'Blues', 'Country'];
    const moods = ['Romántico', 'Melancólico', 'Alegre', 'Nostálgico', 'Energético', 'Reflexivo', 'Apasionado', 'Tranquilo', 'Rebelde', 'Esperanzador'];

    const toggleSelection = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (s) => {
        if (status === s) {
            switch (s) {
                case 'Idea': return 'bg-yellow-500/20 border-yellow-500 text-yellow-500';
                case 'En Progreso': return 'bg-blue-500/20 border-blue-500 text-blue-400';
                case 'Finalizado': return 'bg-green-500/20 border-green-500 text-green-500';
            }
        }
        return 'bg-muted dark:bg-muted-dark border-transparent text-muted-foreground dark:text-gray-400';
    };

    return (
        <ScrollView className="flex-1 bg-background dark:bg-background-dark p-4">

            {/* Status Section */}
            <View className="mb-6 bg-card dark:bg-card-dark p-4 rounded-xl border border-border dark:border-border-dark shadow-sm">
                <View className="flex-row items-center mb-4">
                    <Tag size={20} className="text-primary dark:text-primary-dark mr-2" color="#8b5cf6" />
                    <Text className="text-lg font-bold text-black dark:text-white">Estado del Proyecto</Text>
                </View>
                <View className="flex-row justify-between gap-3">
                    {['Idea', 'En Progreso', 'Finalizado'].map((s) => (
                        <TouchableOpacity
                            key={s}
                            onPress={() => setStatus(s)}
                            className={`flex-1 items-center justify-center py-3 rounded-lg border ${getStatusColor(s).split(' ')[0]} ${getStatusColor(s).split(' ')[1]}`}
                        >
                            <Text className={`font-medium text-xs ${getStatusColor(s).split(' ')[2]}`}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Tags Section */}
            <View className="mb-6 bg-card dark:bg-card-dark p-4 rounded-xl border border-border dark:border-border-dark shadow-sm">
                <View className="flex-row items-center mb-4">
                    {/* Icon removed as requested */}
                    <Text className="text-lg font-bold text-black dark:text-white">Etiquetas</Text>
                </View>

                <Text className="text-sm font-semibold text-muted-foreground dark:text-gray-400 mb-3 uppercase tracking-wider">Género</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {genres.map((g) => (
                        <TouchableOpacity
                            key={g}
                            onPress={() => toggleSelection(genre, setGenre, g)}
                            className={`px-3 py-1.5 rounded-full border ${genre.includes(g) ? 'bg-primary/20 border-primary' : 'bg-muted dark:bg-muted-dark border-transparent'}`}
                        >
                            <Text className={`text-sm ${genre.includes(g) ? 'text-primary dark:text-primary-dark font-medium' : 'text-muted-foreground dark:text-gray-400'}`}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text className="text-sm font-semibold text-muted-foreground dark:text-gray-400 mb-3 uppercase tracking-wider">Estado de Ánimo</Text>
                <View className="flex-row flex-wrap gap-2">
                    {moods.map((m) => (
                        <TouchableOpacity
                            key={m}
                            onPress={() => toggleSelection(mood, setMood, m)}
                            className={`px-3 py-1.5 rounded-full border ${mood.includes(m) ? 'bg-primary/20 border-primary' : 'bg-muted dark:bg-muted-dark border-transparent'}`}
                        >
                            <Text className={`text-sm ${mood.includes(m) ? 'text-primary dark:text-primary-dark font-medium' : 'text-muted-foreground dark:text-gray-400'}`}>{m}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Notes Section */}
            <View className="mb-6 bg-card dark:bg-card-dark p-4 rounded-xl border border-border dark:border-border-dark shadow-sm">
                <View className="flex-row items-center mb-3">
                    <FileText size={20} className="text-primary dark:text-primary-dark mr-2" color="#8b5cf6" />
                    <Text className="text-lg font-bold text-black dark:text-white">Notas</Text>
                </View>
                <View className="bg-muted dark:bg-muted-dark rounded-lg p-3 min-h-[120px]">
                    <TextInput
                        className="text-black dark:text-white text-base leading-relaxed flex-1"
                        multiline
                        placeholder="Escribe notas sobre la canción, ideas, referencias..."
                        placeholderTextColor="#666"
                        value={notes}
                        onChangeText={setNotes}
                        textAlignVertical="top"
                    />
                </View>
                <Text className="text-right text-xs text-muted-foreground dark:text-gray-500 mt-2">
                    {notes ? notes.length : 0} caracteres
                </Text>
            </View>

            {/* Info Section */}
            <View className="mb-20 bg-card dark:bg-card-dark p-4 rounded-xl border border-border dark:border-border-dark shadow-sm">
                <Text className="text-lg font-bold text-black dark:text-white mb-4">Información</Text>

                <View className="space-y-3">
                    <View className="flex-row justify-between border-b border-border dark:border-border-dark pb-2">
                        <Text className="text-muted-foreground dark:text-gray-400">Creado</Text>
                        <Text className="text-black dark:text-white font-medium">{formatDate(createdAt)}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-border dark:border-border-dark pb-2">
                        <Text className="text-muted-foreground dark:text-gray-400">Última modificación</Text>
                        <Text className="text-black dark:text-white font-medium">{formatDate(lastModified)}</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-border dark:border-border-dark pb-2">
                        <Text className="text-muted-foreground dark:text-gray-400">Líneas de letra</Text>
                        <Text className="text-black dark:text-white font-medium">
                            {Array.isArray(lyrics)
                                ? lyrics.reduce((acc, block) => acc + (block.type === 'text' ? (block.content.split('\n').length) : 0), 0)
                                : (lyrics ? lyrics.split('\n').length : 0)
                            }
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-muted-foreground dark:text-gray-400">Grabaciones</Text>
                        <Text className="text-black dark:text-white font-medium">{recordings ? recordings.length : 0}</Text>
                    </View>
                </View>
            </View>

        </ScrollView>
    );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function ProjectHeader({ title, status, onToggleStatus, onShowMenu }) {
    const navigation = useNavigation();

    return (
        <View className="flex-row justify-between items-center p-4 border-b border-border dark:border-border-dark bg-card dark:bg-card-dark z-50">
            <View className="flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={20} className="text-black dark:text-white" color="#888" />
                </TouchableOpacity>
                <View>
                    <Text className="font-semibold text-base text-black dark:text-white">{title}</Text>
                    <TouchableOpacity onPress={onToggleStatus}>
                        <Text className="text-xs text-muted-foreground dark:text-gray-400 underline">{status}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity onPress={onShowMenu} className="p-1">
                <MoreVertical size={20} className="text-black dark:text-white" color="#888" />
            </TouchableOpacity>
        </View>
    );
}

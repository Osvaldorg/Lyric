import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getProject, saveProject } from '../utils/storage';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ projectId, isNew, children }) => {
    const [projectData, setProjectData] = useState({
        id: projectId,
        title: 'Nuevo Proyecto',
        status: 'En progreso',
        lyrics: [{ id: Date.now().toString(), type: 'text', content: '' }], // Default to block array
        notes: '',
        recordings: [],
        genre: [],
        mood: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        hideRecordButton: false,
    });

    const [isLoaded, setIsLoaded] = useState(false);

    // Load Data
    useEffect(() => {
        const load = async () => {
            if (projectId && !isNew) {
                const p = await getProject(projectId);
                if (p) {
                    // Migration: Convert string lyrics to block array if needed
                    if (typeof p.lyrics === 'string') {
                        p.lyrics = [{ id: Date.now().toString(), type: 'text', content: p.lyrics }];
                    } else if (!p.lyrics) {
                        p.lyrics = [{ id: Date.now().toString(), type: 'text', content: '' }];
                    }
                    setProjectData(prev => ({ ...prev, ...p }));
                }
            }
            setIsLoaded(true);
        };
        load();
    }, [projectId, isNew]);

    // Update Helper
    const updateProject = useCallback((updates) => {
        setProjectData(prev => ({
            ...prev,
            ...updates,
            lastModified: new Date().toISOString()
        }));
    }, []);

    // Save Function
    const save = useCallback(async () => {
        if (!isLoaded) return;
        await saveProject(projectData);
    }, [projectData, isLoaded]);

    return (
        <ProjectContext.Provider value={{ projectData, updateProject, save, isLoaded }}>
            {children}
        </ProjectContext.Provider>
    );
};

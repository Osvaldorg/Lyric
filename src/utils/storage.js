import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_KEY = 'lyriclab_projects';

export const getProjects = async () => {
    try {
        const json = await AsyncStorage.getItem(PROJECTS_KEY);
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const getProject = async (id) => {
    const projects = await getProjects();
    return projects.find(p => p.id === id);
};

export const saveProject = async (project) => {
    try {
        const projects = await getProjects();
        const index = projects.findIndex(p => p.id === project.id);

        let newProjects;
        if (index >= 0) {
            newProjects = [...projects];
            newProjects[index] = { ...project, lastModified: new Date().toISOString() };
        } else {
            newProjects = [...projects, { ...project, lastModified: new Date().toISOString() }];
        }

        await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const deleteProject = async (id) => {
    try {
        const projects = await getProjects();
        const newProjects = projects.filter(p => p.id !== id);
        await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

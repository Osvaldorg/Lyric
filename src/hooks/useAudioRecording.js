import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';

export function useAudioRecording(projectData, updateProject, cursorPosition) {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [metering, setMetering] = useState(-160);
    const [isInlineRecording, setIsInlineRecording] = useState(false);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const timerRef = useRef(null);

    async function startRecording(inline = false) {
        try {
            if (permissionResponse.status !== 'granted') {
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
                (status) => {
                    if (status.metering !== undefined) {
                        setMetering(status.metering);
                    }
                },
                100
            );

            setRecording(recording);
            setIsRecording(true);
            setIsInlineRecording(inline);
            setRecordingDuration(0);

            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'No se pudo iniciar la grabación.');
        }
    }

    async function stopRecording() {
        if (!recording) return;

        clearInterval(timerRef.current);
        setIsRecording(false);
        setMetering(-160);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            const mins = Math.floor(recordingDuration / 60);
            const secs = recordingDuration % 60;
            const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

            if (isInlineRecording) {
                const newBlock = {
                    id: Date.now().toString(),
                    type: 'audio',
                    uri: uri,
                    duration: durationStr
                };

                let newContent = Array.isArray(projectData.lyrics) ? [...projectData.lyrics] : [];

                // Insertion Logic
                if (cursorPosition && cursorPosition.blockId) {
                    const blockIndex = newContent.findIndex(b => b.id === cursorPosition.blockId);
                    if (blockIndex !== -1) {
                        const block = newContent[blockIndex];
                        if (block.type === 'text') {
                            // Find split point: end of line after cursor
                            const text = block.content;
                            const cursorIdx = cursorPosition.index;

                            // Find next newline after cursor
                            let splitIdx = text.indexOf('\n', cursorIdx);
                            if (splitIdx === -1) splitIdx = text.length; // End of string if no newline

                            const preText = text.substring(0, splitIdx);
                            const postText = text.substring(splitIdx);

                            const preBlock = { ...block, content: preText };
                            const postBlock = {
                                id: (Date.now() + 1).toString(),
                                type: 'text',
                                content: postText
                            };

                            newContent.splice(blockIndex, 1, preBlock, newBlock, postBlock);
                        } else {
                            newContent.splice(blockIndex + 1, 0, newBlock);
                        }
                    } else {
                        newContent.push(newBlock);
                    }
                } else {
                    newContent.push(newBlock);
                }

                updateProject({ lyrics: newContent });

            } else {
                const newRecording = {
                    id: Date.now().toString(),
                    name: `Grabación ${new Date().toLocaleTimeString()}`,
                    uri: uri,
                    duration: durationStr,
                    date: new Date().toISOString()
                };
                updateProject({ recordings: [...projectData.recordings, newRecording] });
            }

        } catch (error) {
            console.error('Failed to stop recording', error);
        }

        setRecording(undefined);
        setRecordingDuration(0);
        setIsInlineRecording(false);
    }

    return {
        startRecording,
        stopRecording,
        isRecording,
        isInlineRecording,
        recordingDuration,
        metering
    };
}

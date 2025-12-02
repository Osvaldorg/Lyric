import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        checkPrivacyStatus();
    }, []);

    const checkPrivacyStatus = async () => {
        try {
            const status = await AsyncStorage.getItem('privacy_accepted');
            if (status === 'true') {
                setPrivacyAccepted(true);
            } else {
                setShowPrivacyModal(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAcceptPrivacy = async () => {
        try {
            await AsyncStorage.setItem('privacy_accepted', 'true');
            setPrivacyAccepted(true);
            setShowPrivacyModal(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeclinePrivacy = () => {
        Alert.alert(
            "Aviso Importante",
            "Es necesario aceptar el aviso de privacidad para utilizar LyricLab. La aplicación se cerrará o no podrás continuar.",
            [{ text: "Entendido" }]
        );
    };

    const handleAuth = async () => {
        if (!privacyAccepted) {
            setShowPrivacyModal(true);
            return;
        }
        if (!email || !password) {
            Alert.alert("Error", "Por favor ingresa correo y contraseña");
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                Alert.alert("Éxito", "Cuenta creada correctamente");
            }
            navigation.replace('Home');
        } catch (error) {
            let msg = error.message;
            if (error.code === 'auth/invalid-email') msg = "El correo electrónico no es válido.";
            if (error.code === 'auth/user-not-found') msg = "No existe una cuenta con este correo.";
            if (error.code === 'auth/wrong-password') msg = "Contraseña incorrecta.";
            if (error.code === 'auth/email-already-in-use') msg = "Este correo ya está registrado.";
            if (error.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres.";
            Alert.alert("Error de autenticación", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background dark:bg-background-dark justify-center p-6">
            <View className="w-full max-w-sm mx-auto">
                <Text className="text-4xl font-bold text-primary dark:text-primary-dark mb-2 text-center">
                    LyricLab
                </Text>
                <Text className="text-center text-muted-foreground dark:text-gray-400 mb-8">
                    Tu estudio de composición portátil
                </Text>

                <View className="bg-card dark:bg-card-dark p-6 rounded-xl shadow-sm border border-border dark:border-border-dark">
                    <Text className="text-xl font-semibold mb-6 text-black dark:text-white text-center">
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </Text>

                    <TextInput
                        className="w-full bg-muted dark:bg-muted-dark p-4 rounded-lg mb-4 text-black dark:text-white"
                        placeholder="Correo electrónico"
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        className="w-full bg-muted dark:bg-muted-dark p-4 rounded-lg mb-6 text-black dark:text-white"
                        placeholder="Contraseña"
                        placeholderTextColor="#9ca3af"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        className="w-full bg-primary dark:bg-primary-dark p-4 rounded-lg items-center mb-4"
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                {isLogin ? 'Entrar' : 'Registrarse'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                        <Text className="text-center text-primary dark:text-primary-dark">
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => setShowPrivacyModal(true)} className="mt-8">
                    <Text className="text-center text-xs text-muted-foreground dark:text-gray-500 underline">
                        Ver Aviso de Privacidad
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showPrivacyModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => { }} // Prevent closing with back button
            >
                <View className="flex-1 justify-center items-center bg-black/60 p-4">
                    <View className="bg-card dark:bg-card-dark w-full max-w-md rounded-2xl p-6 shadow-2xl border border-border dark:border-border-dark">
                        <Text className="text-2xl font-bold mb-4 text-black dark:text-white text-center">Aviso de Privacidad</Text>
                        <View className="h-[1px] bg-border dark:bg-border-dark w-full mb-4" />

                        <ScrollView className="max-h-80 mb-6">
                            <Text className="text-base text-muted-foreground dark:text-gray-300 leading-6">
                                <Text className="font-bold">Última actualización: 30 de Noviembre, 2025</Text>
                                {'\n\n'}
                                Bienvenido a LyricLab. Para proteger tus derechos y los nuestros, necesitamos que aceptes nuestro Aviso de Privacidad.
                                {'\n\n'}
                                <Text className="font-bold">1. Recopilación de Datos:</Text> Recopilamos tu correo electrónico para la gestión de tu cuenta y autenticación segura. Tus letras y grabaciones se almacenan localmente en tu dispositivo.
                                {'\n\n'}
                                <Text className="font-bold">2. Uso de la Información:</Text> Utilizamos tu información únicamente para proporcionarte el servicio de LyricLab. No vendemos ni compartimos tus datos con terceros.
                                {'\n\n'}
                                <Text className="font-bold">3. Permisos del Dispositivo:</Text> Requerimos acceso al micrófono para la función de grabación y a la galería para añadir imágenes a tus proyectos.
                                {'\n\n'}
                                <Text className="font-bold">4. Tus Derechos:</Text> Puedes revocar el consentimiento en cualquier momento eliminando tu cuenta o los datos de la aplicación, aunque esto impedirá el uso continuo del servicio.
                                {'\n\n'}
                                Al hacer clic en "Aceptar", confirmas que has leído y aceptas estos términos.
                            </Text>
                        </ScrollView>

                        <View className="flex-row justify-end space-x-4 pt-2">
                            {privacyAccepted ? (
                                <TouchableOpacity
                                    onPress={async () => {
                                        await AsyncStorage.removeItem('privacy_accepted');
                                        setPrivacyAccepted(false);
                                        setShowPrivacyModal(false);
                                        Alert.alert("Permisos Revocados", "Has revocado los permisos. Deberás aceptarlos nuevamente para iniciar sesión.");
                                    }}
                                    className="p-4"
                                >
                                    <Text className="text-destructive font-semibold text-base">Revocar Permisos</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleDeclinePrivacy}
                                    className="p-4"
                                >
                                    <Text className="text-destructive font-semibold text-base">Rechazar</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={handleAcceptPrivacy}
                                className="bg-primary dark:bg-primary-dark px-8 py-4 rounded-xl shadow-lg"
                            >
                                <Text className="text-white font-bold text-base">Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

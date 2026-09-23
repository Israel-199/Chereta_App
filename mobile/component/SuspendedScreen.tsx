import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth';
import { translations } from '../translations';
import { getFontFamily } from '../utils/fontHelper';

const SuspendedScreen = () => {
    const language = useAuthStore((state) => state.language);
    const t = translations[language] || translations['English'];

    const titleFont = useMemo(() => ({ fontFamily: getFontFamily(language, true) }), [language]);
    const regularFont = useMemo(() => ({ fontFamily: getFontFamily(language, false) }), [language]);

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="account-off" size={80} color="#DC2626" />
            </View>
            <Text style={[styles.title, titleFont]}>{t.accountSuspended || "Account Suspended"}</Text>
            <Text style={[styles.subtitle, regularFont]}>
                {t.accountSuspendedDetail || (language === "አማርኛ" 
                    ? "አካውንትዎ ለጊዜው ታግዷል! እባክዎ ለበለጠ መረጃ ድጋፍ ሰጪ ቡድናችንን ያግኙ።" 
                    : "Your account has been temporarily suspended. Please contact our support team for more information.")
                }
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        color: '#DC2626',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 12,
        color: '#DC2626',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default SuspendedScreen;

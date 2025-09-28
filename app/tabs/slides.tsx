import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const slides = [
    { id: '1', title: 'Bem-vindo', description: ' Monitore a produção e o consumo de sua energia em tempo real, diretamente pelo seu celular.' },
    { id: '2', title: 'Explore Recursos', description: 'Identifique picos de consumo, otimize seu uso e veja a economia refletida na sua conta de luz.' },
    { id: '3', title: 'Fique conectado', description: 'Receba atualizações em tempo real.' },
];

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef(null);
    const router = useRouter();
    
    useEffect(() => {
        const checkOnboarding = async () => {
            const seen = await AsyncStorage.getItem("hasSeenOnboarding");
            if (seen) {
                router.replace("/tabs/home");
            } else {
                setLoading(false);
            }
        };
        checkOnboarding();
    }, []);

    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // marca como visto
            await AsyncStorage.setItem("hasSeenOnboarding", "true");
            router.replace("/pagamento/pagamento");
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.slide, { width }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            {currentIndex === slides.length - 1 && (
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>Começar agora</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fcbb30" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />
            <View style={styles.indicatorContainer}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            currentIndex === index && styles.activeIndicator
                        ]}
                    />
                ))}
            </View>
            {currentIndex < slides.length - 1 && (
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>Próximo</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    slide:
    {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title:
    {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10
    },
    description:
    {
        fontSize: 18,
        textAlign: 'center',
        color: '#555'
    },
    indicatorContainer:
    {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 100
    },
    indicator:
    {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ccc',
        margin: 5
    },
    activeIndicator:
        { backgroundColor: '#fcbb30' },
    button:
    {
        marginTop: 30,
        backgroundColor: '#fcbb30',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25
    },
    buttonText:
    {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    nextButton:
    {
        position: 'absolute',
        bottom: 40,
        right: 30,
        backgroundColor: '#fcbb30',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20
    },
    nextButtonText:
    {
        color: '#000',
        fontWeight: 'bold'
    },
    loadingContainer:
    {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
});

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
    { 
        id: '1', 
        title: 'Gestão Inteligente de Energia', 
        description: 'A plataforma corporativa para monitoramento, análise e eficiência em sistemas fotovoltaicos.' 
    },
    { 
        id: '2', 
        title: 'Visão Estratégica em Tempo Real', 
        description: 'Acompanhe geração, desempenho dos módulos, consumo e indicadores essenciais para tomada de decisão.' 
    },
    { 
        id: '3', 
        title: 'Resultados Sustentáveis', 
        description: 'Reduza custos operacionais, maximize produtividade e fortaleça o compromisso ambiental da sua empresa.' 
    },
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
                router.replace("/empresarial/home");
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
            router.replace("/empresarial/home");
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
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        justifyContent: 'center',
        alignItems: 'center'
    },
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 14,
        letterSpacing: 0.5
    },
    description: {
        fontSize: 17,
        textAlign: 'center',
        color: '#4d4d4d',
        lineHeight: 24,
        maxWidth: '85%'
    },
    indicatorContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 110,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 50,
        backgroundColor: '#d9d9d9',
        marginHorizontal: 4
    },
    activeIndicator: {
        backgroundColor: '#ffc125', 
        width: 20,
    },
    button: {
        marginTop: 35,
        backgroundColor: '#ffc125',
        paddingVertical: 14,
        paddingHorizontal: 45,
        borderRadius: 30,
        shadowColor: '#ffc125',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
    },
    buttonText: {
        color: '#000',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.5
    },
    nextButton: {
        position: 'absolute',
        bottom: 45,
        right: 28,
        backgroundColor: '#ffc125',
        paddingVertical: 10,
        paddingHorizontal: 22,
        borderRadius: 25,
        elevation: 3
    },
    nextButtonText: {
        color: '#000',
        fontSize: 15,
        fontWeight: '600'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
});

import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function ScheduleScreen() {
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [description, setDescription] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const services = [
    { id: "1", name: "Manutenção Preventiva", icon: "build" },
    { id: "2", name: "Manutenção Corretiva", icon: "handyman" },
    { id: "3", name: "Instalação", icon: "computer" },
    { id: "4", name: "Configuração", icon: "settings" },
    { id: "5", name: "Suporte Técnico", icon: "support_agent" },
    { id: "6", name: "Outros", icon: "more_horiz" }
  ];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowTimePicker(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const showSuccessAnimation = () => {
    setShowConfetti(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setShowConfetti(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };

  const handleSchedule = () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const selectedServiceName = services.find(s => s.id === selectedService)?.name;

    Alert.alert(
      "Agendamento Confirmado!",
      `Serviço: ${selectedServiceName}
Data: ${formatDate(selectedDate)}
Horário: ${selectedTime}
Cliente: ${customerName}`,
      [{
        text: "Perfeito!",
        onPress: () => {
          showSuccessAnimation();
          resetForm();
        }
      }]
    );
  };

  const resetForm = () => {
    setSelectedService("");
    setSelectedDate("");
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setDescription("");
  };

  const today = getToday();

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#ffc125',
      selectedTextColor: 'white'
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
    >
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Agendar Serviço</Text>
            <Text style={styles.subtitle}>Preencha os dados abaixo para agendar seu serviço</Text>
          </View>

          {/* Card Serviços */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tipo de Serviço *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {services.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceButton,
                    selectedService === service.id && styles.serviceButtonSelected
                  ]}
                  onPress={() => setSelectedService(service.id)}
                >
                  <View style={[
                    styles.serviceIconContainer,
                    selectedService === service.id && styles.serviceIconContainerSelected
                  ]}>
                    <Icon name={service.icon} size={24} color={selectedService === service.id ? "#ffc125" : "#6b7280"} />
                  </View>
                  <Text style={[
                    styles.serviceText,
                    selectedService === service.id && styles.serviceTextSelected
                  ]}>
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Card Data e Hora */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data e Horário *</Text>

            <View style={styles.datetimeRow}>
              <TouchableOpacity 
                style={styles.datetimeButton}
                onPress={() => setShowCalendar(true)}
              >
                <Icon name="calendar-today" size={20} color="#ffc125" />
                <View style={styles.datetimeTextContainer}>
                  <Text style={styles.datetimeLabel}>Data</Text>
                  <Text>{selectedDate ? formatDate(selectedDate) : "Selecionar data"}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity 
                style={styles.datetimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Icon name="access-time" size={20} color="#ffc125" />
                <View style={styles.datetimeTextContainer}>
                  <Text style={styles.datetimeLabel}>Horário</Text>
                  <Text>{selectedTime || "Selecionar horário"}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal Calendário */}
          <Modal visible={showCalendar} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Selecionar Data</Text>
                  <TouchableOpacity onPress={() => setShowCalendar(false)}>
                    <Icon name="close" size={24} />
                  </TouchableOpacity>
                </View>

                <Calendar
                  minDate={today}
                  onDayPress={handleDateSelect}
                  markedDates={markedDates}
                />
              </View>
            </View>
          </Modal>

          {/* Inputs */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dados Pessoais</Text>

            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome completo *"
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Telefone/WhatsApp *"
                keyboardType="phone-pad"
                value={customerPhone}
                onChangeText={setCustomerPhone}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="location-on" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Endereço"
                value={customerAddress}
                onChangeText={setCustomerAddress}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="description" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descrição (opcional)"
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Botão */}
          <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
            <Text style={styles.scheduleButtonText}>Confirmar Agendamento</Text>
            <Icon name="arrow-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </ScrollView>

        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
            fadeOut
          />
        )}

        <Animated.View style={[styles.successMessage, { opacity: fadeAnim }]}>
          <Text style={styles.successTitle}>Agendamento Confirmado!</Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, paddingBottom: 100 },
  header: { alignItems: "center", marginBottom: 20, marginTop: 10 },
  title: { fontSize: 32, fontWeight: "700", color: "#000" },
  subtitle: { fontSize: 16, color: "#64748b", textAlign: "center" },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 6
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  serviceButton: { alignItems: "center", marginRight: 16 },
  serviceButtonSelected: { opacity: 0.9 },
  serviceIconContainer: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff"
  },
  serviceIconContainerSelected: { borderColor: "#ffc125", backgroundColor: "#faefd3" },
  serviceText: { color: "#64748b" },
  serviceTextSelected: { color: "#ffc125", fontWeight: "700" },
  datetimeRow: { flexDirection: "row", alignItems: "center" },
  datetimeButton: { flex: 1, flexDirection: "row", paddingVertical: 12 },
  separator: { width: 1, height: 40, backgroundColor: "#e2e8f0", marginHorizontal: 16 },
  datetimeLabel: { fontSize: 12, color: "#666" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: { padding: 16 },
  input: { flex: 1, padding: 16, paddingLeft: 0 },
  textArea: { height: 100 },
  scheduleButton: {
    backgroundColor: "#ffc125",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10
  },
  scheduleButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  successMessage: {
    position: "absolute",
    top: "40%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center"
  },
  successTitle: { fontSize: 20, fontWeight: "700", color: "#ffc125" }
});

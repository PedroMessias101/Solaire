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
  Dimensions
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

  // CORREÇÃO: Função formatDate corrigida
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Garante que a data seja tratada corretamente
    const date = new Date(dateString + 'T00:00:00'); // Adiciona horário para evitar problemas de fuso
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // CORREÇÃO: Função para obter a data atual no formato YYYY-MM-DD
  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      Alert.alert(
        "Atenção", 
        "Por favor, preencha todos os campos obrigatórios.",
        [{ text: "Entendi", style: "cancel" }]
      );
      return;
    }

    const selectedServiceName = services.find(s => s.id === selectedService)?.name;

    // CORREÇÃO: Usando a função formatDate corrigida
    Alert.alert(
      "Agendamento Confirmado!",
      `**Detalhes do Agendamento:**\n\nServiço: ${selectedServiceName}\nData: ${formatDate(selectedDate)}\nHorário: ${selectedTime}\nCliente: ${customerName}\n\nEntraremos em contato em breve para confirmar todos os detalhes.`,
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

  // CORREÇÃO: Usando a função getToday corrigida
  const today = getToday();
  
  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#ffc125',
      selectedTextColor: 'white'
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Agendar Serviço</Text>
          <Text style={styles.subtitle}>Preencha os dados abaixo para agendar seu serviço</Text>
        </View>

        {/* Card de Serviços */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tipo de Serviço *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
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
                  <Icon 
                    name={service.icon} 
                    size={24} 
                    color={selectedService === service.id ? "#ffc125" : "#6b7280"} 
                  />
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

        {/* Card de Data e Hora */}
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
                <Text style={selectedDate ? styles.datetimeValue : styles.datetimePlaceholder}>
                  {selectedDate ? formatDate(selectedDate) : "Selecionar data"}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity 
              style={styles.datetimeButton} 
              onPress={() => setShowTimePicker(true)}
            >
              <Icon name="access-time" size={20} color="#ffc125" />
              <View style={styles.datetimeTextContainer}>
                <Text style={styles.datetimeLabel}>Horário</Text>
                <Text style={selectedTime ? styles.datetimeValue : styles.datetimePlaceholder}>
                  {selectedTime ? selectedTime : "Selecionar horário"}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal do Calendário */}
        <Modal
          visible={showCalendar}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Data</Text>
                <TouchableOpacity 
                  style={styles.closeIcon}
                  onPress={() => setShowCalendar(false)}
                >
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <Calendar
                minDate={today}
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#374151',
                  selectedDayBackgroundColor: '#ffc125',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#ffc125',
                  dayTextColor: '#1f2937',
                  textDisabledColor: '#d1d5db',
                  dotColor: '#ffc125',
                  selectedDotColor: '#ffffff',
                  arrowColor: '#ffc125',
                  monthTextColor: '#1f2937',
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
                style={styles.calendar}
              />
            </View>
          </View>
        </Modal>

        {/* Modal de Horários */}
        <Modal
          visible={showTimePicker}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Horário</Text>
                <TouchableOpacity 
                  style={styles.closeIcon}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.timeGrid}>
                <View style={styles.timeRow}>
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        selectedTime === time && styles.timeOptionSelected
                      ]}
                      onPress={() => handleTimeSelect(time)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        selectedTime === time && styles.timeOptionTextSelected
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Card de Dados Pessoais */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados Pessoais</Text>
          
          <View style={styles.inputContainer}>
            <Icon name="person" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nome completo *"
              placeholderTextColor="#9ca3af"
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="phone" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Telefone/WhatsApp *"
              placeholderTextColor="#9ca3af"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="location-on" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Endereço para atendimento"
              placeholderTextColor="#9ca3af"
              value={customerAddress}
              onChangeText={setCustomerAddress}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="description" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição do serviço (opcional)"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Botão de Agendar */}
        <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
          <Text style={styles.scheduleButtonText}>Confirmar Agendamento</Text>
          <Icon name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        <Text style={styles.note}>
          * Campos obrigatórios{'\n'}
          Entraremos em contato para confirmar o agendamento.
        </Text>
      </ScrollView>

      {/* Confetti Cannon */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
          explosionSpeed={300}
          fallSpeed={3000}
          fadeOut={true}
        />
      )}

      {/* Mensagem de Sucesso com Animação */}
      <Animated.View style={[styles.successMessage, { opacity: fadeAnim }]}>
        <View style={styles.successContent}>
          <Icon name="celebration" size={40} color="#ffc125" />
          <Text style={styles.successTitle}>Agendamento Confirmado!</Text>
          <Text style={styles.successText}>
            Seu agendamento foi realizado com sucesso!
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  servicesScroll: {
    marginBottom: 8,
  },
  serviceButton: {
    alignItems: "center",
    marginRight: 16,
    minWidth: 100,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#ffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#ffff",
  },
  serviceIconContainerSelected: {
    backgroundColor: "#faefd3ff",
    borderColor: "#ffc125",
  },
  serviceText: {
    color: "#64748b",
    fontWeight: "500",
    fontSize: 13,
    textAlign: "center",
  },
  serviceTextSelected: {
    color: "#ffc125",
    fontWeight: "600",
  },
  datetimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  datetimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  datetimeTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  datetimeLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  datetimeValue: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  datetimePlaceholder: {
    fontSize: 16,
    color: "#9ca3af",
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: {
    padding: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
    fontSize: 16,
    color: "#1e293b",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    margin: 20,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeIcon: {
    padding: 4,
  },
  calendar: {
    borderRadius: 0,
  },
  timeGrid: {
    maxHeight: 400,
    padding: 16,
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeOption: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    margin: 4,
    minWidth: "30%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  timeOptionSelected: {
    backgroundColor: "#ffc125",
    borderColor: "#ffc125",
  },
  timeOptionText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
  },
  timeOptionTextSelected: {
    color: "white",
  },
  scheduleButton: {
    backgroundColor: "#ffc125",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#ffc125",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scheduleButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  note: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  successMessage: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#ffc125',
  },
  successContent: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffc125',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});
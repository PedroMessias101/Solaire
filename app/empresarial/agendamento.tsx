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
  Platform,
  ActivityIndicator
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
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const services = [
    { id: "1", name: "Manutenção Preventiva", icon: "build" },
    { id: "2", name: "Manutenção Corretiva", icon: "handyman" },
    { id: "3", name: "Instalação", icon: "computer" },
    { id: "4", name: "Configuração", icon: "settings" },
    { id: "5", name: "Suporte Técnico", icon: "support" },
    { id: "6", name: "Outros", icon: "more" }
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

  const getContactDate = () => {
    if (!selectedDate) return "";
    const contactDate = new Date(selectedDate + 'T00:00:00');
    contactDate.setDate(contactDate.getDate() - 1);
    return contactDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const simulateProcessing = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };

  const validatePhone = (phone) => {
    // Remove caracteres não numéricos
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length >= 10 && cleanedPhone.length <= 11;
  };

  const handlePreview = () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!validatePhone(customerPhone)) {
      Alert.alert("Atenção", "Por favor, insira um telefone válido (10 ou 11 dígitos).");
      return;
    }

    setShowPreview(true);
  };

  const handleSchedule = async () => {
    setShowPreview(false);
    setIsLoading(true);

    try {
      await simulateProcessing();
      
      const selectedServiceName = services.find(s => s.id === selectedService)?.name;
      const contactDate = getContactDate();

      Alert.alert(
        "Agendamento Confirmado! 🎉",
        `Serviço: ${selectedServiceName}\nData: ${formatDate(selectedDate)}\nHorário: ${selectedTime}\nCliente: ${customerName}\n\n📞 Um técnico da Solaire entrará em contato no dia ${contactDate} para confirmar os detalhes da visita.`,
        [{
          text: "Entendido!",
          onPress: () => {
            showSuccessAnimation();
            resetForm();
          }
        }]
      );
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao processar seu agendamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.servicesScrollView}
            >
              {services.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceButton,
                    selectedService === service.id && styles.serviceButtonSelected
                  ]}
                  onPress={() => setSelectedService(service.id)}
                  activeOpacity={0.7}
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
                activeOpacity={0.7}
              >
                <Icon name="calendar-today" size={20} color="#ffc125" />
                <View style={styles.datetimeTextContainer}>
                  <Text style={styles.datetimeLabel}>Data</Text>
                  <Text style={selectedDate ? styles.datetimeValue : styles.datetimePlaceholder}>
                    {selectedDate ? formatDate(selectedDate) : "Selecionar data"}
                  </Text>
                </View>
                {selectedDate && (
                  <Icon name="check-circle" size={20} color="#4ade80" style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity 
                style={styles.datetimeButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Icon name="access-time" size={20} color="#ffc125" />
                <View style={styles.datetimeTextContainer}>
                  <Text style={styles.datetimeLabel}>Horário</Text>
                  <Text style={selectedTime ? styles.datetimeValue : styles.datetimePlaceholder}>
                    {selectedTime || "Selecionar horário"}
                  </Text>
                </View>
                {selectedTime && (
                  <Icon name="check-circle" size={20} color="#4ade80" style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Inputs */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Dados Pessoais <Text style={styles.requiredText}>(* obrigatório)</Text>
            </Text>

            <View style={[
              styles.inputContainer,
              customerName && styles.inputContainerValid,
              !customerName && styles.inputContainerError
            ]}>
              <Icon name="person" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nome completo *"
                value={customerName}
                onChangeText={setCustomerName}
              />
              {customerName ? (
                <Icon name="check-circle" size={20} color="#4ade80" style={styles.validationIcon} />
              ) : (
                <Icon name="error-outline" size={20} color="#ef4444" style={styles.validationIcon} />
              )}
            </View>

            <View style={[
              styles.inputContainer,
              customerPhone && validatePhone(customerPhone) && styles.inputContainerValid,
              customerPhone && !validatePhone(customerPhone) && styles.inputContainerError
            ]}>
              <Icon name="phone" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Telefone/WhatsApp *"
                keyboardType="phone-pad"
                value={customerPhone}
                onChangeText={setCustomerPhone}
              />
              {customerPhone ? (
                validatePhone(customerPhone) ? (
                  <Icon name="check-circle" size={20} color="#4ade80" style={styles.validationIcon} />
                ) : (
                  <Icon name="error-outline" size={20} color="#ef4444" style={styles.validationIcon} />
                )
              ) : (
                <Icon name="error-outline" size={20} color="#ef4444" style={styles.validationIcon} />
              )}
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
          <TouchableOpacity 
            style={styles.scheduleButton} 
            onPress={handlePreview}
            activeOpacity={0.8}
          >
            <Text style={styles.scheduleButtonText}>Visualizar Agendamento</Text>
            <Icon name="visibility" size={22} color="#000" />
          </TouchableOpacity>
        </ScrollView>

        {/* Modal Calendário - Fora do ScrollView */}
        <Modal 
          visible={showCalendar} 
          transparent 
          animationType="slide"
          onRequestClose={() => setShowCalendar(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Data</Text>
                <TouchableOpacity 
                  onPress={() => setShowCalendar(false)}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <Calendar
                minDate={today}
                onDayPress={handleDateSelect}
                markedDates={markedDates}
                style={styles.calendar}
                theme={{
                  todayTextColor: '#ffc125',
                  selectedDayBackgroundColor: '#ffc125',
                  selectedDayTextColor: '#ffffff',
                  arrowColor: '#ffc125',
                }}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Modal Horários - Fora do ScrollView */}
        <Modal 
          visible={showTimePicker} 
          transparent 
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <TouchableOpacity 
              style={[styles.modalContent, styles.timeModalContent]}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Selecionar Horário</Text>
                <TouchableOpacity 
                  onPress={() => setShowTimePicker(false)}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                contentContainerStyle={styles.timeSlotsContainer}
                showsVerticalScrollIndicator={false}
              >
                {timeSlots.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.timeSlotSelected
                    ]}
                    onPress={() => handleTimeSelect(time)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      selectedTime === time && styles.timeSlotTextSelected
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Preview Modal */}
        <Modal 
          visible={showPreview} 
          transparent 
          animationType="fade"
          onRequestClose={() => setShowPreview(false)}
        >
          <TouchableOpacity 
            style={styles.previewModalOverlay}
            activeOpacity={1}
            onPress={() => setShowPreview(false)}
          >
            <TouchableOpacity 
              style={styles.previewModalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.previewHeader}>
                <Icon name="preview" size={32} color="#ffc125" />
                <Text style={styles.previewTitle}>Resumo do Agendamento</Text>
              </View>

              <ScrollView 
                style={styles.previewContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Detalhes do Serviço</Text>
                  <View style={styles.previewItem}>
                    <Text style={styles.previewLabel}>Serviço:</Text>
                    <Text style={styles.previewValue}>
                      {services.find(s => s.id === selectedService)?.name}
                    </Text>
                  </View>
                  <View style={styles.previewItem}>
                    <Text style={styles.previewLabel}>Data:</Text>
                    <Text style={styles.previewValue}>{formatDate(selectedDate)}</Text>
                  </View>
                  <View style={styles.previewItem}>
                    <Text style={styles.previewLabel}>Horário:</Text>
                    <Text style={styles.previewValue}>{selectedTime}</Text>
                  </View>
                </View>

                <View style={styles.previewSection}>
                  <Text style={styles.previewSectionTitle}>Dados do Cliente</Text>
                  <View style={styles.previewItem}>
                    <Text style={styles.previewLabel}>Nome:</Text>
                    <Text style={styles.previewValue}>{customerName}</Text>
                  </View>
                  <View style={styles.previewItem}>
                    <Text style={styles.previewLabel}>Telefone:</Text>
                    <Text style={styles.previewValue}>{customerPhone}</Text>
                  </View>
                  {customerAddress ? (
                    <View style={styles.previewItem}>
                      <Text style={styles.previewLabel}>Endereço:</Text>
                      <Text style={styles.previewValue}>{customerAddress}</Text>
                    </View>
                  ) : null}
                  {description ? (
                    <View style={styles.previewItem}>
                      <Text style={styles.previewLabel}>Descrição:</Text>
                      <Text style={styles.previewValue}>{description}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.previewInfoBox}>
                  <Icon name="info" size={20} color="#3b82f6" />
                  <Text style={styles.previewInfoText}>
                    Um técnico da Solaire entrará em contato no dia {getContactDate()} para confirmar os detalhes da visita.
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.previewButtons}>
                <TouchableOpacity 
                  style={[styles.previewButton, styles.previewButtonCancel]}
                  onPress={() => setShowPreview(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.previewButtonCancelText}>Corrigir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.previewButton, styles.previewButtonConfirm]}
                  onPress={handleSchedule}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <>
                      <Text style={styles.previewButtonConfirmText}>Confirmar</Text>
                      <Icon name="check-circle" size={20} color="#000" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
            fadeOut
          />
        )}

        <Animated.View style={[styles.successMessage, { opacity: fadeAnim }]}>
          <Icon name="check-circle" size={40} color="#4ade80" />
          <Text style={styles.successTitle}>Agendamento Confirmado!</Text>
          <Text style={styles.successSubtitle}>Em breve um técnico entrará em contato</Text>
        </Animated.View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ffc125" />
              <Text style={styles.loadingText}>Processando agendamento...</Text>
            </View>
          </View>
        )}
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
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16, color: "#1e293b" },
  requiredText: { fontSize: 14, color: "#ef4444", fontWeight: "400" },
  servicesScrollView: {
    flexGrow: 0,
  },
  serviceButton: { alignItems: "center", marginRight: 16, paddingVertical: 4 },
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
  serviceText: { color: "#64748b", fontSize: 12, marginTop: 4, textAlign: "center", width: 80 },
  serviceTextSelected: { color: "#ffc125", fontWeight: "700" },
  datetimeRow: { flexDirection: "row", alignItems: "center" },
  datetimeButton: { 
    flex: 1, 
    flexDirection: "row", 
    paddingVertical: 12,
    alignItems: "center"
  },
  datetimeTextContainer: { marginLeft: 12, flex: 1 },
  datetimeLabel: { fontSize: 12, color: "#666", marginBottom: 2 },
  datetimeValue: { fontSize: 16, color: "#1e293b", fontWeight: "500" },
  datetimePlaceholder: { fontSize: 16, color: "#94a3b8" },
  separator: { width: 1, height: 40, backgroundColor: "#e2e8f0", marginHorizontal: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputContainerValid: {
    borderColor: "#4ade80",
    backgroundColor: "#f0fdf4",
  },
  inputContainerError: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  inputIcon: { padding: 16 },
  input: { flex: 1, padding: 16, paddingLeft: 0, fontSize: 16 },
  validationIcon: { paddingRight: 16 },
  textArea: { height: 100, textAlignVertical: "top" },
  scheduleButton: {
    backgroundColor: "#ffc125",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scheduleButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  timeModalContent: {
    maxHeight: "60%",
  },
  modalHeader: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  closeButton: {
    padding: 4,
  },
  calendar: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'center',
  },
  timeSlot: {
    padding: 14,
    margin: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeSlotSelected: {
    backgroundColor: '#ffc125',
    borderColor: '#f59e0b',
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#475569',
  },
  timeSlotTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  // Preview Modal
  previewModalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  previewModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    maxHeight: "80%",
  },
  previewHeader: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 12,
  },
  previewContent: {
    padding: 24,
    maxHeight: 400,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc125",
    paddingLeft: 12,
  },
  previewItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    width: 100,
  },
  previewValue: {
    fontSize: 16,
    color: "#1e293b",
    flex: 1,
  },
  previewInfoBox: {
    backgroundColor: "#dbeafe",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
  },
  previewInfoText: {
    fontSize: 14,
    color: "#1e40af",
    marginLeft: 12,
    flex: 1,
  },
  previewButtons: {
    flexDirection: "row",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  previewButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  previewButtonCancel: {
    backgroundColor: "#f1f5f9",
    marginRight: 12,
  },
  previewButtonCancelText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  previewButtonConfirm: {
    backgroundColor: "#ffc125",
  },
  previewButtonConfirmText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  successMessage: {
    position: "absolute",
    top: "40%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  successTitle: { 
    fontSize: 22, 
    fontWeight: "700", 
    color: "#ffc125",
    marginTop: 16,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
});
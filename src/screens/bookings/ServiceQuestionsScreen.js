import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import apiService from '../../services/api';
import { API_ENDPOINTS } from '../../constants/api';
import { COLORS } from '../../constants/colors';

const ServiceQuestionsScreen = ({ route, navigation }) => {
  const { service } = route.params;
  const insets = useSafeAreaInsets();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const serviceId = service.id || service.service_id || service.serviceId;
      const response = await apiService.get(API_ENDPOINTS.SERVICE_QUESTIONS(serviceId));

      if (response.success && response.data) {
        const questionsData = response.data.questions || response.data || [];
        setQuestions(Array.isArray(questionsData) ? questionsData : []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Error', 'Failed to load service questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const validateAnswers = () => {
    for (const question of questions) {
      if (question.is_required && !answers[question.id]) {
        Alert.alert('Required Field', `Please answer: ${question.question_text}`);
        return false;
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateAnswers()) {
      return;
    }

    // Convert answers object to array format for API
    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: questionId,
      answer: answer,
    }));

    // Navigate to address selection (new flow: Questions → Address → Providers)
    navigation.navigate('AddressSelection', {
      service,
      answers: answersArray,
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4 flex-row items-center">
          <TouchableOpacity
            className="mr-4"
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text
            className="text-xl font-semibold text-gray-900 flex-1"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Service Questions
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity
          className="mr-4"
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Service Questions
          </Text>
          <Text
            className="text-xs text-gray-500"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            Help us understand your needs
          </Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {questions.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="clipboard-outline" size={48} color={COLORS.textSecondary} />
            <Text
              className="text-gray-500 mt-4 text-center"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              No questions configured for this service
            </Text>
          </View>
        ) : (
          questions.map((question, index) => (
            <View key={question.id} className="mb-6">
              <Text
                className="text-sm font-medium text-gray-700 mb-2"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {index + 1}. {question.question_text}
                {question.is_required && (
                  <Text className="text-red-500"> *</Text>
                )}
              </Text>

              {question.question_type === 'text' ? (
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl p-4 text-gray-900"
                  style={{ fontFamily: 'Poppins-Regular', minHeight: 50 }}
                  placeholder="Your answer..."
                  placeholderTextColor="#9CA3AF"
                  value={answers[question.id] || ''}
                  onChangeText={(text) => handleAnswerChange(question.id, text)}
                  multiline
                />
              ) : question.question_type === 'multiple_choice' && question.options ? (
                <View>
                  {(Array.isArray(question.options) ? question.options : []).map((option, optIdx) => {
                    const isSelected = answers[question.id] === option;
                    return (
                      <TouchableOpacity
                        key={optIdx}
                        className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white'
                        }`}
                        activeOpacity={0.7}
                        onPress={() => handleAnswerChange(question.id, option)}
                      >
                        <View
                          className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={12} color="white" />
                          )}
                        </View>
                        <Text
                          className="text-base text-gray-900 flex-1"
                          style={{ fontFamily: 'Poppins-Regular' }}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
          ))
        )}
      </KeyboardAwareScrollView>

      {/* Continue Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${
            questions.length > 0 ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
          onPress={handleContinue}
          disabled={questions.length === 0}
        >
          <Text
            className="text-white text-base font-semibold"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ServiceQuestionsScreen;

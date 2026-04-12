import api from './api';

export interface ChatSession {
  id: string;
  vehicleId?: string;
  title: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    diagnosis?: string;
    severity?: 'low' | 'medium' | 'high';
    recommendations?: string[];
    parts?: string[];
    estimatedCost?: number;
  };
  createdAt: string;
}

export interface CreateChatSessionRequest {
  vehicleId?: string;
  title: string;
  initialMessage?: string;
}

export interface SendMessageRequest {
  content: string;
  vehicleId?: string;
}

export interface DiagnosisHistoryItem {
  id: string;
  sessionId: string;
  vehicleId: string;
  diagnosis: string;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  createdAt: string;
}

class ChatService {
  // Get all chat sessions for the authenticated user
  async getChatSessions(): Promise<ChatSession[]> {
    const response = await api.get<ChatSession[]>('/chat/sessions');
    return response.data;
  }

  // Create a new chat session
  async createChatSession(sessionData: CreateChatSessionRequest): Promise<ChatSession> {
    const response = await api.post<ChatSession>('/chat/sessions', sessionData);
    return response.data;
  }

  // Get a specific chat session with its messages
  async getChatSession(sessionId: string): Promise<any> {
    const response = await api.get<any>(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  // Delete a chat session
  async deleteChatSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  // Send a message in a chat session
  async sendMessage(sessionId: string, messageData: SendMessageRequest): Promise<ChatMessage> {
    const response = await api.post<any>(`/chat/sessions/${sessionId}/messages`, messageData);
    
    // Check if backend returned an object with an aiMessage property
    const aiMessage = response.data.aiMessage || response.data;
    
    // Map diagnosisResult to metadata for UI compat layer
    if (aiMessage.diagnosisResult && !aiMessage.metadata) {
      aiMessage.metadata = {
        diagnosis: aiMessage.diagnosisResult.potentialIssues?.[0]?.name || 'Diagnosis',
        recommendations: aiMessage.diagnosisResult.recommendedActions || []
      };
    }

    return aiMessage;
  }

  // Get diagnosis history for a vehicle
  async getVehicleDiagnosisHistory(vehicleId: string): Promise<DiagnosisHistoryItem[]> {
    const response = await api.get<DiagnosisHistoryItem[]>(`/chat/vehicles/${vehicleId}/diagnosis-history`);
    return response.data;
  }

  // Stream a message (for real-time AI responses)
  async *streamMessage(sessionId: string, messageData: SendMessageRequest): AsyncGenerator<string> {
    // This would typically use Server-Sent Events or WebSockets
    // For now, we'll implement a simple version that returns the full response
    const response = await this.sendMessage(sessionId, messageData);
    yield response.content;
  }

  // Quick diagnosis - create a session and send a message in one call
  async quickDiagnosis(vehicleId: string, symptoms: string): Promise<{
    session: ChatSession;
    message: ChatMessage;
  }> {
    // Create a session with the vehicle
    const session = await this.createChatSession({
      vehicleId,
      title: `Diagnosis - ${new Date().toLocaleDateString()}`,
    });

    // Send the symptoms message
    const message = await this.sendMessage(session.id, {
      content: symptoms,
      vehicleId,
    });

    return { session, message };
  }

  // Demo mode - use public test endpoint (no authentication required)
  async demoDiagnosis(symptoms: string): Promise<{
    content: string;
    diagnosisResult: any;
  }> {
    try {
      const response = await api.post('/chat/test-ai', {
        message: symptoms,
      });
      return response.data;
    } catch (error) {
      console.error('Demo diagnosis failed:', error);
      // Fallback to simulated response
      return {
        content: `Based on your symptoms "${symptoms}", I recommend checking with a mechanic for proper diagnosis.`,
        diagnosisResult: {
          confidence: 0.5,
          severity: 'medium',
          potentialIssues: [],
          recommendedActions: ['Consult a professional mechanic']
        }
      };
    }
  }
}

export default new ChatService();
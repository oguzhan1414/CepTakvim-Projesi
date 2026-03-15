import React, { useState, useEffect } from 'react';
import { 
  FiMessageCircle, FiX, FiSend, FiZap, FiHeadphones, 
  FiHelpCircle, FiArrowLeft, FiHome 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome, questions, answer
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  // WhatsApp numarası (kendi numaranı yaz)
  const WHATSAPP_NUMBER = '905304969210';

  // Sık sorulan sorular
  const quickQuestions = [
    { 
      id: 1, 
      text: "📅 Randevu nasıl alırım?", 
      answer: "Randevu almak için ana sayfadaki 'Randevu Al' butonuna tıklayın. İşletme seçin, hizmet seçin ve uygun saatte randevunuzu oluşturun. Üstelik ücretsiz!" 
    },
    { 
      id: 2, 
      text: "💰 Fiyatlandırma nedir?", 
      answer: "Aylık 299₺'den başlayan paketlerimiz var. 14 gün ücretsiz deneme ile tüm özellikleri test edebilirsiniz. Kredi kartı gerekmez!" 
    },
    { 
      id: 3, 
      text: "🤖 AI nasıl çalışır?", 
      answer: "Yapay zekamız, randevu çakışmalarını önler, boş saatleri doldurmak için size öneriler sunar, müşterilerinize otomatik hatırlatma gönderir ve işletme performansınızı analiz eder." 
    },
    { 
      id: 4, 
      text: "📱 WhatsApp entegrasyonu?", 
      answer: "Evet! Müşterileriniz WhatsApp üzerinden randevu alabilir, hatırlatma alabilir. İşletme sahipleri de toplu SMS yerine WhatsApp üzerinden kampanya gönderebilir." 
    },
    { 
      id: 5, 
      text: "👥 Kaç personel ekleyebilirim?", 
      answer: "Başlangıç paketinde 1 personel, Profesyonel pakette 5 personel, Kurumsal pakette sınırsız personel ekleyebilirsiniz." 
    },
    { 
      id: 6, 
      text: "📊 Raporlama nasıl çalışır?", 
      answer: "Günlük, haftalık, aylık gelir raporları, en çok tercih edilen hizmetler, müşteri sadakat analizi, doluluk oranları ve personel performans raporları sunuyoruz." 
    },
  ];

  const handleQuickQuestion = (question) => {
    setSelectedAnswer(question);
    setCurrentScreen('answer');
    
    setChatHistory([
      ...chatHistory,
      { type: 'user', text: question.text },
      { type: 'bot', text: question.answer }
    ]);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
      setMessage('');
    }
  };

  const handleWPHelp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Merhaba,%20yardıma%20ihtiyacım%20var`, '_blank');
  };

  const goBack = () => {
    if (currentScreen === 'answer') {
      setCurrentScreen('questions');
      setSelectedAnswer(null);
    } else if (currentScreen === 'questions') {
      setCurrentScreen('welcome');
    } else if (currentScreen === 'welcome' && chatHistory.length > 0) {
      setCurrentScreen('questions');
    }
  };

  const goHome = () => {
    setCurrentScreen('welcome');
    setSelectedAnswer(null);
    setChatHistory([]);
  };

  return (
    <div className="chat-widget">
      {/* Ana Buton */}
      <button 
        className={`chat-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Yardım"
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="header-left">
              <span className="ai-icon"><FiZap /></span>
              <div>
                <h3>CepTakvim</h3>
                <span className="status online">Online</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="chat-body">
            {/* Navigasyon Butonları */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              {currentScreen !== 'welcome' && (
                <button className="back-nav-btn" onClick={goBack}>
                  <FiArrowLeft /> Geri
                </button>
              )}
              {chatHistory.length > 0 && currentScreen === 'welcome' && (
                <button className="back-nav-btn" onClick={goHome}>
                  <FiHome /> Ana Sayfa
                </button>
              )}
            </div>

            {/* Sohbet Geçmişi */}
            {chatHistory.length > 0 && currentScreen === 'welcome' && (
              <div className="chat-history">
                {chatHistory.map((item, index) => (
                  <div key={index} className={`chat-message ${item.type}`}>
                    <div className="message-bubble">
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hoş Geldin Ekranı */}
            {currentScreen === 'welcome' && chatHistory.length === 0 && (
              <div className="welcome-message">
                <div className="ai-avatar">
                  <FiHeadphones />
                </div>
                <p>Merhaba! 👋</p>
                <p className="ai-suggestion">Size nasıl yardımcı olabilirim?</p>
              </div>
            )}

            {/* Ana Seçenekler */}
            {currentScreen === 'welcome' && (
              <div className="quick-options">
                <button 
                  className="option-btn ai-option" 
                  onClick={() => setCurrentScreen('questions')}
                >
                  <FiHelpCircle /> Sık Sorulan Sorular
                </button>
                <button className="option-btn wp-option" onClick={handleWPHelp}>
                  <FaWhatsapp /> WhatsApp Destek
                </button>
              </div>
            )}

            {/* Soru Listesi */}
            {currentScreen === 'questions' && (
              <div className="ai-questions">
                <p className="questions-title">Sık sorulan sorular:</p>
                {quickQuestions.map((q) => (
                  <button
                    key={q.id}
                    className="question-btn"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            )}

            {/* Cevap Ekranı */}
            {currentScreen === 'answer' && selectedAnswer && (
              <div className="answer-container">
                <div className="question-bubble">
                  <strong>Soru:</strong> {selectedAnswer.text}
                </div>
                <div className="answer-bubble">
                  <strong>Cevap:</strong> {selectedAnswer.answer}
                </div>
                <div className="answer-actions">
                  <button className="wp-send-btn" onClick={handleWPHelp}>
                    <FaWhatsapp /> WhatsApp'tan Sor
                  </button>
                  <button className="new-question-btn" onClick={() => setCurrentScreen('questions')}>
                    Yeni Soru
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Input Alanı */}
          <div className="chat-footer">
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="send-btn" onClick={handleSendMessage} aria-label="Gönder">
              <FiSend />
            </button>
          </div>

          <div className="chat-footer-note">
            <span>💬 7/24 destek • WhatsApp'a yönlendirir</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
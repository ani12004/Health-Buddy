'use client'

import { useEffect, useMemo, useState } from 'react'

const LANGUAGE_STORAGE_KEY = 'healthbuddy.aiCheckup.language'

const LANGUAGE_OPTIONS = [
  'English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu',
  'Kannada', 'Malayalam', 'Bengali', 'Punjabi', 'Assamese',
  'Odia', 'Urdu', 'Kashmiri'
]

interface AwarenessCopy {
  missionTitle: string
  missionBody: string
  awarenessTitle: string
  awarenessIntro: string
  diseaseNames: {
    heart: string
    hyper: string
    diabetes: string
  }
  heartNote: string
  hyperNote: string
  diabetesNote: string
  preventionTitle: string
  preventionTips: string[]
  emergencyLine: string
}

const CONTENT: Record<string, AwarenessCopy> = {
  English: {
    missionTitle: 'Our Mission',
    missionBody: 'Health Buddy exists to make preventive healthcare simple, understandable, and accessible. We combine AI-driven risk insights with practical next steps so people can act early and live healthier lives.',
    awarenessTitle: 'Disease Awareness',
    awarenessIntro: 'Early awareness helps prevent complications. Below is a quick guide for the 3 conditions tracked in AI Checkup.',
    diseaseNames: { heart: 'Heart Disease', hyper: 'Hypertension', diabetes: 'Diabetes' },
    heartNote: 'Watch for chest discomfort, breathlessness, unusual fatigue, and pain spreading to arm or jaw.',
    hyperNote: 'Often has no symptoms. Regular blood pressure checks are essential, especially with stress, high salt intake, or family history.',
    diabetesNote: 'Look for frequent urination, increased thirst, blurry vision, and slow wound healing.',
    preventionTitle: 'Prevention Basics',
    preventionTips: [
      'Stay active for at least 30 minutes on most days.',
      'Reduce salt, sugar, and processed food intake.',
      'Track vitals and consult a doctor for persistent abnormalities.'
    ],
    emergencyLine: 'Emergency warning: If symptoms are severe or sudden, seek immediate medical care.'
  },
  Hindi: {
    missionTitle: 'हमारा मिशन',
    missionBody: 'Health Buddy का उद्देश्य निवारक स्वास्थ्य देखभाल को सरल, समझने योग्य और सभी के लिए सुलभ बनाना है। AI आधारित जोखिम जानकारी के साथ हम लोगों को समय पर सही कदम उठाने में मदद करते हैं।',
    awarenessTitle: 'रोग जागरूकता',
    awarenessIntro: 'शुरुआती जागरूकता जटिलताओं को रोकने में मदद करती है। नीचे AI Checkup में शामिल 3 स्थितियों की जानकारी दी गई है।',
    diseaseNames: { heart: 'हृदय रोग', hyper: 'उच्च रक्तचाप', diabetes: 'मधुमेह' },
    heartNote: 'सीने में दर्द, सांस फूलना, असामान्य थकान या दर्द का हाथ/जबड़े तक फैलना चेतावनी संकेत हो सकते हैं।',
    hyperNote: 'अक्सर कोई स्पष्ट लक्षण नहीं होते। नियमित ब्लड प्रेशर जांच बहुत जरूरी है।',
    diabetesNote: 'बार-बार पेशाब आना, ज्यादा प्यास, धुंधला दिखना और घाव का देर से भरना प्रमुख संकेत हैं।',
    preventionTitle: 'बचाव के मुख्य उपाय',
    preventionTips: [
      'अधिकांश दिनों में कम से कम 30 मिनट सक्रिय रहें।',
      'नमक, चीनी और प्रोसेस्ड फूड कम करें।',
      'वाइटल्स ट्रैक करें और लगातार समस्या होने पर डॉक्टर से मिलें।'
    ],
    emergencyLine: 'चेतावनी: गंभीर या अचानक लक्षण होने पर तुरंत चिकित्सा सहायता लें।'
  },
  Marathi: {
    missionTitle: 'आमचे ध्येय',
    missionBody: 'Health Buddy चे ध्येय प्रतिबंधात्मक आरोग्यसेवा सोपी, समजण्यास सोपी आणि सर्वांसाठी उपलब्ध करणे आहे. AI आधारित जोखीम माहितीमुळे लोकांना वेळेत योग्य निर्णय घेता येतात.',
    awarenessTitle: 'रोग जनजागृती',
    awarenessIntro: 'लवकर माहिती मिळाल्यास गुंतागुंत टाळता येते. खाली AI Checkup मधील 3 आजारांची थोडक्यात माहिती दिली आहे.',
    diseaseNames: { heart: 'हृदयरोग', hyper: 'उच्च रक्तदाब', diabetes: 'मधुमेह' },
    heartNote: 'छातीत वेदना, श्वास लागणे, जास्त थकवा किंवा वेदना हात/जबड्यापर्यंत जाणे ही लक्षणे लक्षात घ्या.',
    hyperNote: 'हा आजार अनेकदा लक्षणांशिवाय असतो. नियमित रक्तदाब तपासणी अत्यावश्यक आहे.',
    diabetesNote: 'वारंवार लघवी, जास्त तहान, धूसर दिसणे, जखम हळू भरणे ही महत्त्वाची लक्षणे आहेत.',
    preventionTitle: 'प्रतिबंधक सवयी',
    preventionTips: [
      'दररोज किंवा बहुतेक दिवशी 30 मिनिटे शारीरिक हालचाल करा.',
      'मीठ, साखर आणि प्रक्रिया केलेले अन्न कमी करा.',
      'वाइटल्स तपासत रहा आणि त्रास टिकल्यास डॉक्टरांचा सल्ला घ्या.'
    ],
    emergencyLine: 'इशारा: लक्षणे अचानक किंवा गंभीर असल्यास त्वरित वैद्यकीय मदत घ्या.'
  },
  Gujarati: {
    missionTitle: 'અમારું મિશન',
    missionBody: 'Health Buddy નો ઉદ્દેશ પ્રિવેન્ટિવ હેલ્થકેરને સરળ, સમજણપૂર્વક અને સૌ માટે ઉપલબ્ધ બનાવવાનો છે. AI આધારિત જોખમ સૂચનાઓથી લોકો સમયસર યોગ્ય નિર્ણય લઈ શકે છે.',
    awarenessTitle: 'રોગ જાગૃતિ',
    awarenessIntro: 'વેળાસર જાગૃતિ જટિલતાઓ ઘટાડે છે. નીચે AI Checkup માં આવતી 3 સ્થિતિઓ વિશે માહિતી છે.',
    diseaseNames: { heart: 'હૃદય રોગ', hyper: 'ઉચ્ચ રક્તચાપ', diabetes: 'ડાયાબિટીસ' },
    heartNote: 'છાતીમાં દુખાવો, શ્વાસમાં તકલીફ, અસામાન્ય થાક અથવા દુખાવો હાથ/જડબા સુધી ફેલાય તે લક્ષણો છે.',
    hyperNote: 'ઘણિવખત લક્ષણો દેખાતા નથી. નિયમિત બ્લડ પ્રેશર ચેક કરવું જરૂરી છે.',
    diabetesNote: 'વારંવાર મૂત્ર, વધુ તરસ, ધૂંધળું દેખાવું અને ઘા મોડા ભરે તે ડાયાબિટીસના સંકેતો છે.',
    preventionTitle: 'બચાવ માટે પગલાં',
    preventionTips: [
      'મોટાભાગના દિવસોમાં ઓછામાં ઓછા 30 મિનિટ એક્ટિવ રહો.',
      'મીઠું, ખાંડ અને પ્રોસેસ્ડ ખોરાક ઓછો કરો.',
      'વાઇટલ્સ મોનિટર કરો અને સમસ્યા રહે તો ડૉક્ટરને મળો.'
    ],
    emergencyLine: 'ચેતવણી: અચાનક કે ગંભીર લક્ષણો હોય તો તરત સારવાર લો.'
  },
  Tamil: {
    missionTitle: 'எங்கள் நோக்கம்',
    missionBody: 'Health Buddy இன் நோக்கம் தடுப்பு சுகாதாரத்தை எளிமையாகவும் அனைவருக்கும் கிடைக்கும்படியும் மாற்றுவது. AI அடிப்படையிலான அபாய தகவல்களால் மக்கள் முன்கூட்டியே நடவடிக்கை எடுக்க முடியும்.',
    awarenessTitle: 'நோய் விழிப்புணர்வு',
    awarenessIntro: 'ஆரம்பத்திலேயே அறிதல் சிக்கல்களை குறைக்கும். AI Checkup பார்க்கும் 3 நிலைகள் கீழே கொடுக்கப்பட்டுள்ளன.',
    diseaseNames: { heart: 'இதய நோய்', hyper: 'உயர் இரத்த அழுத்தம்', diabetes: 'நீரிழிவு' },
    heartNote: 'மார்பு வலி, மூச்சுத்திணறல், அதிக சோர்வு, கையோ தாடையோ நோக்கி பரவும் வலி ஆகியவை முக்கிய அறிகுறிகள்.',
    hyperNote: 'பெரும்பாலும் அறிகுறி தெரியாமல் இருக்கலாம். முறையான BP பரிசோதனை அவசியம்.',
    diabetesNote: 'அடிக்கடி சிறுநீர், அதிக தாகம், மங்கலான பார்வை, காயம் தாமதமாக ஆறுதல் போன்றவை கவனிக்க வேண்டியவை.',
    preventionTitle: 'தடுப்பு வழிகள்',
    preventionTips: [
      'பெரும்பாலான நாட்களில் குறைந்தது 30 நிமிடங்கள் உடற்பயிற்சி செய்யுங்கள்.',
      'உப்பு, சர்க்கரை, பதப்படுத்தப்பட்ட உணவை குறைக்கவும்.',
      'வைத்தியரின் ஆலோசனையுடன் உங்கள் ஆரோக்கிய அளவுகளை தொடர்ந்து கண்காணிக்கவும்.'
    ],
    emergencyLine: 'எச்சரிக்கை: தீவிரமான அல்லது திடீர் அறிகுறிகள் இருந்தால் உடனடி மருத்துவ உதவி பெறுங்கள்.'
  },
  Telugu: {
    missionTitle: 'మా లక్ష్యం',
    missionBody: 'Health Buddy యొక్క లక్ష్యం నివారణ ఆరోగ్య సేవలను సులభంగా, అర్థమయ్యేలా, అందరికీ అందుబాటులోకి తేవడం. AI ఆధారిత ప్రమాద సూచనలతో ముందుగానే జాగ్రత్తలు తీసుకోవచ్చు.',
    awarenessTitle: 'రోగ అవగాహన',
    awarenessIntro: 'ముందస్తు అవగాహనతో సమస్యలను తగ్గించవచ్చు. AI Checkup లోని 3 ముఖ్య స్థితుల వివరాలు ఇవి.',
    diseaseNames: { heart: 'గుండె వ్యాధి', hyper: 'అధిక రక్తపోటు', diabetes: 'మధుమేహం' },
    heartNote: 'ఛాతి నొప్పి, శ్వాస తీసుకోవడంలో ఇబ్బంది, అసాధారణ అలసట, నొప్పి చేయి లేదా దవడకు వ్యాపించడం వంటి సంకేతాలు గమనించండి.',
    hyperNote: 'చాలా సార్లు లక్షణాలు కనిపించకపోవచ్చు. క్రమం తప్పకుండా BP పరీక్షించాలి.',
    diabetesNote: 'తరచూ మూత్ర విసర్జన, ఎక్కువ దాహం, మసక చూపు, గాయాలు ఆలస్యంగా మానడం వంటి లక్షణాలు ఉంటాయి.',
    preventionTitle: 'నివారణ సూచనలు',
    preventionTips: [
      'రోజుకు కనీసం 30 నిమిషాలు శారీరక చలనం ఉండాలి.',
      'ఉప్పు, చక్కెర, ప్రాసెస్డ్ ఆహారాన్ని తగ్గించండి.',
      'వైటల్స్‌ని గమనిస్తూ సమస్య ఉంటే డాక్టర్‌ను సంప్రదించండి.'
    ],
    emergencyLine: 'హెచ్చరిక: లక్షణాలు తీవ్రమైతే లేదా అకస్మాత్తుగా వస్తే వెంటనే వైద్య సహాయం పొందండి.'
  },
  Kannada: {
    missionTitle: 'ನಮ್ಮ ಧ್ಯೇಯ',
    missionBody: 'Health Buddy ಯ ಧ್ಯೇಯ ಮುನ್ನೆಚ್ಚರಿಕಾ ಆರೋಗ್ಯ ಸೇವೆಯನ್ನು ಸರಳವಾಗಿ ಹಾಗೂ ಎಲ್ಲರಿಗೂ ತಲುಪುವಂತೆ ಮಾಡುವುದು. AI ಆಧಾರಿತ ಅಪಾಯ ಸೂಚನೆಗಳು ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಕ್ರಮಕ್ಕೆ ನೆರವಾಗುತ್ತವೆ.',
    awarenessTitle: 'ರೋಗ ಜಾಗೃತಿ',
    awarenessIntro: 'ತುಂಬ ಬೇಗ ಮಾಹಿತಿ ಪಡೆದರೆ ಗಂಭೀರತೆ ಕಡಿಮೆ ಮಾಡಬಹುದು. AI Checkup ಒಳಗೊಂಡಿರುವ 3 ಸ್ಥಿತಿಗಳ ವಿವರ ಇಲ್ಲಿದೆ.',
    diseaseNames: { heart: 'ಹೃದಯ ರೋಗ', hyper: 'ಉಚ್ಚ ರಕ್ತದೊತ್ತಡ', diabetes: 'ಮಧುಮೇಹ' },
    heartNote: 'ಎದೆನೋವು, ಉಸಿರಾಟ ತೊಂದರೆ, ಹೆಚ್ಚು ದಣಿವು, ಕೈ ಅಥವಾ ಹಲ್ಲೆವರೆಗೆ ನೋವು ಹರಡುವುದು ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು.',
    hyperNote: 'ಹೆಚ್ಚಿನ ಸಂದರ್ಭಗಳಲ್ಲಿ ಲಕ್ಷಣಗಳು ಕಾಣಿಸದೆ ಇರಬಹುದು. ನಿಯಮಿತ BP ಪರೀಕ್ಷೆ ಅಗತ್ಯ.',
    diabetesNote: 'ವಾರಂವಾರ ಮೂತ್ರ ವಿಸರ್ಜನೆ, ಹೆಚ್ಚು ದಾಹ, ದೃಷ್ಟಿ ಮಸುಕು, ಗಾಯ ತಡವಾಗಿ ಗುಣಮುಖವಾಗುವುದು ಸೂಚನೆಗಳು.',
    preventionTitle: 'ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳು',
    preventionTips: [
      'ಪ್ರತಿ ದಿನ ಅಥವಾ ಹೆಚ್ಚು ದಿನಗಳಲ್ಲಿ 30 ನಿಮಿಷ ಚಟುವಟಿಕೆ ಇರಲಿ.',
      'ಉಪ್ಪು, ಸಕ್ಕರೆ, ಪ್ರಾಸೆಸ್ಡ್ ಆಹಾರ ಕಡಿಮೆ ಮಾಡಿ.',
      'ವೈಟಲ್ಸ್ ಗಮನಿಸಿ ಸಮಸ್ಯೆ ಮುಂದುವರಿದರೆ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.'
    ],
    emergencyLine: 'ಎಚ್ಚರಿಕೆ: ತೀವ್ರ ಅಥವಾ ಅಚಾನಕ್ ಲಕ್ಷಣಗಳಿದ್ದರೆ ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ನೆರವು ಪಡೆಯಿರಿ.'
  },
  Malayalam: {
    missionTitle: 'ഞങ്ങളുടെ ദൗത്യം',
    missionBody: 'Health Buddy യുടെ ദൗത്യം പ്രതിരോധ ആരോഗ്യപരിചരണം ലളിതവും എല്ലാവർക്കും ലഭ്യമാവുന്നതുമാക്കുകയാണ്. AI അടിസ്ഥാനമാക്കിയ അപകട സൂചനകൾ സമയോചിതമായ തീരുമാനങ്ങൾക്ക് സഹായിക്കുന്നു.',
    awarenessTitle: 'രോഗ ബോധവൽക്കരണം',
    awarenessIntro: 'ആദ്യഘട്ടത്തിൽ അറിഞ്ഞാൽ ഗുരുതരാവസ്ഥ കുറയ്ക്കാം. AI Checkup ഉൾക്കൊള്ളുന്ന 3 അവസ്ഥകളുടെ വിവരങ്ങൾ താഴെ.',
    diseaseNames: { heart: 'ഹൃദ്രോഗം', hyper: 'ഉയർന്ന രക്തസമ്മർദ്ദം', diabetes: 'പ്രമേഹം' },
    heartNote: 'ചെസ്റ്റ് വേദന, ശ്വസന ബുദ്ധിമുട്ട്, അസാധാരണ ക്ഷീണം, കൈയിലേക്കോ താടിയിലേക്കോ പകരുന്ന വേദന ശ്രദ്ധിക്കുക.',
    hyperNote: 'പലപ്പോഴും വ്യക്തമായ ലക്ഷണങ്ങളില്ല. രക്തസമ്മർദ്ദം പതിവായി പരിശോധിക്കുക.',
    diabetesNote: 'മൂത്രമൊഴിക്കൽ കൂടുക, ദാഹം കൂടുക, കാഴ്ച മങ്ങുക, മുറിവുകൾ വൈകി ഭേദമാകുക തുടങ്ങിയ ലക്ഷണങ്ങൾ കാണാം.',
    preventionTitle: 'പ്രതിരോധ മാർഗങ്ങൾ',
    preventionTips: [
      'മിക്ക ദിവസങ്ങളിലും കുറഞ്ഞത് 30 മിനിറ്റ് ശരീര ചലനം ചെയ്യുക.',
      'ഉപ്പ്, പഞ്ചസാര, പ്രോസസ്സ്ഡ് ഭക്ഷണം കുറയ്ക്കുക.',
      'വൈറ്റൽസ് നിരീക്ഷിച്ച് പ്രശ്നം തുടരുകയാണെങ്കിൽ ഡോക്ടറെ കാണുക.'
    ],
    emergencyLine: 'മുന്നറിയിപ്പ്: ലക്ഷണങ്ങൾ ഗുരുതരമെങ്കിൽ ഉടൻ വൈദ്യസഹായം തേടുക.'
  },
  Bengali: {
    missionTitle: 'আমাদের লক্ষ্য',
    missionBody: 'Health Buddy এর লক্ষ্য প্রতিরোধমূলক স্বাস্থ্যসেবাকে সহজ, বোধগম্য এবং সবার জন্য সহজলভ্য করা। AI ভিত্তিক ঝুঁকি বিশ্লেষণ মানুষকে আগেভাগে ব্যবস্থা নিতে সাহায্য করে।',
    awarenessTitle: 'রোগ সচেতনতা',
    awarenessIntro: 'আগে থেকে জানা থাকলে জটিলতা কমানো যায়। AI Checkup এ থাকা ৩টি রোগ সম্পর্কে সংক্ষেপে নিচে দেওয়া হল।',
    diseaseNames: { heart: 'হৃদরোগ', hyper: 'উচ্চ রক্তচাপ', diabetes: 'ডায়াবেটিস' },
    heartNote: 'বুক ব্যথা, শ্বাসকষ্ট, অতিরিক্ত ক্লান্তি, হাতে বা চোয়ালে ব্যথা ছড়ানো লক্ষণ হতে পারে।',
    hyperNote: 'অনেক সময় লক্ষণ থাকে না। নিয়মিত রক্তচাপ পরীক্ষা করা জরুরি।',
    diabetesNote: 'বারবার প্রস্রাব, বেশি তৃষ্ণা, ঝাপসা দেখা, ক্ষত ধীরে শুকানো ডায়াবেটিসের লক্ষণ হতে পারে।',
    preventionTitle: 'প্রতিরোধের উপায়',
    preventionTips: [
      'প্রতিদিন বা বেশিরভাগ দিনে অন্তত ৩০ মিনিট সক্রিয় থাকুন।',
      'লবণ, চিনি এবং প্রসেসড খাবার কমান।',
      'ভাইটালস ট্র্যাক করুন এবং সমস্যা থাকলে চিকিৎসকের পরামর্শ নিন।'
    ],
    emergencyLine: 'সতর্কতা: হঠাৎ বা গুরুতর উপসর্গ হলে দ্রুত চিকিৎসা নিন।'
  },
  Punjabi: {
    missionTitle: 'ਸਾਡਾ ਮਿਸ਼ਨ',
    missionBody: 'Health Buddy ਦਾ ਮਕਸਦ ਰੋਕਥਾਮੀ ਸਿਹਤ ਸੇਵਾ ਨੂੰ ਸੌਖਾ ਅਤੇ ਸਭ ਲਈ ਉਪਲਬਧ ਬਣਾਉਣਾ ਹੈ। AI ਆਧਾਰਿਤ ਰਿਸਕ ਇਨਸਾਈਟਸ ਨਾਲ ਲੋਕ ਸਮੇਂ ਤੇ ਸਹੀ ਕਦਮ ਲੈ ਸਕਦੇ ਹਨ।',
    awarenessTitle: 'ਬਿਮਾਰੀ ਜਾਗਰੂਕਤਾ',
    awarenessIntro: 'ਸ਼ੁਰੂਆਤੀ ਜਾਣਕਾਰੀ ਨਾਲ ਗੰਭੀਰ ਸਮੱਸਿਆਵਾਂ ਤੋਂ ਬਚਿਆ ਜਾ ਸਕਦਾ ਹੈ। AI Checkup ਵਿੱਚ ਆਉਣ ਵਾਲੀਆਂ 3 ਸਥਿਤੀਆਂ ਹੇਠਾਂ ਹਨ।',
    diseaseNames: { heart: 'ਦਿਲ ਦੀ ਬਿਮਾਰੀ', hyper: 'ਉੱਚ ਰਕਤਚਾਪ', diabetes: 'ਸ਼ੂਗਰ' },
    heartNote: 'ਛਾਤੀ ਦਰਦ, ਸਾਹ ਫੁੱਲਣਾ, ਵੱਧ ਥਕਾਵਟ ਜਾਂ ਦਰਦ ਦਾ ਬਾਂਹ/ਜਬੜੇ ਵੱਲ ਜਾਣਾ ਮਹੱਤਵਪੂਰਨ ਸੰਕੇਤ ਹਨ।',
    hyperNote: 'ਅਕਸਰ ਲੱਛਣ ਨਹੀਂ ਹੁੰਦੇ। ਨਿਯਮਿਤ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਚੈਕ ਲਾਜ਼ਮੀ ਹੈ।',
    diabetesNote: 'ਵਾਰ ਵਾਰ ਪਿਸ਼ਾਬ, ਵੱਧ ਤ੍ਰਿਸ਼ਨਾ, ਧੁੰਦਲੀ ਨਜ਼ਰ ਅਤੇ ਜਖਮ ਦੇਰ ਨਾਲ ਠੀਕ ਹੋਣਾ ਲੱਛਣ ਹਨ।',
    preventionTitle: 'ਬਚਾਅ ਦੇ ਤਰੀਕੇ',
    preventionTips: [
      'ਜ਼ਿਆਦਾਤਰ ਦਿਨ ਘੱਟੋ ਘੱਟ 30 ਮਿੰਟ ਸਰਗਰਮ ਰਹੋ।',
      'ਨਮਕ, ਚੀਨੀ ਅਤੇ ਪ੍ਰੋਸੈਸਡ ਖਾਣਾ ਘਟਾਓ।',
      'ਵਾਈਟਲਜ਼ ਟਰੈਕ ਕਰੋ ਅਤੇ ਲੰਬੇ ਸਮੇਂ ਦੀ ਸਮੱਸਿਆ ਤੇ ਡਾਕਟਰ ਨਾਲ ਮਿਲੋ।'
    ],
    emergencyLine: 'ਚੇਤਾਵਨੀ: ਅਚਾਨਕ ਜਾਂ ਤੇਜ਼ ਲੱਛਣ ਹੋਣ ਤੇ ਤੁਰੰਤ ਮੈਡੀਕਲ ਸਹਾਇਤਾ ਲਵੋ।'
  },
  Assamese: {
    missionTitle: 'আমাৰ লক্ষ্য',
    missionBody: 'Health Buddy ৰ লক্ষ্য হ’ল প্রতিৰোধমূলক স্বাস্থ্যসেৱা সহজ আৰু সকলোৰে বাবে সুলভ কৰি তোলা। AI ভিত্তিক ঝুঁকি বিশ্লেষণে আগতীয়াকৈ সঠিক সিদ্ধান্ত লোৱাত সহায় কৰে।',
    awarenessTitle: 'ৰোগ সচেতনতা',
    awarenessIntro: 'আগতেই জানিলে জটিলতা কমাব পৰা যায়। AI Checkup ত থকা ৩টা অৱস্থাৰ সংক্ষিপ্ত তথ্য তলত দিয়া হৈছে।',
    diseaseNames: { heart: 'হৃদৰোগ', hyper: 'উচ্চ ৰক্তচাপ', diabetes: 'ডায়াবেটিছ' },
    heartNote: 'বুকুৰ বিষ, শ্বাস লোৱাত কষ্ট, অস্বাভাৱিক ক্লান্তি, বা বিষ হাত/চোয়াললৈ বিয়পি যোৱা লক্ষণ হ’ব পাৰে।',
    hyperNote: 'বহু সময়তে লক্ষণ নাথাকে। নিয়মিত ৰক্তচাপ পৰীক্ষা প্ৰয়োজন।',
    diabetesNote: 'বাৰে বাৰে প্ৰস্ৰাৱ, অধিক তৃষ্ণা, অস্পষ্ট দৃষ্টি, ঘাঁ দেৰিতে শুকোৱা লক্ষণ দেখা যায়।',
    preventionTitle: 'প্ৰতিরোধৰ উপায়',
    preventionTips: [
      'বেশিভাগ দিনত কমেও 30 মিনিট শারীৰিকভাবে সক্রিয় থাকক।',
      'লৱণ, চেনী আৰু প্ৰসেসড খাদ্য কম কৰক।',
      'ভাইটালস পৰ্যবেক্ষণ কৰি সমস্যা থাকিলে ডাক্তৰৰ পরামৰ্শ লওক।'
    ],
    emergencyLine: 'সতৰ্কবাণী: হঠাৎ বা গুরুতর লক্ষণ দেখা দিলে তৎক্ষণাৎ চিকিৎসা লওক।'
  },
  Odia: {
    missionTitle: 'ଆମର ଲକ୍ଷ୍ୟ',
    missionBody: 'Health Buddy ର ଲକ୍ଷ୍ୟ ହେଉଛି ପ୍ରତିରୋଧମୂଳକ ସ୍ୱାସ୍ଥ୍ୟ ସେବାକୁ ସରଳ ଏବଂ ସମସ୍ତଙ୍କ ପାଇଁ ସୁଲଭ କରିବା। AI ଆଧାରିତ ଝୁମ୍କି ସୂଚନା ଦ୍ୱାରା ସମୟରେ ଠିକ ନିଷ୍ପତ୍ତି ନେବା ସହଜ ହୁଏ।',
    awarenessTitle: 'ରୋଗ ସଚେତନତା',
    awarenessIntro: 'ଆରମ୍ଭରୁ ସଚେତନ ହେଲେ ଜଟିଳତା କମିଯାଏ। AI Checkup ର 3ଟି ମୁଖ୍ୟ ଅବସ୍ଥା ବିଷୟରେ ନିମ୍ନରେ ଦିଆଯାଇଛି।',
    diseaseNames: { heart: 'ହୃଦରୋଗ', hyper: 'ଉଚ୍ଚ ରକ୍ତଚାପ', diabetes: 'ମଧୁମେହ' },
    heartNote: 'ଛାତିରେ ବେଦନା, ଶ୍ୱାସକଷ୍ଟ, ଅସାମାନ୍ୟ କ୍ଲାନ୍ତି, କିମ୍ବା ବେଦନା ହାତ/ଜହ୍ନକୁ ଯିବା ଲକ୍ଷଣ ହୋଇପାରେ।',
    hyperNote: 'ଅନେକ ସମୟ ଲକ୍ଷଣ ନ ଥାଏ। ନିୟମିତ BP ପରୀକ୍ଷା ଆବଶ୍ୟକ।',
    diabetesNote: 'ବାରମ୍ବାର ପିଶାବ, ଅଧିକ ତରସ, ଧୁସର ଦେଖା, ଘାଉ ଦେରିରେ ସୁସ୍ଥ ହେବା ଲକ୍ଷଣ ଅଟେ।',
    preventionTitle: 'ପ୍ରତିରୋଧ ପଦକ୍ଷେପ',
    preventionTips: [
      'ଅଧିକାଂଶ ଦିନ 30 ମିନିଟ ଅଭ୍ୟାସ କରନ୍ତୁ।',
      'ଲୁଣ, ଚିନି ଏବଂ ପ୍ରୋସେସ୍‌ଡ ଖାଦ୍ୟ କମ କରନ୍ତୁ।',
      'ଭାଇଟାଲସ ମନିଟର କରନ୍ତୁ ଏବଂ ସମସ୍ୟା ଥିଲେ ଡାକ୍ତରଙ୍କୁ ଦେଖନ୍ତୁ।'
    ],
    emergencyLine: 'ସତର୍କତା: ହଠାତ୍ କିମ୍ବା ଗୁରୁତର ଲକ୍ଷଣ ହେଲେ ତୁରନ୍ତ ଚିକିତ୍ସା ନିଅନ୍ତୁ।'
  },
  Urdu: {
    missionTitle: 'ہمارا مشن',
    missionBody: 'Health Buddy کا مقصد احتیاطی صحت کو آسان، قابلِ فہم اور سب کے لیے قابلِ رسائی بنانا ہے۔ AI کی مدد سے رسک معلومات لوگوں کو بروقت بہتر فیصلے لینے میں مدد دیتی ہیں۔',
    awarenessTitle: 'بیماری سے آگاہی',
    awarenessIntro: 'ابتدائی آگاہی پیچیدگیوں کو کم کرتی ہے۔ AI Checkup میں شامل 3 بیماریوں کی مختصر معلومات درج ذیل ہیں۔',
    diseaseNames: { heart: 'دل کی بیماری', hyper: 'ہائی بلڈ پریشر', diabetes: 'ذیابیطس' },
    heartNote: 'سینے میں درد، سانس پھولنا، غیر معمولی تھکن، یا درد کا بازو/جبڑے تک پھیلنا اہم علامات ہیں۔',
    hyperNote: 'اکثر واضح علامات نہیں ہوتیں۔ باقاعدہ بلڈ پریشر چیک کرنا ضروری ہے۔',
    diabetesNote: 'بار بار پیشاب، زیادہ پیاس، دھندلا نظر آنا، اور زخم کا دیر سے بھرنا اہم علامات ہیں۔',
    preventionTitle: 'بچاؤ کے طریقے',
    preventionTips: [
      'زیادہ تر دن کم از کم 30 منٹ فعال رہیں۔',
      'نمک، چینی اور پراسیسڈ خوراک کم کریں۔',
      'وائٹل سائنز مانیٹر کریں اور مسئلہ برقرار رہے تو ڈاکٹر سے رجوع کریں۔'
    ],
    emergencyLine: 'انتباہ: شدید یا اچانک علامات کی صورت میں فوراً طبی امداد حاصل کریں۔'
  },
  Kashmiri: {
    missionTitle: 'یمہِ مشن',
    missionBody: 'Health Buddy ہُند مقصد چُھ احتیاطی صحت سنبھال سادٕ تہٕ سبھئک لئق قابل رسائی بناون۔ AI بنیادٕ رِسک معلومات چھ وقتس پیٹھ بہتر فیصلہ کرنہٕ منز مدد گژھان۔',
    awarenessTitle: 'بیماری آگاہی',
    awarenessIntro: 'وۄنۍ تہِ آگاهی ہیکہٕ پیچیدگی کَم کرنہٕ۔ AI Checkup منز یِم 3 حالت چھ تام معلومات۔',
    diseaseNames: { heart: 'دلہٕ ہٕنٛد مرض', hyper: 'تِیز خون دباؤ', diabetes: 'ذیابطس' },
    heartNote: 'سینس اندر درد، ساہس منٛز دِقّت، زیادٕ تھکاوٕٹ یا درد ہَتھ/جبڑس پَیٹھ پھیلن چھ اہم نشانی۔',
    hyperNote: 'اکثر صاف علامت نَہ چھ۔ باقاعدہ بلڈ پریشر چیک کَرن چھ ضروری۔',
    diabetesNote: 'بار بار پیشاب، زیادٕ پیاس، دھندلا نظر، تہٕ زخم دیرس ہیلن چھ اہم علامت۔',
    preventionTitle: 'بچاوَک طریقہ',
    preventionTips: [
      'اکثر روز کَم از کَم 30 مِنَٹ سرگرم رہو۔',
      'نمک، چینی تہٕ پروسیسڈ کھور کَم کرو۔',
      'وائٹل نشان مانیٹر کرو تہٕ مسئلہ رہن پَتہٕ ڈاکٹرس سٕتۍ مشورہ کرو۔'
    ],
    emergencyLine: 'خبردار: شدید یا اچانک علامت پےٚٹھ فوری طبی مدد حاصل کرو۔'
  }
}

export function MissionAwarenessContent() {
  const [language, setLanguage] = useState('English')

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (storedLanguage && LANGUAGE_OPTIONS.includes(storedLanguage)) {
      setLanguage(storedLanguage)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const content = useMemo(() => CONTENT[language] || CONTENT.English, [language])

  return (
    <>
      <div className="rounded-3xl bg-white dark:bg-neutral-surface-dark border border-slate-200/70 dark:border-slate-800 p-8 md:p-12 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-3">Health Buddy</p>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">{content.missionTitle}</h1>
        <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl">{content.missionBody}</p>

        <div className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Language</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLanguage(item)}
                className={
                  language === item
                    ? 'px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white'
                    : 'px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-10 rounded-2xl bg-white dark:bg-neutral-surface-dark border border-slate-200/70 dark:border-slate-800 p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">{content.awarenessTitle}</h2>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{content.awarenessIntro}</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{content.diseaseNames.heart}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{content.heartNote}</p>
          </article>
          <article className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{content.diseaseNames.hyper}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{content.hyperNote}</p>
          </article>
          <article className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{content.diseaseNames.diabetes}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{content.diabetesNote}</p>
          </article>
        </div>

        <div className="mt-8 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700 p-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{content.preventionTitle}</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300 list-disc list-inside">
            {content.preventionTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-semibold text-red-600 dark:text-red-400">{content.emergencyLine}</p>
        </div>
      </section>
    </>
  )
}
